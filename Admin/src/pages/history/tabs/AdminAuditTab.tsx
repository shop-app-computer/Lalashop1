import React from 'react';

const data: { id: string; admin: string; ip: string; action: string; before: string; after: string; date: string }[] = [
  { id: 'A-501', admin: 'admin_alex', ip: '10.0.0.5', action: 'approve withdrawal', before: 'pending #700100020', after: 'approved — 3,200,000 ₭', date: '2024-04-18 11:45' },
  { id: 'A-500', admin: 'admin_keo', ip: '10.0.0.7', action: 'decline withdrawal', before: 'pending #700099017', after: 'declined — bank holder mismatch', date: '2024-04-12 17:20' },
  { id: 'A-499', admin: 'admin_alex', ip: '10.0.0.5', action: 'verify kyc — id card', before: 'pending', after: 'verified', date: '2024-04-20 10:15' },
  { id: 'A-498', admin: 'admin_keo', ip: '10.0.0.7', action: 'reject kyc — bank statement', before: 'pending', after: 'rejected — document expired', date: '2024-04-18 14:00' },
  { id: 'A-497', admin: 'admin_alex', ip: '10.0.0.5', action: 'add admin note', before: '—', after: 'verified holder identity by phone call', date: '2024-04-15 09:30' },
  { id: 'A-496', admin: 'admin_alex', ip: '10.0.0.5', action: 'set primary bank', before: 'JDB 751-01-9988', after: 'BCEL 160-12-3456', date: '2024-04-22 09:30' },
  { id: 'A-495', admin: 'admin_keo', ip: '10.0.0.7', action: 'remove bank account', before: 'JDB 751-01-9988', after: 'removed', date: '2024-04-15 14:20' },
  { id: 'A-494', admin: 'admin_lin', ip: '10.0.0.9', action: 'force logout', before: 'session active', after: 'all sessions revoked', date: '2024-04-10 18:00' },
];

const AdminAuditTab = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
      <div>
        <p className="text-gray-500">total actions</p>
        <p className="text-base font-bold tabular-nums">{data.length}</p>
      </div>
      <div>
        <p className="text-gray-500">unique admins</p>
        <p className="text-base font-bold tabular-nums">{new Set(data.map((d) => d.admin)).size}</p>
      </div>
      <div>
        <p className="text-gray-500">approvals</p>
        <p className="text-base font-bold tabular-nums text-green-700">{data.filter((d) => d.action.includes('approve') || d.action.includes('verify')).length}</p>
      </div>
      <div>
        <p className="text-gray-500">rejections</p>
        <p className="text-base font-bold tabular-nums text-red-700">{data.filter((d) => d.action.includes('decline') || d.action.includes('reject')).length}</p>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-[12px] tabular-nums">
        <thead className="text-[11px] text-gray-500 tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">audit id</th>
            <th className="px-4 py-2 text-left font-semibold">admin / ip</th>
            <th className="px-4 py-2 text-left font-semibold">action</th>
            <th className="px-4 py-2 text-left font-semibold">before</th>
            <th className="px-4 py-2 text-left font-semibold">after</th>
            <th className="px-4 py-2 text-left font-semibold">date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a) => (
            <tr key={a.id} className="border-t border-gray-50">
              <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{a.id}</td>
              <td className="px-4 py-2">
                <div className="font-mono text-[11px] font-semibold text-gray-900">@{a.admin}</div>
                <div className="font-mono text-[11px] text-gray-500">{a.ip}</div>
              </td>
              <td className="px-4 py-2 text-gray-700 font-medium">{a.action}</td>
              <td className="px-4 py-2 text-[11px] text-gray-500">{a.before}</td>
              <td className="px-4 py-2 text-[11px] text-gray-900">{a.after}</td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{a.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminAuditTab;
