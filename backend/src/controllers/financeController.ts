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
      res.status(400).json({ success: false, message: "Invalid refund id" });
      return;
    }
    const action = String(req.body.action || "");
    const note = String(req.body.note || "");
    if (!["approve", "reject", "complete"].includes(action)) {
      res.status(400).json({ success: false, message: "Invalid action" });
      return;
    }

    const refund = await Refund.findOne({ _id: id, shop: shopId });
    if (!refund) {
      res.status(404).json({ success: false, message: "Refund not found" });
      return;
    }

    // When approving/completing, deduct the refund amount from the seller's
    // withdrawable balance so they can't withdraw money they're returning.
    if (action === "approve" && refund.status === "requested") {
      refund.status = "approved";
      const user = await User.findById(shopId);
      if (user && (user.balance || 0) >= refund.amount) {
        user.balance = (user.balance || 0) - refund.amount;
        await user.save();
      }
    } else if (action === "reject") {
      refund.status = "rejected";
    } else if (action === "complete") {
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
