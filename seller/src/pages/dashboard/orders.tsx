import React, { useState } from 'react';
import {
  Calendar, Download, Filter, ArrowUp, ArrowDown,
  ChevronDown, Search,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | '12m' | 'custom';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '12m', label: '12M' },
  { key: 'custom', label: 'Custom' },
];

const ordersByDay = [
  { d: 'Mon', count: 38 },
  { d: 'Tue', count: 52 },
  { d: 'Wed', count: 47 },
  { d: 'Thu', count: 64 },
  { d: 'Fri', count: 71 },
  { d: 'Sat', count: 58 },
  { d: 'Sun', count: 41 },
];

const topCustomers = [
  { id: 'CUS-1024', name: 'Sarah Jenkins', orders: 14, revenue: 2_410, last: '2d ago' },
  { id: 'CUS-1018', name: 'Anousone Khamla', orders: 11, revenue: 1_980, last: '5d ago' },
  { id: 'CUS-1031', name: 'Viphone Sayasith', orders: 9, revenue: 1_645, last: '1d ago' },
  { id: 'CUS-1009', name: 'Keo Phimmasone', orders: 8, revenue: 1_212, last: '3d ago' },
  { id: 'CUS-1042', name: 'Mali Thongdy', orders: 7, revenue: 1_098, last: '6d ago' },
];

const recentOrders = [
  { id: 'ORD-228101', customer: 'Sarah Jenkins', items: 2, amount: 145.0, status: 'shipping', placed: '2h ago' },
  { id: 'ORD-228102', customer: 'Anousone K.', items: 1, amount: 45.0, status: 'success', placed: '4h ago' },
  { id: 'ORD-228103', customer: 'Keo P.', items: 3, amount: 89.0, status: 'pending', placed: '6h ago' },
  { id: 'ORD-228104', customer: 'Viphone S.', items: 1, amount: 120.0, status: 'shipping', placed: '8h ago' },
  { id: 'ORD-228105', customer: 'Somsak J.', items: 2, amount: 78.0, status: 'success', placed: '12h ago' },
  { id: 'ORD-228106', customer: 'Mali T.', items: 1, amount: 299.0, status: 'cancelled', placed: '1d ago' },
  { id: 'ORD-228107', customer: 'Bounmy V.', items: 4, amount: 412.0, status: 'success', placed: '1d ago' },
];

const statusStyles: Record<string, string> = {
  success: 'bg-green-50 text-green-700',
  pending: 'bg-orange-50 text-orange-700',
  shipping: 'bg-purple-50 text-purple-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-gray-100 text-gray-700',
};

const fmtMoney = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtMoney0 = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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

const OrdersSummary = () => {
  const [range, setRange] = useState<RangeKey>('30d');

  const yMax = Math.ceil(Math.max(...ordersByDay.map((d) => d.count)) / 20) * 20;
  const yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);

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
          Apr 1 – Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Status: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search order, customer…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* Status breakdown KPI strip — 6 cells */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Pending" value="12" delta={4.1} deltaLabel="vs prev" />
        <KPI label="Processing" value="28" delta={6.4} deltaLabel="vs prev" />
        <KPI label="Shipping" value="45" delta={2.8} deltaLabel="vs prev" />
        <KPI label="Delivered" value="892" delta={12.5} deltaLabel="vs prev" />
        <KPI label="Cancelled" value="5" delta={-1.2} deltaLabel="vs prev" />
        <KPI label="Returned" value="3" delta={-0.6} deltaLabel="vs prev" />
      </div>

      {/* Orders/day chart */}
      <div className="rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Orders per day</h3>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-sm" /> Orders
            </span>
          </div>
        </div>
        <div className="p-4 flex">
          <div className="flex flex-col justify-between pr-2 py-1 text-[10px] text-gray-400 tabular-nums">
            {[...yTicks].reverse().map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex flex-col justify-between">
              {yTicks.map((t) => (
                <div key={t} className="" />
              ))}
            </div>
            <div className="relative h-44 flex items-end justify-between gap-1 px-1">
              {ordersByDay.map((d) => {
                const h = (d.count / yMax) * 100;
                return (
                  <div key={d.d} className="group flex-1 h-full flex items-end justify-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mt-[-4px]">
                      <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap tabular-nums">
                        <div className="font-bold mb-0.5">{d.d}</div>
                        <div>Orders: {d.count}</div>
                      </div>
                    </div>
                    <div className="w-6 bg-primary group-hover:bg-primary-hover transition-colors" style={{ height: `${h}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between gap-1 px-1 pt-2 text-[10px] text-gray-500 tabular-nums">
              {ordersByDay.map((d) => (
                <span key={d.d} className="flex-1 text-center">{d.d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: top customers + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Top customers</h3>
            <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
          </div>
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Customer</th>
                <th className="px-4 py-2 text-right font-semibold">Orders</th>
                <th className="px-4 py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="">
              {topCustomers.map((c) => (
                <tr key={c.id} className="">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="font-mono text-[10px] text-gray-500">{c.id}</div>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{c.orders}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtMoney0(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  <th className="px-4 py-2 text-right font-semibold">Items</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody className="">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="">
                    <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{o.id}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{o.customer}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{o.items}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtMoney(o.amount)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusStyles[o.status]}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500 text-[11px]">{o.placed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSummary;
