import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  MoreVertical, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const SupportTeamPage = ({ title, type }: { title: string, type: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const items = [
    { id: 'SUP-001', subject: 'Payment failed for Order #7721', user: 'Somsak J.', status: 'Open', priority: 'High', date: '2024-04-28' },
    { id: 'SUP-002', subject: 'Shipping address change request', user: 'Viphone S.', status: 'In Progress', priority: 'Medium', date: '2024-04-28' },
    { id: 'SUP-003', subject: 'Product received with damage', user: 'Keo P.', status: 'Resolved', priority: 'High', date: '2024-04-27' },
    { id: 'SUP-004', subject: 'Wholesale inquiry for bags', user: 'Anousone K.', status: 'Open', priority: 'Low', date: '2024-04-27' },
    { id: 'SUP-005', subject: 'Refund status update', user: 'Boualay T.', status: 'Resolved', priority: 'Medium', date: '2024-04-26' },
    { id: 'SUP-006', subject: 'Account lockout', user: 'Ladda B.', status: 'In Progress', priority: 'High', date: '2024-04-26' },
    { id: 'SUP-007', subject: 'Bulk order quote needed', user: 'Sengdeuane V.', status: 'Open', priority: 'Medium', date: '2024-04-25' },
  ];

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'open': return 'bg-blue-50 text-blue-700';
      case 'in progress': return 'bg-orange-50 text-orange-700';
      case 'resolved': return 'bg-gray-100 text-gray-700';
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-orange-50 text-orange-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const openCount = items.filter((i) => i.status === 'Open').length;
  const inProgressCount = items.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = items.filter((i) => i.status === 'Resolved').length;
  const highPriority = items.filter((i) => i.priority === 'High').length;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          {type === 'support' ? 'Create Ticket' : 'Add Staff'}
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
          Priority: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search ticket, subject, user…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Active Issues</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{openCount + inProgressCount}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-orange-600 mt-1">
            <ArrowUp className="w-3 h-3" />2 new today
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Avg Response</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">1.5h</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowDown className="w-3 h-3" />0.4h vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Resolved Today</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{resolvedCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">SLA compliant</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">High Priority</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{highPriority}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">8 team members</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Recent {title.toLowerCase()}</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Subject / Name</th>
                <th className="px-4 py-2 text-left font-semibold">User / Role</th>
                <th className="px-4 py-2 text-left font-semibold">Priority</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {items.map((item) => (
                <tr key={item.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{item.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{item.subject}</td>
                  <td className="px-4 py-2 text-gray-700">{item.user}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{item.date}</td>
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
          <span>Showing <span className="font-semibold text-gray-900">1–{items.length}</span> of <span className="font-semibold text-gray-900">63</span> records</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTeamPage;
