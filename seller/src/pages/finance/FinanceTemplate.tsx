import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  Eye, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const FinancePage = ({ title, type }: { title: string, type: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const transactions = [
    { id: 'TXN-9901', description: 'Payout to Bank Account', amount: -1200.00, date: '2024-04-28', status: 'Completed', type: 'withdrawal' },
    { id: 'TXN-9902', description: 'Order #ORD-7721 Payment', amount: 45.00, date: '2024-04-28', status: 'Completed', type: 'income' },
    { id: 'TXN-9903', description: 'Refund for Order #ORD-7650', amount: -35.00, date: '2024-04-27', status: 'Processing', type: 'refund' },
    { id: 'TXN-9904', description: 'Monthly Platform Fee', amount: -29.00, date: '2024-04-25', status: 'Completed', type: 'fee' },
    { id: 'TXN-9905', description: 'Order #ORD-7710 Payment', amount: 120.00, date: '2024-04-24', status: 'Completed', type: 'income' },
    { id: 'TXN-9906', description: 'Order #ORD-7705 Payment', amount: 89.00, date: '2024-04-23', status: 'Completed', type: 'income' },
    { id: 'TXN-9907', description: 'Payout to Bank Account', amount: -800.00, date: '2024-04-21', status: 'Completed', type: 'withdrawal' },
  ];

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'processing': return 'bg-orange-50 text-orange-700';
      case 'failed': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAmountColor = (t: string) => {
    if (t === 'income') return 'text-green-600';
    return 'text-red-600';
  };

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const fmt = (n: number) => {
    const sign = n < 0 ? '-' : '+';
    return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          New Withdrawal
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
          Type: <span className="font-semibold text-gray-900 ml-1 capitalize">{type || 'All'}</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Currency: <span className="font-semibold text-gray-900 ml-1">USD</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transaction…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total {title}</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">$12,450.00</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />6.4% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">This Month</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">$1,200.00</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-red-600 mt-1">
            <ArrowDown className="w-3 h-3" />2.1% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Pending Approval</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">$350.00</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">2 items waiting</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Available Balance</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">$10,900.00</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Ready to withdraw</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">Recent {title}</h3>
          <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Transaction ID</th>
                <th className="px-4 py-2 text-left font-semibold">Description</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-right font-semibold">Amount</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {transactions.map((txn) => (
                <tr key={txn.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{txn.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{txn.description}</td>
                  <td className="px-4 py-2 text-gray-700 capitalize">{txn.type}</td>
                  <td className="px-4 py-2 text-gray-500">{txn.date}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${getAmountColor(txn.type)}`}>{fmt(txn.amount)}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing <span className="font-semibold text-gray-900">1–{transactions.length}</span> of <span className="font-semibold text-gray-900">214</span> transactions</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
