import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import PaymentMethod from "../models/paymentMethodModel";
import PaymentSlip from "../models/paymentSlipModel";
import Order from "../models/orderModel";
import User from "../models/userModel";
import Notification from "../models/notificationModel";
import { generatePromptPayQrDataUrl } from "../utils/promptpay";
import { IAuthRequest } from "../middlewares/authMiddleware";
import { settleItemCreatorEarning } from "./orderController";

// ─── Public — what customers see at checkout ─────────────────────────

export const listActiveMethods = async (_req: Request, res: Response) => {
  try {
    const methods = await PaymentMethod.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select("kind label bankName accountNumber accountName promptpayId qrImageUrl notes");
    res.json({ success: true, data: methods });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/payment-methods/promptpay-qr/:methodId/:orderId
// Returns a base64 PNG data URL of the PromptPay QR for that exact order
// amount. Restricted to the order's owner so QR isn't enumerable.
export const getPromptPayQr = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { methodId, orderId } = req.params;
    if (!isValidObjectId(methodId) || !isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const [method, order] = await Promise.all([
      PaymentMethod.findOne({ _id: methodId, isActive: true, kind: "promptpay" }),
      Order.findOne({ _id: orderId, user: req.user._id }),
    ]);
    if (!method || !method.promptpayId) {
      return res.status(404).json({ success: false, message: "PromptPay method not found" });
    }
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const dataUrl = await generatePromptPayQrDataUrl(method.promptpayId, order.totalPrice);
    res.json({
      success: true,
      data: {
        dataUrl,
        amount: order.totalPrice,
        promptpayId: method.promptpayId,
        accountName: method.accountName,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ─── Customer — submit payment proof ─────────────────────────────────

export const submitPaymentSlip = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { orderId } = req.params;
    const { paymentMethodId, slipImageUrl, transferAmount, transferRef, transferredAt, buyerNote } =
      req.body as {
        paymentMethodId: string;
        slipImageUrl: string;
        transferAmount: number;
        transferRef?: string;
        transferredAt?: string;
        buyerNote?: string;
      };

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    if (!slipImageUrl || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "slipImageUrl and paymentMethodId are required",
      });
    }
    if (!Number.isFinite(Number(transferAmount)) || Number(transferAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid transfer amount" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    const method = await PaymentMethod.findById(paymentMethodId);
    if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });

    const slip = await PaymentSlip.create({
      order: order._id,
      user: req.user._id,
      paymentMethod: method._id,
      slipImageUrl,
      transferAmount: Number(transferAmount),
      transferRef: String(transferRef || ""),
      transferredAt: transferredAt ? new Date(transferredAt) : undefined,
      buyerNote: String(buyerNote || ""),
      status: "pending",
    });

    res.status(201).json({ success: true, data: slip });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/orders/:id/slips — customer can see their own submitted slips
export const listOrderSlips = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const slips = await PaymentSlip.find({ order: id })
      .sort({ createdAt: -1 })
      .populate("paymentMethod", "label bankName accountNumber kind")
      .lean();
    res.json({ success: true, data: slips });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ─── Admin — manage payment methods ──────────────────────────────────

export const adminListMethods = async (_req: Request, res: Response) => {
  try {
    const items = await PaymentMethod.find({}).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const adminCreateMethod = async (req: Request, res: Response) => {
  try {
    const item = await PaymentMethod.create(req.body || {});
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const adminUpdateMethod = async (req: Request, res: Response) => {
  try {
    const item = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const adminDeleteMethod = async (req: Request, res: Response) => {
  try {
    const item = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: { _id: item._id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ─── Admin — verify payment slips ────────────────────────────────────

export const adminListSlips = async (req: Request, res: Response) => {
  try {
    const status = String(req.query.status || "all");
    const filter: Record<string, unknown> = {};
    if (status !== "all") filter.status = status;

    const slips = await PaymentSlip.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name email customId profileImage")
      .populate("order", "totalPrice status isPaid createdAt")
      .populate("paymentMethod", "label kind bankName accountNumber")
      .populate("reviewedBy", "name email")
      .lean();
    res.json({ success: true, data: slips });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const adminGetSlipStats = async (_req: Request, res: Response) => {
  try {
    const agg = await PaymentSlip.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$transferAmount" } } },
    ]);
    const stats: Record<string, { count: number; total: number }> = {
      pending: { count: 0, total: 0 },
      verified: { count: 0, total: 0 },
      rejected: { count: 0, total: 0 },
    };
    for (const row of agg) {
      stats[row._id] = { count: row.count, total: row.total };
    }
    res.json({ success: true, data: stats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// PUT /api/admin/payment-slips/:id
// Body: { action: "verify" | "reject", reason?: string }
// Verifying marks the order as paid AND credits seller balance.
//
// Concurrency model: both the slip status flip and the order isPaid flip use
// atomic findOneAndUpdate with a guard on the prior state. If two admins click
// "verify" at the same moment, only one wins each transition — so the seller
// balance is credited exactly once, no matter how many requests race.
export const adminReviewSlip = async (req: IAuthRequest, res: Response) => {
  try {
    const action = String(req.body.action || "");
    const reason = String(req.body.reason || "");
    if (!["verify", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    if (action === "reject") {
      const slip = await PaymentSlip.findOneAndUpdate(
        { _id: req.params.id, status: "pending" },
        {
          $set: {
            status: "rejected",
            rejectionReason: reason || "Slip could not be verified",
            reviewedAt: new Date(),
            reviewedBy: req.user?._id as Types.ObjectId,
          },
        },
        { new: true },
      );
      if (!slip) {
        const existing = await PaymentSlip.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: "Slip not found" });
        return res
          .status(409)
          .json({ success: false, message: `Slip already ${existing.status}` });
      }

      await Notification.create({
        user: slip.user,
        type: "order_update",
        title: "Payment slip rejected",
        body: `Your payment slip for order #${String(slip.order)
          .slice(-8)
          .toUpperCase()} was rejected. Reason: ${slip.rejectionReason}. Please re-upload a clearer slip.`,
        link: `/orders/orders`,
      });

      return res.json({ success: true, data: slip });
    }

    // action === "verify" — atomic claim so a re-click / concurrent admin
    // can't reach the credit block twice for the same slip.
    const slip = await PaymentSlip.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "verified",
          rejectionReason: "",
          reviewedAt: new Date(),
          reviewedBy: req.user?._id as Types.ObjectId,
        },
      },
      { new: true },
    );
    if (!slip) {
      const existing = await PaymentSlip.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: "Slip not found" });
      return res
        .status(409)
        .json({ success: false, message: `Slip already ${existing.status}` });
    }

    // Atomic order flip — only one slip (across any race) can mark a given
    // order paid, even if multiple slips exist. paidOrder is null if the
    // order was already paid; in that case the slip stays verified (admin
    // intent honored) but we do NOT double-credit the seller.
    const paidOrder = await Order.findOneAndUpdate(
      { _id: slip.order, isPaid: false },
      {
        $set: {
          isPaid: true,
          paidAt: new Date(),
          status: "processing",
        },
      },
      { new: true },
    );

    if (paidOrder) {
      for (const item of paidOrder.orderItems as unknown as Array<{
        _id?: Types.ObjectId;
        seller: Types.ObjectId;
        product: Types.ObjectId;
        creator?: Types.ObjectId;
        price: number;
        qty: number;
      }>) {
        const lineTotal = (item.price || 0) * (item.qty || 0);
        if (lineTotal > 0) {
          await User.updateOne(
            { _id: item.seller },
            { $inc: { balance: lineTotal } },
          );
        }
        // Settle creator earning at slip-verify time. Previously this only
        // happened in orderController.payOrder, which the customer slip flow
        // never calls — so creators were silently missing every commission
        // for orders paid via slip upload.
        await settleItemCreatorEarning(item, paidOrder._id as Types.ObjectId);
      }
    }

    await Notification.create({
      user: slip.user,
      type: "order_update",
      title: "Payment verified",
      body: `We've confirmed your transfer of ฿${slip.transferAmount.toLocaleString()} for order #${String(
        slip.order,
      )
        .slice(-8)
        .toUpperCase()}. Your order is now being processed.`,
      link: `/orders/orders`,
    });

    res.json({ success: true, data: slip });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};
