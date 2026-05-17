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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    // Strict ownership — no guest pay flow. The previous "if order.user exists,
    // check ownership; else allow" path let any unauthenticated caller mark a
    // guest order paid (which credited the seller balance).
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to pay for this order" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "processing";

    const updatedOrder = await order.save();

    // Credit seller balance.
    for (const item of order.orderItems) {
      if (item.seller) {
        await User.findByIdAndUpdate(item.seller, {
          $inc: { balance: item.price * item.qty },
        });
      }

      // Record creator earning as pending. Bumps creator clicks/conversions counters.
      if (item.creator && item.commission && item.commission > 0) {
        try {
          await CreatorEarning.create({
            creator: item.creator,
            order: order._id,
            orderItemId: (item as any)._id,
            product: item.product,
            seller: item.seller,
            amount: item.commission,
            status: "pending",
          });
          await CreatorProduct.updateOne(
            { creator: item.creator, product: item.product },
            { $inc: { conversions: 1 } }
          );
          await AffiliateClick.findOneAndUpdate(
            {
              creator: item.creator,
              product: item.product,
              converted: false,
            },
            { $set: { converted: true, order: order._id } },
            { sort: { createdAt: -1 } }
          );
        } catch {
          // earning already recorded — ignore duplicate
        }
      }
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/deliver  — settles creator earnings and credits creator balance.
export const deliverOrder = async (req: IAuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (!order.isPaid) {
      return res.status(400).json({ success: false, message: "Order not paid yet" });
    }
    if (order.isDelivered) {
      return res.status(400).json({ success: false, message: "Order already delivered" });
    }

    // Authorization: seller of any item OR admin.
    const isSellerInOrder = order.orderItems.some(
      (it: any) => it.seller && req.user && it.seller.toString() === req.user._id.toString()
    );
    if (!req.user?.isAdmin && !isSellerInOrder) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = "delivered";
    await order.save();

    const pending = await CreatorEarning.find({ order: order._id, status: "pending" });
    for (const earning of pending) {
      earning.status = "settled";
      earning.settledAt = new Date();
      await earning.save();
      await User.findByIdAndUpdate(earning.creator, {
        $inc: { balance: earning.amount },
      });
      await CreatorProduct.updateOne(
        { creator: earning.creator, product: earning.product },
        { $inc: { totalEarned: earning.amount } }
      );
    }

    res.status(200).json({ success: true, order });
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

    order.status = status as typeof order.status;
    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      // Settle creator earnings on delivery — same logic as deliverOrder.
      const pending = await CreatorEarning.find({ order: order._id, status: "pending" });
      for (const earning of pending) {
        earning.status = "settled";
        earning.settledAt = new Date();
        await earning.save();
        await User.findByIdAndUpdate(earning.creator, { $inc: { balance: earning.amount } });
        await CreatorProduct.updateOne(
          { creator: earning.creator, product: earning.product },
          { $inc: { totalEarned: earning.amount } }
        );
      }
    }
    await order.save();

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
