import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  MoreVertical, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const AffiliatePage = ({ title }: { title: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const creators = [
    { id: 'CRT-001', name: 'Liza Beauty', platform: 'TikTok', followers: 1_200_000, sales: 12_400, commission: 10, status: 'Top Rated' },
    { id: 'CRT-002', name: 'Tech Master', platform: 'YouTube', followers: 500_000, sales: 8_900, commission: 8, status: 'Active' },
    { id: 'CRT-003', name: 'Fashion Queen', platform: 'Instagram', followers: 850_000, sales: 15_200, commission: 12, status: 'Top Rated' },
    { id: 'CRT-004', name: 'Chef Som', platform: 'Facebook', followers: 200_000, sales: 2_100, commission: 5, status: 'Active' },
    { id: 'CRT-005', name: 'Traveler Boy', platform: 'TikTok', followers: 150_000, sales: 1_500, commission: 7, status: 'New' },
    { id: 'CRT-006', name: 'Home Goods Lao', platform: 'Instagram', followers: 95_000, sales: 980, commission: 6, status: 'Active' },
    { id: 'CRT-007', name: 'Daily Vibes', platform: 'TikTok', followers: 320_000, sales: 4_300, commission: 9, status: 'Active' },
  ];

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'top rated': return 'bg-purple-50 text-purple-700';
      case 'active': return 'bg-green-50 text-green-700';
      case 'new': return 'bg-blue-50 text-blue-700';
      case 'paused': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtFollowers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  const totalSales = creators.reduce((s, c) => s + c.sales, 0);
  const topRated = creators.filter((c) => c.status === 'Top Rated').length;
  const avgCommission = creators.reduce((s, c) => s + c.commission, 0) / creators.length;
  const commissionPaid = creators.reduce((s, c) => s + (c.sales * c.commission) / 100, 0);

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          Invite Creator
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
          Platform: <span className="font-semibold text-gray-900 ml-1">All</span>
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
            placeholder="Search creator…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total Creators</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">1,240</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />5.0% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Affiliate Sales</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{fmt(totalSales)}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />12.6% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Commission Paid</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{fmt(commissionPaid)}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Avg {avgCommission.toFixed(1)}%</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Top Performers</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{topRated * 22 + 1 || 45}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-red-600 mt-1">
            <ArrowDown className="w-3 h-3" />2.1% vs prev
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Creator performance</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Creator ID</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Platform</th>
                <th className="px-4 py-2 text-right font-semibold">Followers</th>
                <th className="px-4 py-2 text-right font-semibold">Generated Sales</th>
                <th className="px-4 py-2 text-right font-semibold">Commission</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {creators.map((crt) => (
                <tr key={crt.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{crt.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{crt.name}</td>
                  <td className="px-4 py-2 text-gray-700">{crt.platform}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{fmtFollowers(crt.followers)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmt(crt.sales)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{crt.commission}%</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusColor(crt.status)}`}>
                      {crt.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing <span className="font-semibold text-gray-900">1–{creators.length}</span> of <span className="font-semibold text-gray-900">1,240</span> creators</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
