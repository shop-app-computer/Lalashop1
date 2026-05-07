import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

type Status = 'approved' | 'declined' | 'pending';

const data: { id: number; requested: string; amount: string; bank: string; account: string; status: Status; admin: string; processed: string; reason?: string }[] = [
  { id: 700112451, requested: '2024-04-23 14:30:12', amount: '5,000,000', bank: 'BCEL One', account: '160-12-3456', status: 'pending', admin: '—', processed: '—' },
  { id: 700100020, requested: '2024-04-18 11:02:33', amount: '3,200,000', bank: 'BCEL One', account: '160-12-3456', status: 'approved', admin: 'admin_alex', processed: '2024-04-18 11:45:10' },
  { id: 700099017, requested: '2024-04-12 16:50:18', amount: '1,000,000', bank: 'JDB Bank', account: '751-01-9988', status: 'declined', admin: 'admin_keo', processed: '2024-04-12 17:20:05', reason: 'Bank holder mismatch' },
  { id: 700098001, requested: '2024-04-05 09:11:40', amount: '8,500,000', bank: 'BCEL One', account: '160-12-3456', status: 'approved', admin: 'admin_alex', processed: '2024-04-05 10:00:21' },
  { id: 700096014, requested: '2024-03-28 13:20:00', amount: '2,400,000', bank: 'BCEL One', account: '160-12-3456', status: 'approved', admin: 'admin_lin', processed: '2024-03-28 14:00:11' },
];

const badge: Record<Status, { cls: string; icon: typeof CheckCircle2; label: string }> = {
  approved: { cls: 'bg-green-50 text-green-700', icon: CheckCircle2, label: 'approved' },
  declined: { cls: 'bg-red-50 text-red-700', icon: XCircle, label: 'declined' },
  pending: { cls: 'bg-orange-50 text-orange-700', icon: Clock, label: 'pending' },
};

const WithdrawalHistoryTab = () => {
  const total = data.length;
  const approved = data.filter((d) => d.status === 'approved').length;
  const declined = data.filter((d) => d.status === 'declined').length;
  const last = data[0];
  const totalApproved = data
    .filter((d) => d.status === 'approved')
    .reduce((s, d) => s + Number(d.amount.replace(/,/g, '')), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
        <div>
          <p className="text-gray-500">total requests</p>
          <p className="text-base font-bold tabular-nums">{total}</p>
        </div>
        <div>
          <p className="text-gray-500">approved</p>
          <p className="text-base font-bold tabular-nums text-green-700">{approved}</p>
        </div>
        <div>
          <p className="text-gray-500">declined</p>
          <p className="text-base font-bold tabular-nums text-red-700">{declined}</p>
        </div>
        <div>
          <p className="text-gray-500">total paid out (₭)</p>
          <p className="text-base font-bold tabular-nums">{totalApproved.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">last request</p>
          <p className="font-mono text-[11px] text-gray-700">{last.requested}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">withdraw id</th>
              <th className="px-4 py-2 text-left font-semibold">requested</th>
              <th className="px-4 py-2 text-right font-semibold">amount (₭)</th>
              <th className="px-4 py-2 text-left font-semibold">bank / account</th>
              <th className="px-4 py-2 text-left font-semibold">status</th>
              <th className="px-4 py-2 text-left font-semibold">admin</th>
              <th className="px-4 py-2 text-left font-semibold">processed</th>
              <th className="px-4 py-2 text-left font-semibold">reason</th>
            </tr>
          </thead>
          <tbody>
            {data.map((w) => {
              const B = badge[w.status];
              const Icon = B.icon;
              return (
                <tr key={w.id} className="border-t border-gray-50">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{w.id}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{w.requested}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{w.amount}</td>
                  <td className="px-4 py-2">
                    <div className="text-gray-700">{w.bank}</div>
                    <div className="font-mono text-[11px] text-gray-500">{w.account}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${B.cls}`}>
                      <Icon className="w-3 h-3" /> {B.label}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">
                    {w.admin === '—' ? <span className="text-gray-300">—</span> : `@${w.admin}`}
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{w.processed}</td>
                  <td className="px-4 py-2 text-[11px] text-gray-600">{w.reason || <span className="text-gray-300">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalHistoryTab;
