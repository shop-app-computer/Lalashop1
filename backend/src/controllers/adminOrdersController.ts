import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/orderModel";

interface OrderListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

const parsePagination = (query: OrderListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

// Map UI-facing status labels (paid/shipping/cancelled/refunded/disputed/pending_payment)
// onto the backend order schema's enum (pending|processing|shipped|delivered|canceled)
// + isPaid flag. "refunded" and "disputed" don't exist in the schema yet, so
// they're surfaced via the same canceled bucket for now.
const buildStatusFilter = (status?: string): Record<string, unknown> => {
  if (!status || status === "all") return {};
  switch (status) {
    case "pending_payment":
      return { status: "pending", isPaid: false };
    case "paid":
      return { status: "processing", isPaid: true };
    case "shipping":
      return { status: "shipped" };
    case "delivered":
      return { status: "delivered" };
    case "cancelled":
    case "canceled":
      return { status: "canceled" };
    case "refunded":
      return { status: "canceled", isPaid: true };
    case "disputed":
      return { status: { $in: ["processing", "shipped"] }, "shippingAddress.disputeFlag": true };
    default:
      return { status };
  }
};

const toUiStatus = (status: string, isPaid: boolean): string => {
  if (status === "pending") return isPaid ? "paid" : "pending_payment";
  if (status === "processing") return "paid";
  if (status === "shipped") return "shipping";
  if (status === "delivered") return "delivered";
  if (status === "canceled") return isPaid ? "refunded" : "cancelled";
  return status;
};

export const adminListOrders = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as OrderListQuery);
    const { search, status, startDate, endDate } = req.query as OrderListQuery;

    const filter: Record<string, unknown> = { ...buildStatusFilter(status) };

    if (startDate || endDate) {
      const range: Record<string, Date> = {};
      if (startDate) range.$gte = new Date(startDate);
      if (endDate) range.$lte = new Date(endDate);
      filter.createdAt = range;
    }

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      const orClauses: Record<string, unknown>[] = [
        { "shippingAddress.fullName": re },
        { "shippingAddress.phone": re },
        { paymentMethod: re },
      ];
      if (mongoose.isValidObjectId(search)) {
        orClauses.push({ _id: new mongoose.Types.ObjectId(search) });
      }
      filter.$or = orClauses;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email customId")
        .populate("orderItems.seller", "name email customId")
        .lean(),
      Order.countDocuments(filter),
    ]);

    const data = orders.map((o: any) => {
      const firstSeller = o.orderItems?.[0]?.seller;
      const sellerName = firstSeller?.name || firstSeller?.email || "—";
      const customerName = o.user?.name || o.shippingAddress?.fullName || "Guest";
      const customerId = o.user?.customId || o.user?._id?.toString() || "";
      return {
        _id: o._id,
        id: o._id.toString(),
        customer: customerName,
        customerId,
        shop: sellerName,
        shopId: firstSeller?._id?.toString() || "",
        itemCount: o.orderItems?.length || 0,
        amount: o.totalPrice,
        paymentMethod: o.paymentMethod || "—",
        isPaid: o.isPaid,
        isDelivered: o.isDelivered,
        rawStatus: o.status,
        status: toUiStatus(o.status, !!o.isPaid),
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate("user", "name email phone customId")
      .populate("orderItems.product", "name image")
      .populate("orderItems.seller", "name email customId")
      .populate("orderItems.creator", "name username customId")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const ui = {
      ...order,
      status: toUiStatus((order as any).status, !!(order as any).isPaid),
      rawStatus: (order as any).status,
    };

    res.status(200).json({ success: true, data: ui });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const { status, isPaid, isDelivered } = req.body as {
      status?: string;
      isPaid?: boolean;
      isDelivered?: boolean;
    };

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (typeof status === "string") {
      const allowed = ["pending", "processing", "shipped", "delivered", "canceled"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      order.status = status as any;
      if (status === "delivered") {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }
    }

    if (typeof isPaid === "boolean") {
      order.isPaid = isPaid;
      if (isPaid && !order.paidAt) order.paidAt = new Date();
    }

    if (typeof isDelivered === "boolean") {
      order.isDelivered = isDelivered;
      if (isDelivered && !order.deliveredAt) order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: {
        _id: order._id,
        status: order.status,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminOrderStats = async (_req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, cancelled, refunded, revenueAgg] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ status: "canceled", isPaid: false }),
      Order.countDocuments({ status: "canceled", isPaid: true }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        cancelled,
        refunded,
        disputes: 0,
        totalRevenue: revenueAgg[0]?.total ?? 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
