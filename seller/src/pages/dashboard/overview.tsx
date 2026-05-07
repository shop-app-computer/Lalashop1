import React, { useState } from 'react';
import {
  Calendar, Download, Filter, ArrowUp, ArrowDown,
  ChevronDown, Search, AlertTriangle,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | '12m' | 'custom';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '12m', label: '12M' },
  { key: 'custom', label: 'Custom' },
];

const trend = [
  { d: 'W1', revenue: 9_800, orders: 112 },
  { d: 'W2', revenue: 12_400, orders: 138 },
  { d: 'W3', revenue: 11_100, orders: 124 },
  { d: 'W4', revenue: 14_900, orders: 167 },
  { d: 'W5', revenue: 13_200, orders: 149 },
  { d: 'W6', revenue: 16_800, orders: 184 },
  { d: 'W7', revenue: 15_500, orders: 173 },
  { d: 'W8', revenue: 18_200, orders: 201 },
];

interface ChannelWeek {
  d: string;
  online: number;
  pos: number;
}

const channelSplit: ChannelWeek[] = [
  { d: 'W1', online: 84, pos: 28 },
  { d: 'W2', online: 102, pos: 36 },
  { d: 'W3', online: 91, pos: 33 },
  { d: 'W4', online: 124, pos: 43 },
  { d: 'W5', online: 109, pos: 40 },
  { d: 'W6', online: 138, pos: 46 },
  { d: 'W7', online: 128, pos: 45 },
  { d: 'W8', online: 154, pos: 47 },
];

const posSummary = {
  unitsSold: channelSplit.reduce((s, x) => s + x.pos, 0),
  transactions: 142,
  grossSales: 8_420.5,
  refunded: 216.4,
  topRegister: '#02 (Mali T.)',
  topProduct: 'Cotton Tee — 38 units',
};

const recentActivity = [
  { id: 'ORD-228101', user: 'Somsak J.', action: 'Purchased Leather Bag', amount: 299.0, time: '2m ago', status: 'success' },
  { id: 'ORD-228100', user: 'Viphone S.', action: 'Purchased Denim Jacket', amount: 89.0, time: '15m ago', status: 'success' },
  { id: 'ORD-228099', user: 'Keo P.', action: 'Purchased Cotton Tee', amount: 45.0, time: '1h ago', status: 'pending' },
  { id: 'ORD-228098', user: 'Anousone K.', action: 'Purchased Smart Watch', amount: 199.0, time: '3h ago', status: 'success' },
  { id: 'ORD-228097', user: 'Mali T.', action: 'Refund issued', amount: 35.0, time: '4h ago', status: 'cancelled' },
];

const alerts = [
  { sev: 'high', text: '5 SKUs below reorder threshold', meta: 'Inventory' },
  { sev: 'med', text: '12 orders awaiting fulfillment > 24h', meta: 'Operations' },
  { sev: 'low', text: '3 customer messages unanswered', meta: 'Support' },
];

const statusStyles: Record<string, string> = {
  success: 'bg-green-50 text-green-700',
  pending: 'bg-orange-50 text-orange-700',
  shipping: 'bg-purple-50 text-purple-700',
  cancelled: 'bg-red-50 text-red-700',
};

const sevStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-700',
  med: 'bg-orange-50 text-orange-700',
  low: 'bg-gray-100 text-gray-700',
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

const Overview = () => {
  const [range, setRange] = useState<RangeKey>('30d');

  const yMax = Math.ceil(Math.max(...trend.map((d) => d.revenue)) / 5000) * 5000;
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
            placeholder="Search orders, products, customers…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip — 6 metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Revenue" value="$45,231.89" delta={20.1} deltaLabel="vs prev" />
        <KPI label="Orders" value="1,234" delta={12.5} deltaLabel="vs prev" />
        <KPI label="Customers" value="856" delta={8.2} deltaLabel="vs prev" />
        <KPI label="Conversion" value="3.45%" delta={-1.4} deltaLabel="vs prev" />
        <KPI label="AOV" value="$36.65" delta={2.1} deltaLabel="vs prev" />
        <KPI label="Refunds" value="$1,248" delta={-3.2} deltaLabel="vs prev" />
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

      {/* Revenue mini-chart */}
      <div className="rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Revenue trend</h3>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-sm" /> Revenue
            </span>
          </div>
        </div>
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
            <div className="relative h-44 flex items-end justify-between gap-1 px-1">
              {trend.map((d) => {
                const h = (d.revenue / yMax) * 100;
                return (
                  <div key={d.d} className="group flex-1 h-full flex items-end justify-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mt-[-4px]">
                      <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap tabular-nums">
                        <div className="font-bold mb-0.5">{d.d}</div>
                        <div>Revenue: ${d.revenue.toLocaleString()}</div>
                        <div>Orders: {d.orders}</div>
                      </div>
                    </div>
                    <div className="w-4 bg-primary group-hover:bg-primary-hover transition-colors" style={{ height: `${h}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between gap-1 px-1 pt-2 text-[10px] text-gray-500 tabular-nums">
              {trend.map((d) => (
                <span key={d.d} className="flex-1 text-center">{d.d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sales by channel — Online vs POS in-store */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* POS in-store summary */}
        <div className="rounded-lg lg:col-span-1">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-black">POS in-store sales</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Sold from physical store</p>
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-gray-500">This period</span>
          </div>
          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
            <KPI label="Units sold" value={posSummary.unitsSold.toLocaleString()} delta={9.3} deltaLabel="vs prev" />
            <KPI label="Transactions" value={posSummary.transactions.toLocaleString()} delta={6.8} deltaLabel="vs prev" />
            <KPI label="Gross sales" value={fmtMoney(posSummary.grossSales)} delta={11.1} deltaLabel="vs prev" />
            <KPI label="Refunded" value={fmtMoney(posSummary.refunded)} delta={-2.5} deltaLabel="vs prev" />
          </div>
          <div className="px-4 pb-3 pt-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Top register</span>
              <span className="font-semibold text-gray-900">{posSummary.topRegister}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Top product</span>
              <span className="font-semibold text-gray-900">{posSummary.topProduct}</span>
            </div>
          </div>
        </div>

        {/* Channel split chart */}
        <div className="rounded-lg lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Units sold by channel</h3>
            <div className="flex items-center gap-3 text-[11px] text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary rounded-sm" /> Online
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-gray-700 rounded-sm" /> POS in-store
              </span>
            </div>
          </div>
          {(() => {
            const yMaxCh = Math.ceil(Math.max(...channelSplit.map((d) => d.online + d.pos)) / 50) * 50;
            const yTicksCh = Array.from({ length: 5 }, (_, i) => (yMaxCh / 4) * i);
            const totalOnline = channelSplit.reduce((s, x) => s + x.online, 0);
            const totalPos = channelSplit.reduce((s, x) => s + x.pos, 0);
            const totalAll = totalOnline + totalPos;
            const posShare = totalAll ? (totalPos / totalAll) * 100 : 0;
            return (
              <>
                <div className="px-4 pb-2 flex items-baseline gap-4 text-[11px] text-gray-600">
                  <span>
                    <span className="font-semibold text-gray-900 tabular-nums">{totalOnline.toLocaleString()}</span> online units
                  </span>
                  <span>
                    <span className="font-semibold text-gray-900 tabular-nums">{totalPos.toLocaleString()}</span> POS units
                  </span>
                  <span className="text-gray-500">
                    POS share: <span className="font-semibold text-gray-900 tabular-nums">{posShare.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="p-4 pt-2 flex">
                  <div className="flex flex-col justify-between pr-2 py-1 text-[10px] text-gray-400 tabular-nums">
                    {[...yTicksCh].reverse().map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="flex-1 relative">
                    <div className="relative h-44 flex items-end justify-between gap-1 px-1">
                      {channelSplit.map((d) => {
                        const total = d.online + d.pos;
                        const totalH = (total / yMaxCh) * 100;
                        const onlineH = total ? (d.online / total) * totalH : 0;
                        const posH = total ? (d.pos / total) * totalH : 0;
                        return (
                          <div key={d.d} className="group flex-1 h-full flex items-end justify-center relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mt-[-4px]">
                              <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap tabular-nums">
                                <div className="font-bold mb-0.5">{d.d}</div>
                                <div>Online: {d.online}</div>
                                <div>POS: {d.pos}</div>
                                <div className="text-gray-300">Total: {total}</div>
                              </div>
                            </div>
                            <div className="w-4 flex flex-col justify-end" style={{ height: `${totalH}%` }}>
                              <div className="w-full bg-primary group-hover:bg-primary-hover transition-colors" style={{ height: `${(onlineH / totalH) * 100}%` }} />
                              <div className="w-full bg-gray-700 group-hover:bg-gray-800 transition-colors" style={{ height: `${(posH / totalH) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between gap-1 px-1 pt-2 text-[10px] text-gray-500 tabular-nums">
                      {channelSplit.map((d) => (
                        <span key={d.d} className="flex-1 text-center">{d.d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Bottom: Recent activity + Alerts + Store health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Recent activity</h3>
            <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Order</th>
                  <th className="px-4 py-2 text-left font-semibold">Customer</th>
                  <th className="px-4 py-2 text-left font-semibold">Action</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="">
                {recentActivity.map((a) => (
                  <tr key={a.id} className="">
                    <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{a.id}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{a.user}</td>
                    <td className="px-4 py-2 text-gray-700">{a.action}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtMoney(a.amount)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusStyles[a.status]}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500 text-[11px]">{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Alerts */}
          <div className="rounded-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-bold text-black">Alerts</h3>
              <span className="text-[11px] text-gray-500 tabular-nums">{alerts.length} open</span>
            </div>
            <div className="">
              {alerts.map((a, i) => (
                <div key={i} className="px-4 py-2.5 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-900">{a.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sevStyles[a.sev]}`}>
                        {a.sev.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-gray-500">{a.meta}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Store health */}
          <div className="rounded-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-bold text-black">Store health</h3>
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
                <tr>
                  <td className="px-4 py-2 text-gray-600">On-time shipment</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900 tabular-nums">94.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
