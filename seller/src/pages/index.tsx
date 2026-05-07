import React, { useState } from 'react';
import {
  Calendar, Download, Filter, ArrowUp, ArrowDown, MoreHorizontal,
  ChevronDown, Search,
} from 'lucide-react';

type RangeKey = 'today' | '7d' | '30d' | '90d';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

const recentOrders = [
  { id: 'ORD-228101', customer: 'Sarah Jenkins', product: 'Linen Oversized Shirt', amount: 145.0, status: 'shipping' },
  { id: 'ORD-228102', customer: 'Anousone K.', product: 'Cotton Tote — Ivory', amount: 45.0, status: 'success' },
  { id: 'ORD-228103', customer: 'Keo P.', product: 'Ceramic Pour-Over Set', amount: 89.0, status: 'pending' },
  { id: 'ORD-228104', customer: 'Viphone S.', product: 'Wide-Leg Linen Trouser', amount: 120.0, status: 'shipping' },
  { id: 'ORD-228105', customer: 'Somsak J.', product: 'Cropped Knit Cardigan', amount: 78.0, status: 'success' },
  { id: 'ORD-228106', customer: 'Mali T.', product: 'Smart Watch Pro', amount: 299.0, status: 'cancelled' },
];

const statusStyles: Record<string, string> = {
  success: 'bg-green-50 text-green-700',
  pending: 'bg-orange-50 text-orange-700',
  shipping: 'bg-purple-50 text-purple-700',
  cancelled: 'bg-red-50 text-red-700',
};

const fmtMoney = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const KPI = ({
  label, value, delta, deltaLabel,
}: { label: string; value: string; delta?: number; deltaLabel?: string }) => (
  <div className="rounded-lg px-4 py-3">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className="text-xl font-bold text-black tabular-nums mt-1">{value}</p>
    {delta !== undefined && (
      <div className="flex items-center gap-1 mt-1">
        <span className={`inline-flex items-center text-[11px] font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
        {deltaLabel && <span className="text-[11px] text-gray-400">{deltaLabel}</span>}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [range, setRange] = useState<RangeKey>('today');

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                range === r.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Compare to: <span className="font-semibold text-gray-900 ml-1">Previous period</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, customers…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip — 4 quick-glance metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Revenue" value="$45,231.89" delta={20.1} deltaLabel="vs prev" />
        <KPI label="Orders" value="1,234" delta={12.5} deltaLabel="vs prev" />
        <KPI label="Customers" value="856" delta={8.2} deltaLabel="vs prev" />
        <KPI label="Conversion" value="3.45%" delta={-1.4} deltaLabel="vs prev" />
      </div>

      {/* Plan callout */}
      <div className="rounded-lg px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px]">
          <span className="text-[10px] font-semibold tracking-wide text-gray-500">Plan</span>
          <span className="font-semibold text-gray-900">Soshops Pro</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">Renews May 30, 2026</span>
        </div>
        <button className="text-[11px] font-semibold text-primary hover:underline">Manage →</button>
      </div>

      {/* Main grid: recent orders + store health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Recent orders</h3>
            <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Order ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Customer</th>
                  <th className="px-4 py-2 text-left font-semibold">Product</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="">
                    <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{o.id}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{o.customer}</td>
                    <td className="px-4 py-2 text-gray-700">{o.product}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtMoney(o.amount)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusStyles[o.status]}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store health micro-tiles */}
        <div className="space-y-3">
          <div className="rounded-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-bold text-black">Store health</h3>
              <button className="text-[11px] text-gray-500 hover:text-black"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <table className="w-full text-[12px]">
              <tbody className="">
                <tr>
                  <td className="px-4 py-2 text-gray-600">Verification</td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">Trusted</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600">Rating</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900 tabular-nums">4.8 / 5.0</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600">Response rate</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900 tabular-nums">98%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Low stock</p>
            <p className="text-xl font-bold text-black tabular-nums mt-1">5 items</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Below reorder threshold</p>
          </div>

          <div className="rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Pending shipments</p>
            <p className="text-xl font-bold text-black tabular-nums mt-1">12 orders</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Awaiting fulfillment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
