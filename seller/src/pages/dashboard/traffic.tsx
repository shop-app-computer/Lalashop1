import React, { useState } from 'react';
import {
  Calendar, Download, Filter, ArrowUp, ArrowDown, MoreHorizontal,
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

const sources = [
  { name: 'TikTok Shop', visits: 4520, share: 44, delta: 12.4 },
  { name: 'Facebook Messenger', visits: 2840, share: 28, delta: -2.3 },
  { name: 'Google Search', visits: 1200, share: 12, delta: 0.4 },
  { name: 'Direct Access', visits: 850, share: 8, delta: 4.1 },
  { name: 'Instagram Referral', visits: 830, share: 8, delta: 6.8 },
];

const locations = [
  { city: 'Vientiane', country: 'LA', visits: 6_350, share: 62.0 },
  { city: 'Bangkok', country: 'TH', visits: 1_843, share: 18.0 },
  { city: 'Luang Prabang', country: 'LA', visits: 1_229, share: 12.0 },
  { city: 'Pakse', country: 'LA', visits: 512, share: 5.0 },
  { city: 'Chiang Mai', country: 'TH', visits: 306, share: 3.0 },
];

const landingPages = [
  { path: '/products/linen-shirt', visits: 2_140, bounce: 32.1, avgTime: '1m 48s' },
  { path: '/', visits: 1_820, bounce: 41.8, avgTime: '52s' },
  { path: '/products/cotton-tote', visits: 1_312, bounce: 28.4, avgTime: '2m 14s' },
  { path: '/collections/spring-2026', visits: 980, bounce: 35.6, avgTime: '1m 22s' },
  { path: '/products/ceramic-pour-over', visits: 712, bounce: 26.9, avgTime: '2m 38s' },
];

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

const TrafficAnalytics = () => {
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
            placeholder="Search source, page…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* Device breakdown KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Total Visits" value="10,240" delta={9.6} deltaLabel="vs prev" />
        <KPI label="Mobile" value="84%" delta={1.2} deltaLabel="vs prev" />
        <KPI label="Desktop" value="12%" delta={-0.8} deltaLabel="vs prev" />
        <KPI label="Tablet" value="4%" delta={-0.4} deltaLabel="vs prev" />
      </div>

      {/* Sources + Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Traffic by source</h3>
            <button className="text-[11px] text-gray-500 hover:text-black"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="px-4 py-2">
            {sources.map((s) => (
              <div key={s.name} className="py-2.5">
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-gray-900">{s.visits.toLocaleString()}</span>
                    <span className={`inline-flex items-center text-[10px] font-semibold ${s.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.delta >= 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                      {Math.abs(s.delta).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${s.share}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-8 text-right tabular-nums">{s.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Top locations</h3>
            <button className="text-[11px] font-semibold text-primary hover:underline">View map →</button>
          </div>
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">City</th>
                <th className="px-4 py-2 text-right font-semibold">Visits</th>
                <th className="px-4 py-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="">
              {locations.map((l) => (
                <tr key={`${l.city}-${l.country}`} className="">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{l.city}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{l.country}</div>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{l.visits.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{l.share.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top landing pages */}
      <div className="rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Top landing pages</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Path</th>
                <th className="px-4 py-2 text-right font-semibold">Visits</th>
                <th className="px-4 py-2 text-right font-semibold">Bounce Rate</th>
                <th className="px-4 py-2 text-right font-semibold">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="">
              {landingPages.map((p) => (
                <tr key={p.path} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-900">{p.path}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{p.visits.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.bounce.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalytics;
