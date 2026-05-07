import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, Check, X, ChevronDown } from 'lucide-react';

type Status = 'pending' | 'approved' | 'declined';

const withdrawals: { id: number; userId: number; userTimestamp: string; fullName: string; bank: string; accountNo: string; phone: string; amount: string; adminUser: string; processedTimestamp: string; status: Status }[] = [
  { id: 700112451, userId: 2001, userTimestamp: '2024-04-23 15:20:33', fullName: 'Anna Soukaloun', bank: 'BCEL One', accountNo: '160-55-7788', phone: '020 9999 8888', amount: '2,500,000', adminUser: 'admin_alex', processedTimestamp: '2024-04-23 15:40:12', status: 'pending' },
  { id: 141111111, userId: 2002, userTimestamp: '2024-04-23 10:05:12', fullName: 'Vong Sayaboury', bank: 'LDB Bank', accountNo: '150-11-2233', phone: '020 7777 6666', amount: '8,200,000', adminUser: 'admin_keo', processedTimestamp: '2024-04-23 10:15:55', status: 'approved' },
];

const statusBadge: Record<Status, string> = {
  pending: 'bg-orange-50 text-orange-700',
  approved: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
};

const statusLabel: Record<Status, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
};

const CreatorWithdrawals = () => {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = withdrawals.filter(
    (w) => (filter === 'all' || w.status === filter) &&
      (!q || w.fullName.toLowerCase().includes(q.toLowerCase()) || String(w.id).includes(q))
  );

  const tabs: ('all' | Status)[] = ['all', 'pending', 'approved', 'declined'];

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[100px] justify-between"
          >
            <span>{filter === 'all' ? 'All' : statusLabel[filter as Status]}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-md shadow-md py-1 z-10 min-w-[120px]">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilter(t); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    filter === t
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {t === 'all' ? 'All' : statusLabel[t as Status]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Date Range
        </button>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search ID, name..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Requested</th>
                <th className="px-4 py-2 text-left font-semibold">Transaction ID</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Bank</th>
                <th className="px-4 py-2 text-left font-semibold">Account</th>
                <th className="px-4 py-2 text-left font-semibold">Phone</th>
                <th className="px-4 py-2 text-right font-semibold">Amount (₭)</th>
                <th className="px-4 py-2 text-left font-semibold">Admin</th>
                <th className="px-4 py-2 text-left font-semibold">Processed</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{w.userTimestamp}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600 tabular-nums">{w.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    <Link href={`/users/${w.userId}`} className="hover:text-primary transition-colors">
                      {w.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{w.bank}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{w.accountNo}</td>
                  <td className="px-4 py-2 text-gray-700">{w.phone}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{w.amount}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">@{w.adminUser}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{w.processedTimestamp}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[w.status]}`}>
                      {statusLabel[w.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button title="Approve" className="text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded p-1">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button title="Decline" className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreatorWithdrawals;
