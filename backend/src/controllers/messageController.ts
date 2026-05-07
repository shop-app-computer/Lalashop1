import { Response } from "express";
import { Types, isValidObjectId } from "mongoose";
import Conversation from "../models/conversationModel";
import Message from "../models/messageModel";
import User from "../models/userModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const requireUser = (req: IAuthRequest, res: Response): string | null => {
  const id = req.user?._id?.toString();
  if (!id) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return id;
};

// GET /api/messages/conversations
// Returns the user's conversations sorted by lastMessageAt desc, with the
// other-participant resolved into a tiny user shape and unread count.
export const listConversations = async (req: IAuthRequest, res: Response) => {
  try {
    const me = requireUser(req, res);
    if (!me) return;
    const conversations = await Conversation.find({ participants: me })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("participants", "name username profileImage")
      .lean();

    const data = conversations.map((c) => {
      const others = (c.participants || []).filter(
        (p: { _id: Types.ObjectId }) => String(p._id) !== me
      );
      const unreadMap = (c.unread || {}) as Record<string, number>;
      return {
        _id: c._id,
        peer: others[0] || null,
        participants: c.participants,
        lastMessageText: c.lastMessageText || "",
        lastMessageAt: c.lastMessageAt,
        unreadCount: Number(unreadMap[me] || 0),
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// POST /api/messages/conversations
// Body: { peerId: string }
// Returns the existing conversation between (me, peer) or creates one.
export const startConversation = async (req: IAuthRequest, res: Response) => {
  try {
    const me = requireUser(req, res);
    if (!me) return;
    const peerId = String(req.body.peerId || "");
    if (!isValidObjectId(peerId)) {
      res.status(400).json({ success: false, message: "Invalid peerId" });
      return;
    }
    if (peerId === me) {
      res.status(400).json({ success: false, message: "Cannot DM yourself" });
      return;
    }
    const peer = await User.findById(peerId).select("_id name username profileImage");
    if (!peer) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    let conv = await Conversation.findOne({
      participants: { $all: [me, peerId], $size: 2 },
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [new Types.ObjectId(me), new Types.ObjectId(peerId)],
        unread: new Map(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: conv._id,
        peer: {
          _id: peer._id,
          name: peer.name,
          username: peer.username,
          profileImage: peer.profileImage,
        },
        lastMessageText: conv.lastMessageText || "",
        lastMessageAt: conv.lastMessageAt,
        unreadCount: 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/messages/conversations/:id/messages
// Returns the messages in a conversation (newest first, paginated).
export const listMessages = async (req: IAuthRequest, res: Response) => {
  try {
    const me = requireUser(req, res);
    if (!me) return;
    const convId = req.params.id;
    if (!isValidObjectId(convId)) {
      res.status(400).json({ success: false, message: "Invalid conversation id" });
      return;
    }

    const conv = await Conversation.findOne({ _id: convId, participants: me });
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const before = req.query.before ? new Date(String(req.query.before)) : null;

    const filter: Record<string, unknown> = { conversation: convId };
    if (before) filter.createdAt = { $lt: before };

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name username profileImage")
      .lean();

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// POST /api/messages/conversations/:id/messages
// Body: { body, kind?, imageUrl?, productContext? }
export const sendMessage = async (req: IAuthRequest, res: Response) => {
  try {
    const me = requireUser(req, res);
    if (!me) return;
    const convId = req.params.id;
    if (!isValidObjectId(convId)) {
      res.status(400).json({ success: false, message: "Invalid conversation id" });
      return;
    }

    const body = String(req.body.body || "").trim();
    const allowedKinds = ["text", "image", "product"] as const;
    const requested = String(req.body.kind || "text");
    const kind = (allowedKinds as readonly string[]).includes(requested) ? requested : "text";
    const imageUrl = String(req.body.imageUrl || "");
    const productContextRaw = req.body.productContext;

    if (kind === "text" && !body) {
      res.status(400).json({ success: false, message: "Message body is required" });
      return;
    }
    if (kind === "image" && !imageUrl) {
      res.status(400).json({ success: false, message: "Image URL is required" });
      return;
    }
    if (kind === "product" && (!productContextRaw || !productContextRaw.productId)) {
      res.status(400).json({ success: false, message: "productContext.productId is required" });
      return;
    }

    const conv = await Conversation.findOne({ _id: convId, participants: me });
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const productContext =
      productContextRaw && productContextRaw.productId
        ? {
            productId: productContextRaw.productId,
            name: String(productContextRaw.name || ""),
            image: String(productContextRaw.image || ""),
            price: Number(productContextRaw.price) || 0,
            slug: productContextRaw.slug ? String(productContextRaw.slug) : undefined,
          }
        : undefined;

    const msg = await Message.create({
      conversation: convId,
      sender: me,
      body,
      kind,
      imageUrl,
      productContext,
      readBy: [me],
    });

    // Bump conversation metadata + unread counters for every other participant.
    conv.lastMessage = msg._id as Types.ObjectId;
    conv.lastMessageAt = msg.createdAt;
    const preview =
      kind === "image"
        ? "📷 Photo"
        : kind === "product"
        ? `🛍️ ${productContext?.name || "Product"}${body ? ` — ${body}` : ""}`
        : body;
    conv.lastMessageText = preview.slice(0, 200);
    if (!conv.unread) conv.unread = new Map();
    for (const pid of conv.participants) {
      const key = String(pid);
      if (key === me) {
        conv.unread.set(key, 0);
      } else {
        conv.unread.set(key, (conv.unread.get(key) || 0) + 1);
      }
    }
    await conv.save();

    const populated = await Message.findById(msg._id).populate(
      "sender",
      "name username profileImage"
    );

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// POST /api/messages/conversations/:id/read
// Marks the conversation as read for the requesting user.
export const markRead = async (req: IAuthRequest, res: Response) => {
  try {
    const me = requireUser(req, res);
    if (!me) return;
    const convId = req.params.id;
    if (!isValidObjectId(convId)) {
      res.status(400).json({ success: false, message: "Invalid conversation id" });
      return;
    }

    const conv = await Conversation.findOne({ _id: convId, participants: me });
    if (!conv) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    if (!conv.unread) conv.unread = new Map();
    conv.unread.set(me, 0);
    await conv.save();

    await Message.updateMany(
      { conversation: convId, readBy: { $ne: me } },
      { $addToSet: { readBy: me } }
    );

    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/messages/unread-summary
// Returns total unread DMs + unread Notifications so the Globe icon can show
// a single composite badge.
export const unreadSummary = async (req: IAuthRequest, res: Response) => {
  try {
    const me = requireUser(req, res);
    if (!me) return;

    const Notification = (await import("../models/notificationModel")).default;
    const [conversations, notifications] = await Promise.all([
      Conversation.find({ participants: me }).select("unread").lean(),
      Notification.countDocuments({ user: me, read: false }),
    ]);

    let messages = 0;
    for (const c of conversations) {
      const map = (c.unread || {}) as Record<string, number>;
      messages += Number(map[me] || 0);
    }

    res.json({
      success: true,
      data: {
        messages,
        notifications,
        total: messages + notifications,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};
