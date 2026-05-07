import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, FileText, Image as ImageIcon, ChevronDown } from 'lucide-react';

type Status = 'completed' | 'pending' | 'failed';

const payments: { id: number; userId: number; ip: string; name: string; orders: number; bankFrom: string; amount: string; balance: string; ref: string; slip: string; time: string; adminUser: string; status: Status }[] = [
  { id: 11021, userId: 1001, ip: '192.168.1.45', name: 'Somsack Souvanna', orders: 3, bankFrom: 'BCEL One', amount: '1,500,000', balance: '13,500,000', ref: 'REF-99201', slip: 'SLIP-99201.jpg', time: '2024-04-23 16:45:22', adminUser: 'admin_alex', status: 'completed' },
  { id: 11022, userId: 1002, ip: '110.164.2.5', name: 'Keo Viseth', orders: 1, bankFrom: 'Mastercard', amount: '850,000', balance: '5,200,000', ref: 'REF-11223', slip: 'SLIP-11223.jpg', time: '2024-04-23 14:22:08', adminUser: 'admin_keo', status: 'pending' },
];

const statusBadge: Record<Status, string> = {
  completed: 'bg-green-50 text-green-700',
  pending: 'bg-orange-50 text-orange-700',
  failed: 'bg-red-50 text-red-700',
};

const statusLabel: Record<Status, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
};

const PaymentPage = () => {
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

  const filtered = payments.filter(
    (p) => (filter === 'all' || p.status === filter) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase()) || String(p.id).includes(q))
  );

  const tabs: ('all' | Status)[] = ['all', 'completed', 'pending', 'failed'];

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
            placeholder="Search payment ID, name..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Payment ID</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">IP</th>
                <th className="px-4 py-2 text-right font-semibold">Orders</th>
                <th className="px-4 py-2 text-left font-semibold">Bank From</th>
                <th className="px-4 py-2 text-right font-semibold">Amount (₭)</th>
                <th className="px-4 py-2 text-right font-semibold">Balance (₭)</th>
                <th className="px-4 py-2 text-left font-semibold">Reference</th>
                <th className="px-4 py-2 text-left font-semibold">Slip</th>
                <th className="px-4 py-2 text-left font-semibold">Time</th>
                <th className="px-4 py-2 text-left font-semibold">Admin</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600 tabular-nums">{p.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    <Link href={`/users/${p.userId}`} className="hover:text-primary transition-colors">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{p.ip}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.orders}</td>
                  <td className="px-4 py-2 text-gray-700">{p.bankFrom}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{p.amount}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{p.balance}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3 text-gray-400" />
                      {p.ref}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                      <ImageIcon className="w-3 h-3" />
                      View Slip
                    </button>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{p.time}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">@{p.adminUser}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
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

export default PaymentPage;
