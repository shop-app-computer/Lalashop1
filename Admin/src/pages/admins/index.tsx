import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, ShieldCheck, ChevronDown } from 'lucide-react';

type Status = 'active' | 'suspended' | 'invited';

const mockAdmins = [
  { id: 'ADM-0001', name: 'Admin Alex', email: 'alex@lala.shop', role: 'Super Admin', lastLogin: '2026-04-30 09:12', status: 'active' as Status, twoFactor: true },
  { id: 'ADM-0002', name: 'Admin Keo', email: 'keo@lala.shop', role: 'Finance Admin', lastLogin: '2026-04-30 08:30', status: 'active' as Status, twoFactor: true },
  { id: 'ADM-0003', name: 'Admin Somsack', email: 'somsack@lala.shop', role: 'Support Admin', lastLogin: '2026-04-29 22:01', status: 'active' as Status, twoFactor: false },
  { id: 'ADM-0004', name: 'Admin Mali', email: 'mali@lala.shop', role: 'Content Admin', lastLogin: '2026-04-25 14:00', status: 'suspended' as Status, twoFactor: true },
  { id: 'ADM-0005', name: 'Admin Viphone', email: 'viphone@lala.shop', role: 'Support Admin', lastLogin: '—', status: 'invited' as Status, twoFactor: false },
];

const statusBadge: Record<Status, string> = {
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-700',
  invited: 'bg-orange-50 text-orange-700',
};

const statusLabel: Record<Status, string> = {
  active: 'Active',
  suspended: 'Suspended',
  invited: 'Invited',
};

const AdminsList = () => {
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

  const filtered = mockAdmins.filter(
    (a) => (filter === 'all' || a.status === filter) &&
      (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase()))
  );

  const tabs: ('all' | Status)[] = ['all', 'active', 'suspended', 'invited'];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        <Link
          href="/admins/audit"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100"
        >
          Audit Log
        </Link>
        <Link
          href="/admins/roles"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Roles
        </Link>
        <Link
          href="/admins/invite"
          className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Invite Admin
        </Link>
      </div>

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
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search name, email..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Admin ID</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Email</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">2FA</th>
                <th className="px-4 py-2 text-left font-semibold">Last Login</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{a.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-2 text-gray-700">{a.email}</td>
                  <td className="px-4 py-2 text-gray-700">{a.role}</td>
                  <td className="px-4 py-2">
                    {a.twoFactor ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">On</span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-700">Off</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{a.lastLogin}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    No admins match your filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminsList;
