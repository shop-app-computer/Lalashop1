import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  MoreVertical, Mail, Phone, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const CustomersPage = ({ title }: { title: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const customers = [
    { id: 'CUS-101', name: 'Somsak J.', email: 'somsak@example.com', phone: '+856 20 55XX XXXX', orders: 12, spent: 1200, joined: '2023-12-01', label: 'VIP' },
    { id: 'CUS-102', name: 'Viphone S.', email: 'viphone@example.com', phone: '+856 20 22XX XXXX', orders: 5, spent: 450, joined: '2024-01-15', label: 'Regular' },
    { id: 'CUS-103', name: 'Keo P.', email: 'keo@example.com', phone: '+856 20 99XX XXXX', orders: 24, spent: 3400, joined: '2023-10-10', label: 'VIP' },
    { id: 'CUS-104', name: 'Anousone K.', email: 'anousone@example.com', phone: '+856 20 77XX XXXX', orders: 2, spent: 89, joined: '2024-03-20', label: 'New' },
    { id: 'CUS-105', name: 'Boualay T.', email: 'boualay@example.com', phone: '+856 20 54XX XXXX', orders: 8, spent: 620, joined: '2023-11-22', label: 'Regular' },
    { id: 'CUS-106', name: 'Ladda B.', email: 'ladda@example.com', phone: '+856 20 33XX XXXX', orders: 16, spent: 2150, joined: '2023-09-05', label: 'VIP' },
    { id: 'CUS-107', name: 'Sengdeuane V.', email: 'sengdeuane@example.com', phone: '+856 20 88XX XXXX', orders: 1, spent: 28, joined: '2024-04-12', label: 'New' },
  ];

  const getLabelColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'vip': return 'bg-purple-50 text-purple-700';
      case 'new': return 'bg-blue-50 text-blue-700';
      case 'regular': return 'bg-gray-100 text-gray-700';
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

  const totalSpend = customers.reduce((s, c) => s + c.spent, 0);
  const vipCount = customers.filter((c) => c.label === 'VIP').length;
  const newCount = customers.filter((c) => c.label === 'New').length;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          Add Customer
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
          Segment: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total Customers</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{customers.length.toLocaleString()}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />3.2% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">VIP</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{vipCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">High-value retention</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">New</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{newCount}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />12.4% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Lifetime Spend</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{fmt(totalSpend)}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-red-600 mt-1">
            <ArrowDown className="w-3 h-3" />0.8% vs prev
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Customer list</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Customer ID</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Contact</th>
                <th className="px-4 py-2 text-right font-semibold">Orders</th>
                <th className="px-4 py-2 text-right font-semibold">Total Spent</th>
                <th className="px-4 py-2 text-left font-semibold">Joined</th>
                <th className="px-4 py-2 text-left font-semibold">Label</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {customers.map((cus) => (
                <tr key={cus.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{cus.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{cus.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center text-[11px] text-gray-600">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" /> {cus.email}
                      </span>
                      <span className="inline-flex items-center text-[11px] text-gray-500">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" /> {cus.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{cus.orders}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmt(cus.spent)}</td>
                  <td className="px-4 py-2 text-gray-500">{cus.joined}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getLabelColor(cus.label)}`}>
                      {cus.label}
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
          <span>Showing <span className="font-semibold text-gray-900">1–{customers.length}</span> of <span className="font-semibold text-gray-900">1,240</span> customers</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
