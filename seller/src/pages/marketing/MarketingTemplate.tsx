import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  MoreVertical, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const MarketingPage = ({ title }: { title: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const items = [
    { id: 'MKT-001', name: 'Summer Sale 2024', type: 'Campaign', status: 'Active', reach: 12500, conversion: 3.2, end: '2024-06-30' },
    { id: 'MKT-002', name: 'WELCOME20', type: 'Coupon', status: 'Active', reach: 5000, conversion: 8.5, end: '2024-12-31' },
    { id: 'MKT-003', name: 'Flash Deal - Monday', type: 'Promotion', status: 'Scheduled', reach: 0, conversion: 0, end: '2024-05-01' },
    { id: 'MKT-004', name: 'New Arrival Broadcast', type: 'Broadcast', status: 'Completed', reach: 45000, conversion: 1.2, end: '2024-04-25' },
    { id: 'MKT-005', name: 'Loyalty Rewards', type: 'Campaign', status: 'Active', reach: 8200, conversion: 5.0, end: 'No End Date' },
    { id: 'MKT-006', name: 'Back to School', type: 'Campaign', status: 'Scheduled', reach: 0, conversion: 0, end: '2024-08-15' },
    { id: 'MKT-007', name: 'VIP Sale', type: 'Promotion', status: 'Expired', reach: 22100, conversion: 6.8, end: '2024-03-31' },
  ];

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700';
      case 'scheduled': return 'bg-blue-50 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'expired': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const totalReach = items.reduce((s, i) => s + i.reach, 0);
  const activeCount = items.filter((i) => i.status === 'Active').length;
  const avgConv = items.filter((i) => i.conversion > 0).reduce((s, i) => s + i.conversion, 0) / Math.max(items.filter((i) => i.conversion > 0).length, 1);
  const broadcastCount = items.filter((i) => i.type === 'Broadcast').length;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          Create New
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
          Type: <span className="font-semibold text-gray-900 ml-1">All</span>
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
            placeholder="Search initiatives…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total Reach</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{totalReach.toLocaleString()}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />18.4% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Active Coupons</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">12</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">{activeCount} initiatives running</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Avg Conv. Rate</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{avgConv.toFixed(1)}%</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-red-600 mt-1">
            <ArrowDown className="w-3 h-3" />0.3% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Broadcasts Sent</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{broadcastCount * 24 || 24}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />6.0% vs prev
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Recent activities</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Initiative</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-right font-semibold">Reach</th>
                <th className="px-4 py-2 text-right font-semibold">Conversion</th>
                <th className="px-4 py-2 text-left font-semibold">End Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {items.map((item) => (
                <tr key={item.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{item.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-2 text-gray-700">{item.type}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{item.reach.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{item.conversion.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-gray-500">{item.end}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
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
          <span>Showing <span className="font-semibold text-gray-900">1–{items.length}</span> of <span className="font-semibold text-gray-900">42</span> activities</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
