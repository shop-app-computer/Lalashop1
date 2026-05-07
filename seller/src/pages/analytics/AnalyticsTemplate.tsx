import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download, MoreHorizontal,
  ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const AnalyticsPage = ({ title }: { title: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const trend = [30, 50, 40, 70, 90, 60, 80, 55, 95, 75, 85, 100];
  const trendLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const categories = [
    { label: 'Electronics', value: 45, revenue: 12_400 },
    { label: 'Fashion', value: 30, revenue: 8_300 },
    { label: 'Home & Living', value: 25, revenue: 6_900 },
  ];

  const topPages = [
    { path: '/p/linen-shirt', views: 12_400, conv: 4.2, revenue: 5_200 },
    { path: '/p/cotton-tote', views: 8_700, conv: 3.6, revenue: 3_100 },
    { path: '/c/electronics', views: 6_200, conv: 2.1, revenue: 4_400 },
    { path: '/p/smart-watch', views: 5_900, conv: 5.8, revenue: 6_800 },
    { path: '/p/wallet', views: 4_100, conv: 2.9, revenue: 1_400 },
  ];

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const yMax = Math.max(...trend);

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Report
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
          Channel: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search metric, page…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Growth Rate</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">+24.5%</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />vs last month
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Avg Order Value</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">$85.20</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />$12.40 vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Bounce Rate</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">12.4%</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowDown className="w-3 h-3" />2.1% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Sessions</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">142.8K</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />8.6% vs prev
          </span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Performance trend</h3>
            <span className="text-[11px] text-gray-500">Indexed (max = 100)</span>
          </div>
          <div className="p-4 flex">
            <div className="flex flex-col justify-between pr-2 py-1 text-[10px] text-gray-400 tabular-nums">
              {[100, 75, 50, 25, 0].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="" />
                ))}
              </div>
              <div className="relative h-48 flex items-end justify-between gap-1 px-1">
                {trend.map((h, i) => (
                  <div key={i} className="flex-1 flex justify-center group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none z-10 mt-[-4px]">
                      <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap tabular-nums">
                        {trendLabels[i]}: {h}
                      </div>
                    </div>
                    <div className="w-3 bg-primary" style={{ height: `${(h / yMax) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-1 px-1 pt-2 text-[10px] text-gray-500 tabular-nums">
                {trendLabels.map((m) => (
                  <span key={m} className="flex-1 text-center">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Category mix</h3>
            <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-4 py-2">
            {categories.map((cat) => (
              <div key={cat.label} className="py-2.5">
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-medium text-gray-900">{cat.label}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-gray-900">{fmt(cat.revenue)}</span>
                    <span className="text-[10px] text-gray-500">{cat.value}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${cat.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top pages table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Top pages</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Path</th>
                <th className="px-4 py-2 text-right font-semibold">Views</th>
                <th className="px-4 py-2 text-right font-semibold">Conversion</th>
                <th className="px-4 py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="">
              {topPages.map((p) => (
                <tr key={p.path} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{p.path}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.views.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.conv.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing <span className="font-semibold text-gray-900">1–{topPages.length}</span> of <span className="font-semibold text-gray-900">218</span> pages</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
