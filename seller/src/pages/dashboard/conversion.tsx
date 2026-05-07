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

const funnel = [
  { stage: 'Visitors', count: 10_240, pct: 100 },
  { stage: 'Product Views', count: 1_850, pct: 18.1 },
  { stage: 'Add to Cart', count: 832, pct: 8.1 },
  { stage: 'Checkout Started', count: 450, pct: 4.4 },
  { stage: 'Purchased', count: 354, pct: 3.5 },
];

const sourceConversion = [
  { source: 'TikTok Shop', visitors: 4_520, purchases: 198, rate: 4.38, aov: 38.20 },
  { source: 'Storefront Direct', visitors: 850, purchases: 41, rate: 4.82, aov: 42.10 },
  { source: 'Facebook Messenger', visitors: 2_840, purchases: 72, rate: 2.54, aov: 31.50 },
  { source: 'Google Search', visitors: 1_200, purchases: 28, rate: 2.33, aov: 28.90 },
  { source: 'Instagram Referral', visitors: 830, purchases: 15, rate: 1.81, aov: 26.40 },
];

const dropoffInsights = [
  { sev: 'high', text: 'Cart → Checkout drop-off is 45.9%, above 35% benchmark', meta: 'Checkout' },
  { sev: 'med', text: 'Product View → Add to Cart at 45% conversion, room to improve', meta: 'Product page' },
  { sev: 'low', text: 'Mobile checkout completion 8% lower than desktop', meta: 'Device' },
];

const sevStyles: Record<string, string> = {
  high: 'bg-red-50 text-red-700',
  med: 'bg-orange-50 text-orange-700',
  low: 'bg-gray-100 text-gray-700',
};

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

const ConversionMetrics = () => {
  const [range, setRange] = useState<RangeKey>('30d');

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
            placeholder="Search source, page…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Conversion" value="3.45%" delta={2.4} deltaLabel="vs prev" />
        <KPI label="Add-to-Cart Rate" value="8.12%" delta={1.8} deltaLabel="vs prev" />
        <KPI label="Checkout Rate" value="4.40%" delta={0.6} deltaLabel="vs prev" />
        <KPI label="Abandonment" value="62.4%" delta={-5.2} deltaLabel="vs prev" />
      </div>

      {/* Funnel */}
      <div className="rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Purchase funnel</h3>
          <span className="text-[11px] text-gray-500">10,240 visitors → 354 purchases</span>
        </div>
        <div className="px-4 py-3">
          {funnel.map((f, i) => {
            const prev = i > 0 ? funnel[i - 1].count : f.count;
            const stepDrop = i > 0 ? ((prev - f.count) / prev) * 100 : 0;
            return (
              <div key={f.stage} className="py-2.5">
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-medium text-gray-900 w-44">{f.stage}</span>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="font-semibold text-gray-900">{f.count.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-500 w-14 text-right">{f.pct.toFixed(1)}%</span>
                    {i > 0 && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-red-600 w-20 justify-end">
                        <ArrowDown className="w-2.5 h-2.5" />{stepDrop.toFixed(1)}% step
                      </span>
                    )}
                    {i === 0 && <span className="w-20" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: source conversion + drop-off insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Conversion by traffic source</h3>
            <button className="text-[11px] font-semibold text-primary hover:underline">Compare →</button>
          </div>
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Source</th>
                <th className="px-4 py-2 text-right font-semibold">Visitors</th>
                <th className="px-4 py-2 text-right font-semibold">Purchases</th>
                <th className="px-4 py-2 text-right font-semibold">Conv. Rate</th>
                <th className="px-4 py-2 text-right font-semibold">AOV</th>
              </tr>
            </thead>
            <tbody className="">
              {sourceConversion.map((s) => (
                <tr key={s.source} className="">
                  <td className="px-4 py-2 font-medium text-gray-900">{s.source}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{s.visitors.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{s.purchases}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{s.rate.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right text-gray-700">${s.aov.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Drop-off insights</h3>
            <span className="text-[11px] text-gray-500 tabular-nums">{dropoffInsights.length}</span>
          </div>
          <div className="">
            {dropoffInsights.map((a, i) => (
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
      </div>
    </div>
  );
};

export default ConversionMetrics;
