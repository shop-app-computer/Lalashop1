import React, { useState } from 'react';
import { Search, Download, Calendar } from 'lucide-react';

type AuditEntry = {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  module: string;
  target: string;
  ip: string;
  result: 'success' | 'failed';
};

const mockAudit: AuditEntry[] = [
  { id: 'AUD-9401', timestamp: '2026-04-30 09:42:11', admin: 'Admin Alex', action: 'approve_kyc', module: 'kyc', target: 'KYC-2024-001', ip: '192.168.1.45', result: 'success' },
  { id: 'AUD-9400', timestamp: '2026-04-30 09:38:02', admin: 'Admin Keo', action: 'process_withdrawal', module: 'finance', target: 'WD-700112451', ip: '10.0.0.12', result: 'success' },
  { id: 'AUD-9399', timestamp: '2026-04-30 09:21:55', admin: 'Admin Somsack', action: 'suspend_user', module: 'users', target: 'U-1003', ip: '172.16.0.5', result: 'success' },
  { id: 'AUD-9398', timestamp: '2026-04-30 08:55:33', admin: 'Admin Mali', action: 'ban_product', module: 'products', target: 'PRD-7720', ip: '192.168.1.102', result: 'success' },
  { id: 'AUD-9397', timestamp: '2026-04-30 08:42:11', admin: 'Admin Alex', action: 'edit_role', module: 'admins', target: 'finance_admin', ip: '192.168.1.45', result: 'success' },
  { id: 'AUD-9396', timestamp: '2026-04-30 02:15:00', admin: 'Admin Alex', action: 'login_attempt', module: 'auth', target: '—', ip: '49.230.x.x', result: 'failed' },
  { id: 'AUD-9395', timestamp: '2026-04-29 22:01:08', admin: 'Admin Somsack', action: 'close_shop', module: 'shops', target: 'SHOP-1010', ip: '172.16.0.5', result: 'success' },
];

const moduleBadge: Record<string, string> = {
  auth: 'bg-red-50 text-red-700',
  users: 'bg-blue-50 text-blue-700',
  shops: 'bg-purple-50 text-purple-700',
  products: 'bg-orange-50 text-orange-700',
  finance: 'bg-green-50 text-green-700',
  kyc: 'bg-cyan-50 text-cyan-700',
  admins: 'bg-gray-100 text-gray-700',
};

const AuditLogPage = () => {
  const [q, setQ] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const filtered = mockAudit.filter(
    (a) => (moduleFilter === 'all' || a.module === moduleFilter) &&
      (!q || a.admin.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()) || a.target.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-4 text-sm">
      <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
        <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
      </button>

      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Date Range
        </button>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="text-[11px] font-medium text-gray-700 px-2 py-1 rounded outline-none cursor-pointer"
        >
          <option value="all">All Modules</option>
          <option value="auth">Auth</option>
          <option value="users">Users</option>
          <option value="shops">Shops</option>
          <option value="products">Products</option>
          <option value="finance">Finance</option>
          <option value="kyc">KYC</option>
          <option value="admins">Admins</option>
        </select>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search admin, action, target..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Timestamp</th>
                <th className="px-4 py-2 text-left font-semibold">Admin</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
                <th className="px-4 py-2 text-left font-semibold">Module</th>
                <th className="px-4 py-2 text-left font-semibold">Target</th>
                <th className="px-4 py-2 text-left font-semibold">IP</th>
                <th className="px-4 py-2 text-left font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{a.id}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{a.timestamp}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{a.admin}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{a.action}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${moduleBadge[a.module] || 'bg-gray-100 text-gray-600'}`}>
                      {a.module}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{a.target}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{a.ip}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${a.result === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {a.result === 'success' ? 'Success' : 'Failed'}
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

export default AuditLogPage;
