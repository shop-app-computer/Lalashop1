import React, { useState } from 'react';
import {
  Calendar, Download, Filter, ArrowUp, ArrowDown, MoreHorizontal,
  ChevronDown, Search,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | '12m' | 'custom';
type Granularity = 'day' | 'week' | 'month';

const monthly = [
  { m: 'Jan', actual: 18_200, booked: 24_100, orders: 213, refunds: 320 },
  { m: 'Feb', actual: 28_400, booked: 32_500, orders: 311, refunds: 410 },
  { m: 'Mar', actual: 22_100, booked: 30_900, orders: 254, refunds: 290 },
  { m: 'Apr', actual: 38_700, booked: 44_200, orders: 442, refunds: 612 },
  { m: 'May', actual: 30_500, booked: 41_800, orders: 358, refunds: 405 },
  { m: 'Jun', actual: 36_900, booked: 48_300, orders: 401, refunds: 533 },
  { m: 'Jul', actual: 26_700, booked: 37_400, orders: 298, refunds: 312 },
  { m: 'Aug', actual: 42_100, booked: 53_500, orders: 489, refunds: 690 },
  { m: 'Sep', actual: 33_400, booked: 46_800, orders: 372, refunds: 421 },
  { m: 'Oct', actual: 39_800, booked: 50_200, orders: 444, refunds: 522 },
  { m: 'Nov', actual: 28_100, booked: 39_700, orders: 318, refunds: 298 },
  { m: 'Dec', actual: 47_300, booked: 58_900, orders: 521, refunds: 712 },
];

const topProducts = [
  { sku: 'LSH-238-LA', name: 'Linen Oversized Shirt', units: 482, revenue: 9_640, refunds: 4, share: 22.7 },
  { sku: 'CTT-118-IV', name: 'Cotton Tote — Ivory', units: 361, revenue: 5_415, refunds: 2, share: 12.7 },
  { sku: 'CPO-044-WH', name: 'Ceramic Pour-Over Set', units: 207, revenue: 4_140, refunds: 1, share: 9.7 },
  { sku: 'WLT-512-OK', name: 'Wide-Leg Linen Trouser', units: 188, revenue: 3_760, refunds: 3, share: 8.8 },
  { sku: 'KNT-901-CR', name: 'Cropped Knit Cardigan', units: 142, revenue: 2_840, refunds: 0, share: 6.7 },
];

const channels = [
  { name: 'TikTok Shop', revenue: 18_700, share: 44, delta: 12.4 },
  { name: 'Storefront', revenue: 11_900, share: 28, delta: 4.1 },
  { name: 'Facebook Messenger', revenue: 5_100, share: 12, delta: -2.3 },
  { name: 'Instagram Referral', revenue: 3_400, share: 8, delta: 6.8 },
  { name: 'Google Search', revenue: 3_400, share: 8, delta: 0.4 },
];

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '12m', label: '12M' },
  { key: 'custom', label: 'Custom' },
];

const fmtMoney = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtMoney2 = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const KPI = ({
  label, value, delta, deltaLabel,
}: { label: string; value: string; delta?: number; deltaLabel?: string }) => (
  <div className="px-4 py-3">
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

const RevenueSummary = () => {
  const [range, setRange] = useState<RangeKey>('30d');
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const totalActual = monthly.reduce((s, d) => s + d.actual, 0);
  const totalBooked = monthly.reduce((s, d) => s + d.booked, 0);
  const totalOrders = monthly.reduce((s, d) => s + d.orders, 0);
  const totalRefunds = monthly.reduce((s, d) => s + d.refunds, 0);
  const aov = totalActual / totalOrders;
  const fees = Math.round(totalActual * 0.03);

  const yMax = Math.ceil(Math.max(...monthly.map((d) => d.booked)) / 10000) * 10000;
  const yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);

  return (
    <div className="space-y-4 text-sm p-4">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </button>
          <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                range === r.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 hover:bg-gray-100 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          Apr 1 – Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 hover:bg-gray-100 rounded">
          Compare to: <span className="font-semibold text-gray-900 ml-1">Previous period</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 hover:bg-gray-100 rounded">
          Currency: <span className="font-semibold text-gray-900 ml-1">USD</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 hover:bg-gray-100 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU, order, customer…"
            className="pl-7 pr-3 py-1 bg-gray-100 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip — 6 metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Net Revenue" value={fmtMoney(totalActual)} delta={12.4} deltaLabel="vs prev" />
        <KPI label="Gross Sales" value={fmtMoney(totalBooked)} delta={9.1} deltaLabel="vs prev" />
        <KPI label="Refunds" value={fmtMoney(totalRefunds)} delta={-3.2} deltaLabel="vs prev" />
        <KPI label="Platform Fees" value={fmtMoney(fees)} delta={2.8} deltaLabel="vs prev" />
        <KPI label="Orders" value={totalOrders.toLocaleString()} delta={6.7} deltaLabel="vs prev" />
        <KPI label="Avg Order Value" value={fmtMoney2(aov)} delta={1.4} deltaLabel="vs prev" />
      </div>

      {/* Chart / Table toggle */}
      <div className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-black">Revenue trend</h3>
            <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setView('chart')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${view === 'chart' ? 'text-black' : 'text-gray-600'}`}
              >
                Chart
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold ${view === 'table' ? 'text-black' : 'text-gray-600'}`}
              >
                Table
              </button>
            </div>
            <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
              {(['day', 'week', 'month'] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize ${granularity === g ? 'text-black' : 'text-gray-600'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Actual
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-200 rounded-sm" /> Booked
            </span>
          </div>
        </div>

        {view === 'chart' ? (
          <div className="p-4 flex">
            <div className="flex flex-col justify-between pr-2 py-1 text-[10px] text-gray-400 tabular-nums">
              {[...yTicks].reverse().map((t) => (
                <span key={t}>${(t / 1000).toFixed(0)}k</span>
              ))}
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                {yTicks.map((t) => (
                  <div key={t} className="" />
                ))}
              </div>
              <div className="relative h-56 flex items-end justify-between gap-1 px-1">
                {monthly.map((d) => {
                  const aH = (d.actual / yMax) * 100;
                  const bH = (d.booked / yMax) * 100;
                  return (
                    <div key={d.m} className="group flex-1 h-full flex items-end justify-center gap-0.5 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mt-[-4px]">
                        <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap tabular-nums">
                          <div className="font-bold mb-0.5">{d.m} 2026</div>
                          <div>Actual: {fmtMoney(d.actual)}</div>
                          <div>Booked: {fmtMoney(d.booked)}</div>
                        </div>
                      </div>
                      <div className="w-3 bg-blue-200" style={{ height: `${bH}%` }} />
                      <div className="w-3 bg-blue-500 group-hover:bg-blue-600 transition-colors" style={{ height: `${aH}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between gap-1 px-1 pt-2 text-[10px] text-gray-500 tabular-nums">
                {monthly.map((d) => (
                  <span key={d.m} className="flex-1 text-center">{d.m}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Period</th>
                  <th className="px-4 py-2 text-right font-semibold">Booked</th>
                  <th className="px-4 py-2 text-right font-semibold">Actual</th>
                  <th className="px-4 py-2 text-right font-semibold">Refunds</th>
                  <th className="px-4 py-2 text-right font-semibold">Orders</th>
                  <th className="px-4 py-2 text-right font-semibold">AOV</th>
                </tr>
              </thead>
              <tbody className="">
                {monthly.map((d) => (
                  <tr key={d.m} className="">
                    <td className="px-4 py-2 font-medium text-gray-900">{d.m} 2026</td>
                    <td className="px-4 py-2 text-right text-gray-700">{fmtMoney(d.booked)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtMoney(d.actual)}</td>
                    <td className="px-4 py-2 text-right text-red-600">−{fmtMoney(d.refunds)}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{d.orders}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{fmtMoney2(d.actual / d.orders)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom: Top SKUs + Channel breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Top revenue products</h3>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all SKUs →</button>
          </div>
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">SKU</th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-right font-semibold">Units</th>
                <th className="px-4 py-2 text-right font-semibold">Revenue</th>
                <th className="px-4 py-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="">
              {topProducts.map((p) => (
                <tr key={p.sku} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{p.sku}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.units}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtMoney(p.revenue)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.share.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-black">Revenue by channel</h3>
            <button className="text-gray-500"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            {channels.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-gray-900">{fmtMoney(c.revenue)}</span>
                    <span className={`text-[10px] font-semibold ${c.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {c.delta >= 0 ? '↑' : '↓'}{Math.abs(c.delta).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${c.share}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-8 text-right">{c.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueSummary;