import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/orderModel";
import User from "../models/userModel";
import Product from "../models/productModel";
import CreatorProduct from "../models/creatorProductModel";
import CreatorEarning from "../models/creatorEarningModel";
import AffiliateClick from "../models/affiliateClickModel";
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
      creatorId = cp.creator;
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
      totalPrice,
      sessionId = "guest-session",
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    const userId = req.user ? req.user._id : undefined;
    const cookies = (req as any).cookies as Record<string, string> | undefined;

    const enrichedItems = await Promise.all(
      orderItems.map(async (item: any) => {
        const attribution = await resolveAttribution(item, cookies);
        const base = { ...item };
        if (attribution) {
          base.creator = attribution.creator;
          base.commission = attribution.commission;
          base.commissionType = attribution.commissionType;
          base.commissionValue = attribution.commissionValue;
        }
        return base;
      })
    );

    const order = new Order({
      user: userId,
      orderItems: enrichedItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      sessionId: userId ? undefined : sessionId,
    });

    const createdOrder = await order.save();

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
    const identifier: any = {};
    if (req.user && req.user._id) {
      identifier.user = req.user._id;
    } else {
      identifier.sessionId = "guest-session";
    }

    const orders = await Order.find(identifier)
      .populate("orderItems.product", "description")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.status(200).json({ success: true, order });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const payOrder = async (req: IAuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    if (order.user) {
      if (!req.user || order.user.toString() !== req.user._id.toString()) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized to pay for this order" });
      }
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

export const deleteOrder = async (req: IAuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending orders can be deleted" });
    }

    if (order.user) {
      if (!req.user || order.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: "Not authorized" });
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
