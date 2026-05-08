"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Info, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiClient } from "@/services/apiClient";

type Range = "today" | "7d" | "30d" | "all";

interface TrendPoint {
  name: string;
  value: number;
  commission: number;
}

interface TopProduct {
  _id: string;
  name: string;
  image: string;
  revenue: number;
  commission: number;
  qty: number;
}

interface AnalyticsData {
  range: Range;
  summary: {
    revenue: number;
    commission: number;
    itemCount: number;
    orderCount: number;
  };
  trend: TrendPoint[];
  topProducts: TopProduct[];
  earnings: {
    pending: { total: number; count: number };
    settled: { total: number; count: number };
    canceled: { total: number; count: number };
  };
  productCount: number;
}

const RANGE_OPTIONS: { id: Range; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "all", label: "All" },
];

const formatCurrency = (n: number) => `฿${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function AttrView({ onBack }: { onBack: () => void }) {
  const [timeRange, setTimeRange] = useState<Range>("today");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/analytics/creator/me?range=${timeRange}`);
        if (mounted && res?.success) setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [timeRange]);

  const trend = useMemo(() => {
    if (!data?.trend?.length) return [];
    return data.trend;
  }, [data]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#121212] antialiased">
      <nav className="sticky top-0 z-50 bg-white border-b border-[#EEEEEE] flex items-center justify-between h-[52px] px-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="active:opacity-50 transition-opacity -ml-1">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">Data Analytics</h1>
        </div>
      </nav>

      <main className="w-full pb-20">
        <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-[#EEEEEE]">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTimeRange(opt.id)}
              className={`px-5 py-2 text-[13px] rounded-2xl font-bold transition-all shrink-0 ${
                timeRange === opt.id
                  ? "bg-black text-white border border-black"
                  : "bg-white text-[#86878B] border border-[#EEEEEE]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="bg-white grid grid-cols-2 border-b border-[#EEEEEE]">
          <MetricItem
            title="Revenue (GMV)"
            value={formatCurrency(data?.summary.revenue || 0)}
            isFirst
          />
          <MetricItem title="Commission" value={formatCurrency(data?.summary.commission || 0)} />
          <MetricItem title="Orders" value={(data?.summary.orderCount || 0).toString()} isFirst />
          <MetricItem title="Items Sold" value={(data?.summary.itemCount || 0).toString()} />
        </div>

        <div className="bg-white grid grid-cols-3 border-b border-[#EEEEEE]">
          <SmallStat title="Pending" value={formatCurrency(data?.earnings.pending.total || 0)} accent="text-amber-600" />
          <SmallStat title="Settled" value={formatCurrency(data?.earnings.settled.total || 0)} accent="text-emerald-600" />
          <SmallStat title="Products" value={(data?.productCount || 0).toString()} accent="text-slate-700" />
        </div>

        <div className="bg-white mt-2 border-y border-[#EEEEEE] py-6 px-4">
          <div className="flex justify-between items-center mb-6 px-1">
            <div>
              <h3 className="text-[14px] font-bold">Revenue Trend</h3>
              <p className="text-[11px] text-[#86878B]">Range: {timeRange}</p>
            </div>
            {loading && <Loader2 size={16} className="animate-spin text-[#86878B]" />}
          </div>

          <div className="h-[220px] w-full -ml-4">
            {trend.length > 0 ? (
              <ResponsiveContainer width="110%" height="100%">
                <AreaChart data={trend} margin={{ left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#121212" stopOpacity={0.05} />
                      <stop offset="95%" stopColor="#121212" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#86878B" }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ borderRadius: 12, border: "1px solid #EEE", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#121212" strokeWidth={2} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[12px] text-[#C8C9CC] font-bold tracking-widest">
                NO DATA
              </div>
            )}
          </div>
        </div>

        <div className="bg-white mt-2 border-y border-[#EEEEEE]">
          <div className="px-5 py-4 border-b border-[#F8F8F8] flex justify-between items-center">
            <h3 className="text-[14px] font-bold tracking-tight">Best Sellers</h3>
            <ChevronRight size={18} className="text-[#C8C9CC]" />
          </div>
          {data?.topProducts?.length ? (
            <div className="divide-y divide-[#F8F8F8]">
              {data.topProducts.map((p) => (
                <div key={p._id} className="px-5 py-5 flex items-center justify-between active:bg-[#FAFAFA]">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 bg-[#F5F5F5] flex-shrink-0 rounded-md overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[14px] font-bold line-clamp-1">{p.name}</p>
                      <p className="text-[12px] text-[#86878B]">{p.qty} items sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold">{formatCurrency(p.revenue)}</p>
                    <p className="text-[10px] font-bold text-emerald-500">+{formatCurrency(p.commission)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-[12px] font-bold tracking-widest text-[#C8C9CC]">
              NO SALES YET
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MetricItem({
  title,
  value,
  isFirst,
}: {
  title: string;
  value: string;
  isFirst?: boolean;
}) {
  return (
    <div className={`p-5 space-y-2 ${isFirst ? "border-r border-[#EEEEEE]" : ""}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[#86878B] tracking-wider">{title}</span>
        <Info size={13} className="text-[#C8C9CC]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[24px] font-bold leading-tight">{value}</span>
      </div>
    </div>
  );
}

function SmallStat({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="p-4 text-center border-r border-[#EEEEEE] last:border-r-0">
      <p className="text-[10px] text-[#86878B] font-bold tracking-widest mb-1">{title}</p>
      <p className={`text-[14px] font-black ${accent}`}>{value}</p>
    </div>
  );
}
