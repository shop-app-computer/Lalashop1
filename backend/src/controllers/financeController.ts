import { Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import Refund from "../models/refundModel";
import Order from "../models/orderModel";
import Withdraw from "../models/withdrawModel";
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

// ─── Refunds ─────────────────────────────────────────────────────────

export const listRefunds = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const items = await Refund.find({ shop: shopId })
      .populate("customer", "name username email profileImage")
      .populate("order", "totalPrice items createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const decideRefund = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid refund id" });
    }
    const action = String(req.body.action || "");
    const note = String(req.body.note || "");
    if (!["approve", "reject", "complete"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const refund = await Refund.findOne({ _id: id, shop: shopId });
    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund not found" });
    }

    // Refund amount must not exceed what the buyer actually paid for this
    // order. Checked at decision time so a tampered refund row can't drain
    // more than the order was ever worth.
    const order = await Order.findById(refund.order).select("totalPrice");
    if (order && refund.amount > Number(order.totalPrice)) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (${refund.amount}) exceeds order total (${order.totalPrice})`,
      });
    }

    if (action === "approve") {
      if (refund.status !== "requested") {
        return res.status(409).json({
          success: false,
          message: `Cannot approve a refund in status "${refund.status}"`,
        });
      }
      // Atomic balance deduction — only succeeds if the seller actually has
      // the funds right now. The previous read-then-write let two admins
      // approving the same refund double-debit, and silently skipped the
      // deduction when balance was insufficient (refund went to "approved"
      // anyway, leaving the seller free to withdraw the disputed funds).
      const deducted = await User.findOneAndUpdate(
        { _id: shopId, balance: { $gte: refund.amount } },
        { $inc: { balance: -refund.amount } },
      );
      if (!deducted) {
        return res.status(400).json({
          success: false,
          message: "Insufficient seller balance to cover this refund",
        });
      }
      refund.status = "approved";
    } else if (action === "reject") {
      if (refund.status !== "requested") {
        return res.status(409).json({
          success: false,
          message: `Cannot reject a refund in status "${refund.status}"`,
        });
      }
      refund.status = "rejected";
    } else if (action === "complete") {
      // "Complete" is the manual confirmation that the bank transfer back to
      // the buyer has happened. It MUST be preceded by approve so the seller
      // balance was already deducted — otherwise complete would silently
      // leave the seller holding money they owe the buyer.
      if (refund.status !== "approved") {
        return res.status(409).json({
          success: false,
          message: `Refund must be approved before marking complete (current: "${refund.status}")`,
        });
      }
      refund.status = "completed";
    }

    refund.resolutionNote = note;
    refund.decidedAt = new Date();
    refund.decidedBy = new Types.ObjectId(shopId);
    await refund.save();

    res.json({ success: true, data: refund });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ─── Settlements ─────────────────────────────────────────────────────
// Settlements are a virtual rollup: completed withdrawals grouped per period
// (week/month). We don't materialize them — we compute on demand.

export const listSettlements = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const period = String(req.query.period || "month");

    const withdrawals = await Withdraw.find({
      user: shopId,
      status: { $in: ["completed", "approved"] },
    })
      .select("amount fee netAmount status createdAt processedAt bankAccount")
      .populate("bankAccount", "bankName accountNumber")
      .sort({ createdAt: -1 })
      .lean();

    // Group by week or month
    const groups = new Map<
      string,
      {
        period: string;
        startDate: Date;
        gross: number;
        fees: number;
        net: number;
        count: number;
        withdrawals: typeof withdrawals;
      }
    >();

    for (const w of withdrawals) {
      const ref = w.processedAt || w.createdAt;
      const d = new Date(ref);
      let key: string;
      let start: Date;
      if (period === "week") {
        const day = d.getDay() || 7;
        start = new Date(d);
        start.setDate(d.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        key = `${start.getFullYear()}-W${Math.ceil(
          ((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) /
            86400000 +
            new Date(start.getFullYear(), 0, 1).getDay() +
            1) /
            7
        )}`;
      } else {
        start = new Date(d.getFullYear(), d.getMonth(), 1);
        key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
      }
      if (!groups.has(key)) {
        groups.set(key, {
          period: key,
          startDate: start,
          gross: 0,
          fees: 0,
          net: 0,
          count: 0,
          withdrawals: [],
        });
      }
      const row = groups.get(key)!;
      row.gross += w.amount || 0;
      row.fees += w.fee || 0;
      row.net += w.netAmount || 0;
      row.count += 1;
      row.withdrawals.push(w);
    }

    const data = Array.from(groups.values()).sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );

    res.json({ success: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ─── Transactions ────────────────────────────────────────────────────
// Unified transaction ledger pulled from orders (income) and withdrawals
// (debits) and refunds (debits). Pure derived data.

export const listTransactions = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;

    const limit = Math.min(Number(req.query.limit) || 200, 500);

    type TxType = "income" | "withdrawal" | "refund" | "fee";
    interface Tx {
      _id: string;
      type: TxType;
      description: string;
      amount: number;
      status: string;
      createdAt: Date;
    }

    const [orders, withdrawals, refunds] = await Promise.all([
      Order.find({ "orderItems.seller": shopId, isPaid: true })
        .select("totalPrice orderItems createdAt status")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Withdraw.find({ user: shopId })
        .select("amount fee status createdAt bankAccount")
        .populate("bankAccount", "bankName accountNumber")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Refund.find({ shop: shopId })
        .select("amount status createdAt order")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    const txs: Tx[] = [];

    for (const o of orders) {
      const items = (o as unknown as { orderItems?: Array<{ seller?: Types.ObjectId; price?: number; qty?: number }> }).orderItems || [];
      const sellerItems = items.filter((it) => String(it.seller) === shopId);
      const sellerTotal = sellerItems.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
        0
      );
      if (sellerTotal > 0) {
        const meta = o as unknown as { status?: string; createdAt: Date };
        txs.push({
          _id: `o-${o._id}`,
          type: "income",
          description: `Order #${String(o._id).slice(-8).toUpperCase()}`,
          amount: sellerTotal,
          status: meta.status || "paid",
          createdAt: meta.createdAt,
        });
      }
    }

    for (const w of withdrawals) {
      const bank = (w.bankAccount as { bankName?: string } | null) || null;
      txs.push({
        _id: `w-${w._id}`,
        type: "withdrawal",
        description: `Withdraw to ${bank?.bankName || "bank"}`,
        amount: -(w.amount || 0),
        status: w.status,
        createdAt: w.createdAt,
      });
      if ((w.fee || 0) > 0) {
        txs.push({
          _id: `wf-${w._id}`,
          type: "fee",
          description: `Withdrawal fee`,
          amount: -(w.fee || 0),
          status: w.status,
          createdAt: w.createdAt,
        });
      }
    }

    for (const r of refunds) {
      if (r.status === "approved" || r.status === "completed") {
        txs.push({
          _id: `r-${r._id}`,
          type: "refund",
          description: `Refund to customer`,
          amount: -(r.amount || 0),
          status: r.status,
          createdAt: r.createdAt,
        });
      }
    }

    txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ success: true, data: txs.slice(0, limit) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};
