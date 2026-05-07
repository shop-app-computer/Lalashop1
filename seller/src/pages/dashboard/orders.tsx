import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, Clock, Truck, CheckCircle2 } from "lucide-react";
import { fetchMyOrders, type SellerOrderRow } from "@/services/sellerApi";

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const formatDate = (s?: string): string => {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DashboardOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<SellerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h1 className="text-[16px] font-bold text-gray-900">Orders overview</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">
          High-level snapshot of all your orders. Use Orders → tabs for action queues.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI icon={ShoppingBag} label="All orders" value={stats.total} tone="text-black" link="/orders/pending" />
        <KPI icon={Clock} label="Pending fulfillment" value={stats.pending} tone="text-orange-700" link="/orders/processing" />
        <KPI icon={Truck} label="Shipping" value={stats.shipped} tone="text-purple-700" link="/orders/shipping" />
        <KPI icon={CheckCircle2} label="Delivered" value={stats.delivered} tone="text-green-700" link="/orders/delivered" />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-[12px]">
          <Loader2 className="w-5 h-5 mx-auto animate-spin" />
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-[13px] font-bold text-gray-900">Latest 20 orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide bg-gray-50/50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Order</th>
                  <th className="px-4 py-2 text-left font-semibold">Customer</th>
                  <th className="px-4 py-2 text-right font-semibold">Total</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((o) => {
                  const customer =
                    typeof o.user === "object" && o.user
                      ? o.user.name || o.user.email
                      : o.shippingAddress?.fullName;
                  return (
                    <tr key={o._id} className="border-t border-gray-50">
                      <td className="px-4 py-2 font-mono text-[11px] text-gray-600">
                        {o._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-900">{customer || "Guest"}</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-900">
                        ฿{formatMoney(o.totalPrice)}
                      </td>
                      <td className="px-4 py-2 capitalize text-gray-700">{o.status}</td>
                      <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const KPI: React.FC<{ icon: typeof ShoppingBag; label: string; value: number; tone: string; link: string }> = ({
  icon: Icon, label, value, tone, link,
}) => (
  <Link href={link} className="rounded-lg border border-gray-100 px-4 py-3 hover:border-[#00aeff] transition-colors">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3 h-3 text-gray-400" />
      <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    </div>
    <p className={`text-[20px] font-bold tabular-nums mt-1 ${tone}`}>{value.toLocaleString()}</p>
  </Link>
);

export default DashboardOrdersPage;
