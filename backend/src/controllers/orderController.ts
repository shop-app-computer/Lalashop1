import { Response } from "express";
import mongoose from "mongoose";
import Order from "../models/orderModel";
import User from "../models/userModel";
import Product from "../models/productModel";
import CreatorProduct from "../models/creatorProductModel";
import CreatorEarning from "../models/creatorEarningModel";
import AffiliateClick from "../models/affiliateClickModel";
import PaymentSlip from "../models/paymentSlipModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const computeCommission = (
  price: number,
  qty: number,
  type: "percent" | "fixed",
  value: number
): number => {
  if (!value || value <= 0) return 0;
  const lineTotal = price * qty;
  if (type === "fixed") return Math.max(0, value * qty);
  return Math.max(0, (lineTotal * value) / 100);
};

// Create a pending CreatorEarning for one order item, using the CURRENT
// product commission rate (not the snapshot stored on the order item at
// create time) — that's #25. Also flips the matching affiliate click to
// "converted" and bumps the CreatorProduct conversions counter. Idempotent:
// the (order, orderItemId) unique index on CreatorEarning means a duplicate
// pay call is a no-op (the try/catch swallows the duplicate-key error).
//
// Exported so the slip-verify path in paymentController can settle the
// same way — previously only payOrder did this, so customers who paid via
// the slip flow never produced creator earnings.
// Flip ONE CreatorEarning row pending→settled and credit the creator. Used
// when an order is delivered. The atomic findOneAndUpdate with status:"pending"
// guard means concurrent deliverOrder / updateMyOrderStatus calls can't both
// settle the same earning row and double-credit the creator.
export const payOutPendingEarning = async (
  earningId: mongoose.Types.ObjectId,
): Promise<void> => {
  const settled = await CreatorEarning.findOneAndUpdate(
    { _id: earningId, status: "pending" },
    { $set: { status: "settled", settledAt: new Date() } },
    { new: true },
  );
  if (!settled) return; // already settled (or canceled) by a concurrent call

  await User.findByIdAndUpdate(settled.creator, {
    $inc: { balance: settled.amount },
  });
  await CreatorProduct.updateOne(
    { creator: settled.creator, product: settled.product },
    { $inc: { totalEarned: settled.amount } },
  );
};

export const settleItemCreatorEarning = async (
  item: {
    _id?: mongoose.Types.ObjectId;
    creator?: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    price: number;
    qty: number;
  },
  orderId: mongoose.Types.ObjectId,
): Promise<void> => {
  if (!item.creator) return;

  const product = await Product.findById(item.product).select(
    "commissionType commissionValue allowCreators",
  );
  if (!product || !product.allowCreators) return;

  const type = (product.commissionType as "percent" | "fixed") || "percent";
  const value = product.commissionValue || 0;
  const commission = computeCommission(
    Number(item.price) || 0,
    Number(item.qty) || 0,
    type,
    value,
  );
  if (commission <= 0) return;

  try {
    await CreatorEarning.create({
      creator: item.creator,
      order: orderId,
      orderItemId: item._id,
      product: item.product,
      seller: item.seller,
      amount: commission,
      status: "pending",
    });
    await CreatorProduct.updateOne(
      { creator: item.creator, product: item.product },
      { $inc: { conversions: 1 } },
    );
    await AffiliateClick.findOneAndUpdate(
      {
        creator: item.creator,
        product: item.product,
        converted: false,
      },
      { $set: { converted: true, order: orderId } },
      { sort: { createdAt: -1 } },
    );
  } catch {
    // duplicate (order, orderItemId) — earning already recorded
  }
};

// Resolve creator attribution for one order item.
// Priority: explicit body.affiliateCode > body.creator > affiliate cookie.
const resolveAttribution = async (
  item: any,
  cookies: Record<string, string> | undefined
): Promise<{
  creator?: mongoose.Types.ObjectId;
  commissionType: "percent" | "fixed";
  commissionValue: number;
  commission: number;
} | null> => {
  const product = await Product.findById(item.product).select(
    "allowCreators commissionType commissionValue"
  );
  if (!product || !product.allowCreators) return null;

  const commissionType = (product.commissionType as "percent" | "fixed") || "percent";
  const commissionValue = product.commissionValue || 0;

  let creatorId: mongoose.Types.ObjectId | undefined;
  let affCode: string | undefined =
    item.affiliateCode || cookies?.[`aff_${item.product}`];

  if (affCode) {
    const cp = await CreatorProduct.findOne({ affiliateCode: affCode }).lean();
    if (cp && cp.product.toString() === item.product.toString()) {
      // Only attribute if there's an unexpired AffiliateClick for this
      // creator+product pair. The cookie itself has maxAge so browsers stop
      // sending it after the window, but body-supplied affiliateCode bypasses
      // that — this guard makes the attribution window authoritative.
      const validClick = await AffiliateClick.findOne({
        creator: cp.creator,
        product: cp.product,
        expiresAt: { $gte: new Date() },
      })
        .select("_id")
        .lean();
      if (validClick) {
        creatorId = cp.creator;
      }
    }
  }
  if (!creatorId && item.creator) {
    creatorId = new mongoose.Types.ObjectId(item.creator);
  }

  if (!creatorId) return null;

  const commission = computeCommission(
    Number(item.price) || 0,
    Number(item.qty) || 0,
    commissionType,
    commissionValue
  );

  return { creator: creatorId, commissionType, commissionValue, commission };
};

export const createOrder = async (req: IAuthRequest, res: Response) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      sessionId = "guest-session",
      channel,
      posTerminal,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    const userId = req.user ? req.user._id : undefined;
    const cookies = (req as any).cookies as Record<string, string> | undefined;
    const isPos = channel === "pos";

    if (isPos) {
      if (!req.user?._id) {
        return res
          .status(401)
          .json({ success: false, message: "POS orders require seller authentication" });
      }
      if (!req.user.isSeller) {
        return res
          .status(403)
          .json({ success: false, message: "Only sellers can create POS orders" });
      }
    }

    // Server is the source of truth for price/seller/name. The client's copies
    // of these fields are intentionally discarded — trusting them would let a
    // tampered payload pay 1 baht for a 1000-baht product.
    const enrichedItems = await Promise.all(
      orderItems.map(async (item: any) => {
        const product = await Product.findById(item.product).select(
          "name image price seller status",
        );
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }
        if (product.status === "Archived") {
          throw new Error(`Product "${product.name}" is no longer available`);
        }

        const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
        const serverPrice = Number(product.price) || 0;
        const baseImage = Array.isArray(product.image) ? product.image[0] : product.image;

        const enriched: any = {
          product: product._id,
          seller: product.seller,
          name: product.name,
          image: baseImage,
          price: serverPrice,
          qty,
          description: typeof item.description === "string" ? item.description : "",
        };

        // Affiliate commission only applies to web sales. Re-run attribution with
        // the server price so commission percent/fixed is also tamper-proof.
        if (!isPos) {
          const attribution = await resolveAttribution(
            { ...item, price: serverPrice, qty },
            cookies,
          );
          if (attribution) {
            enriched.creator = attribution.creator;
            enriched.commission = attribution.commission;
            enriched.commissionType = attribution.commissionType;
            enriched.commissionValue = attribution.commissionValue;
          }
        }
        return enriched;
      }),
    );

    // POS ownership check now uses the DB seller, not the client field.
    if (isPos) {
      const allOwn = enrichedItems.every(
        (item) => String(item.seller) === String(req.user._id),
      );
      if (!allOwn) {
        return res.status(400).json({
          success: false,
          message: "POS orders may only contain items from your own catalog",
        });
      }
    }

    const computedTotal = enrichedItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    const order = new Order({
      user: userId,
      orderItems: enrichedItems,
      shippingAddress,
      paymentMethod,
      totalPrice: computedTotal,
      sessionId: userId ? undefined : sessionId,
      channel: isPos ? "pos" : "web",
      posTerminal: isPos ? (typeof posTerminal === "string" ? posTerminal : "default") : undefined,
      // POS sales are paid in person at the terminal — mark settled immediately.
      isPaid: isPos ? true : false,
      paidAt: isPos ? new Date() : undefined,
      status: isPos ? "delivered" : "pending",
      isDelivered: isPos ? true : false,
      deliveredAt: isPos ? new Date() : undefined,
    });

    const createdOrder = await order.save();

    // POS revenue routes to the seller's posRevenue (non-withdrawable).
    if (isPos && req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { posRevenue: computedTotal },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: createdOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySellerOrders = async (req: IAuthRequest, res: Response) => {
  try {
    const orders = await Order.find({
      "orderItems.seller": req.user._id,
    }).sort({ createdAt: -1 });

    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orderItems = orderObj.orderItems.filter(
        (item: any) => item.seller.toString() === req.user._id.toString()
      );
      return orderObj;
    });

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/creator
// All orders containing items where creator = current user.
export const getMyCreatorOrders = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const orders = await Order.find({
      "orderItems.creator": req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(200);

    const result = orders.map((order) => {
      const obj = order.toObject() as any;
      obj.orderItems = obj.orderItems.filter(
        (item: any) =>
          item.creator && item.creator.toString() === req.user._id.toString()
      );
      return obj;
    });

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "description")
      .populate("orderItems.seller", "name username profileImage customId")
      .sort({ createdAt: -1 })
      .lean();

    // Attach the latest payment slip per order so the UI can surface
    // "Awaiting verification" / "Slip rejected" states without an extra
    // round-trip per order.
    const orderIds = orders.map((o: any) => o._id);
    const slips = await PaymentSlip.find({ order: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .select("order status rejectionReason transferAmount createdAt")
      .lean();
    const latestSlipByOrder = new Map<string, any>();
    for (const s of slips) {
      const key = String(s.order);
      if (!latestSlipByOrder.has(key)) latestSlipByOrder.set(key, s);
    }
    const enriched = orders.map((o: any) => ({
      ...o,
      slip: latestSlipByOrder.get(String(o._id)) || null,
    }));

    res.status(200).json({ success: true, orders: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Authorization: buyer, any seller in the order, or admin. Anyone else
    // gets 403 — guessing an order id should not leak shipping address,
    // payment method, or line items.
    const userId = req.user._id.toString();
    const isBuyer = order.user && order.user.toString() === userId;
    const isSellerInOrder = order.orderItems.some(
      (it: any) => it.seller && it.seller.toString() === userId,
    );
    if (!isBuyer && !isSellerInOrder && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const payOrder = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Ownership check needs the order anyway, so load it first and verify
    // before claiming. (Atomic flip alone can't authorize.)
    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (!existing.user || existing.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to pay for this order" });
    }

    // Atomic claim — only the first request flips isPaid:false → true. Two
    // concurrent pays from the same buyer can't both reach the credit block
    // and double the seller's balance.
    const paidOrder = await Order.findOneAndUpdate(
      { _id: existing._id, isPaid: false },
      { $set: { isPaid: true, paidAt: new Date(), status: "processing" } },
      { new: true },
    );
    if (!paidOrder) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    // Credit seller balance + record pending creator earning at the CURRENT
    // commission rate (the snapshot on the order item is informational only).
    for (const item of paidOrder.orderItems) {
      if (item.seller) {
        await User.findByIdAndUpdate(item.seller, {
          $inc: { balance: item.price * item.qty },
        });
      }
      await settleItemCreatorEarning(
        item as unknown as Parameters<typeof settleItemCreatorEarning>[0],
        paidOrder._id as mongoose.Types.ObjectId,
      );
    }

    res.status(200).json({ success: true, order: paidOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/deliver  — settles creator earnings and credits creator balance.
export const deliverOrder = async (req: IAuthRequest, res: Response) => {
  try {
    // Load for authorization + isPaid precondition. Atomic flip below
    // protects against concurrent deliveries double-crediting creators.
    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (!existing.isPaid) {
      return res.status(400).json({ success: false, message: "Order not paid yet" });
    }

    // Authorization: seller of any item OR admin.
    const isSellerInOrder = existing.orderItems.some(
      (it: any) => it.seller && req.user && it.seller.toString() === req.user._id.toString()
    );
    if (!req.user?.isAdmin && !isSellerInOrder) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Atomic claim. Loser returns 400; only the winner runs the settlement
    // loop. The per-earning settle helper is itself atomic, so even if two
    // somehow reach the loop the creator still gets credited exactly once.
    const delivered = await Order.findOneAndUpdate(
      { _id: existing._id, isDelivered: false },
      { $set: { isDelivered: true, deliveredAt: new Date(), status: "delivered" } },
      { new: true },
    );
    if (!delivered) {
      return res.status(400).json({ success: false, message: "Order already delivered" });
    }

    const pending = await CreatorEarning.find({
      order: delivered._id,
      status: "pending",
    }).select("_id");
    for (const earning of pending) {
      await payOutPendingEarning(earning._id as mongoose.Types.ObjectId);
    }

    res.status(200).json({ success: true, order: delivered });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/seller-status
// Lets the seller move one of their own orders along the fulfilment timeline.
// Sellers can ship a paid order, mark a shipped order delivered, or cancel
// an order that hasn't shipped yet. Admins can still use the admin endpoint
// for everything else (refunds, disputes, etc.).
export const updateMyOrderStatus = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { status } = req.body as { status?: string };
    const allowed = ["processing", "shipped", "delivered", "canceled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowed.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Authorization — must be seller of at least one item, or admin override.
    const sellerId = req.user._id.toString();
    const isSellerInOrder = order.orderItems.some(
      (it: any) => it.seller && it.seller.toString() === sellerId
    );
    if (!req.user?.isAdmin && !isSellerInOrder) {
      return res.status(403).json({ success: false, message: "Not your order" });
    }

    // Guardrails on transitions so the seller can't ship an unpaid order or
    // un-deliver a delivered one (which would mess with creator settlements).
    const current = order.status;
    if (current === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order is already delivered — cannot change status",
      });
    }
    if (status === "shipped" && !order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Order isn't paid yet — admin must verify the slip first",
      });
    }
    if (status === "delivered" && current !== "shipped") {
      return res.status(400).json({
        success: false,
        message: "Mark the order as shipped before delivering",
      });
    }

    if (status === "delivered") {
      // Atomic flip so concurrent "deliver" requests (this endpoint OR
      // deliverOrder) can't both reach the earning-settlement loop and
      // double-credit creators.
      const delivered = await Order.findOneAndUpdate(
        { _id: order._id, isDelivered: false },
        {
          $set: {
            status: "delivered",
            isDelivered: true,
            deliveredAt: new Date(),
          },
        },
        { new: true },
      );
      if (!delivered) {
        return res.status(400).json({
          success: false,
          message: "Order is already delivered — cannot change status",
        });
      }

      const pending = await CreatorEarning.find({
        order: delivered._id,
        status: "pending",
      }).select("_id");
      for (const earning of pending) {
        await payOutPendingEarning(earning._id as mongoose.Types.ObjectId);
      }

      // Refresh local reference so the response below reflects the atomic
      // update (the original `order` doc is stale after findOneAndUpdate).
      order.status = delivered.status;
      order.isDelivered = delivered.isDelivered;
      order.deliveredAt = delivered.deliveredAt;
    } else {
      order.status = status as typeof order.status;
      await order.save();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: order._id,
        status: order.status,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending orders can be deleted" });
    }

    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
