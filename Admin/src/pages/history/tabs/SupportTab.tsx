import React from 'react';

type Status = 'open' | 'in-progress' | 'resolved' | 'closed';

const data: { id: string; subject: string; category: string; status: Status; created: string; updated: string; assignedTo: string }[] = [
  { id: 'TKT-2201', subject: 'cannot withdraw to new bank', category: 'payments', status: 'in-progress', created: '2024-04-23 10:00', updated: '2024-04-23 14:00', assignedTo: 'support_lin' },
  { id: 'TKT-2150', subject: 'order ORD-7611 not received', category: 'orders', status: 'resolved', created: '2024-04-15 09:00', updated: '2024-04-16 11:00', assignedTo: 'support_kham' },
  { id: 'TKT-2100', subject: 'change phone number', category: 'account', status: 'closed', created: '2024-04-01 14:00', updated: '2024-04-02 10:00', assignedTo: 'support_lin' },
  { id: 'TKT-2050', subject: 'duplicate charge on top-up', category: 'payments', status: 'resolved', created: '2024-03-25 10:30', updated: '2024-03-25 16:20', assignedTo: 'support_kham' },
];

const statusBadge: Record<Status, string> = {
  open: 'bg-blue-50 text-blue-700',
  'in-progress': 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const SupportTab = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
      <div>
        <p className="text-gray-500">total tickets</p>
        <p className="text-base font-bold tabular-nums">{data.length}</p>
      </div>
      <div>
        <p className="text-gray-500">open / in-progress</p>
        <p className="text-base font-bold tabular-nums text-amber-700">{data.filter((d) => d.status === 'open' || d.status === 'in-progress').length}</p>
      </div>
      <div>
        <p className="text-gray-500">resolved</p>
        <p className="text-base font-bold tabular-nums text-green-700">{data.filter((d) => d.status === 'resolved').length}</p>
      </div>
      <div>
        <p className="text-gray-500">payment issues</p>
        <p className="text-base font-bold tabular-nums">{data.filter((d) => d.category === 'payments').length}</p>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-[12px] tabular-nums">
        <thead className="text-[11px] text-gray-500 tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">ticket id</th>
            <th className="px-4 py-2 text-left font-semibold">subject</th>
            <th className="px-4 py-2 text-left font-semibold">category</th>
            <th className="px-4 py-2 text-left font-semibold">status</th>
            <th className="px-4 py-2 text-left font-semibold">created</th>
            <th className="px-4 py-2 text-left font-semibold">updated</th>
            <th className="px-4 py-2 text-left font-semibold">assigned</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id} className="border-t border-gray-50">
              <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{t.id}</td>
              <td className="px-4 py-2 text-gray-900 font-medium">{t.subject}</td>
              <td className="px-4 py-2 text-gray-700">{t.category}</td>
              <td className="px-4 py-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[t.status]}`}>
                  {t.status}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{t.created}</td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{t.updated}</td>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-700">@{t.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default SupportTab;
