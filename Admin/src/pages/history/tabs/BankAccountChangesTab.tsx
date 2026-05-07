import React from 'react';
import { Plus, Minus, Edit3, Star } from 'lucide-react';

type Action = 'added' | 'removed' | 'verified' | 'set-primary';

const data: { id: string; action: Action; bank: string; account: string; holder: string; date: string; daysSince: number; admin: string }[] = [
  { id: 'BC-014', action: 'set-primary', bank: 'BCEL One', account: '160-12-3456', holder: 'somsack souvanna', date: '2024-04-22 09:30', daysSince: 1, admin: 'admin_alex' },
  { id: 'BC-013', action: 'added', bank: 'BCEL One', account: '160-12-3456', holder: 'somsack souvanna', date: '2024-04-22 09:00', daysSince: 1, admin: '—' },
  { id: 'BC-012', action: 'removed', bank: 'JDB Bank', account: '751-01-9988', holder: 'somsack s.', date: '2024-04-15 14:20', daysSince: 8, admin: 'admin_keo' },
  { id: 'BC-011', action: 'verified', bank: 'JDB Bank', account: '751-01-9988', holder: 'somsack s.', date: '2024-03-30 11:00', daysSince: 24, admin: 'admin_keo' },
  { id: 'BC-010', action: 'added', bank: 'JDB Bank', account: '751-01-9988', holder: 'somsack s.', date: '2024-03-30 10:55', daysSince: 24, admin: '—' },
  { id: 'BC-009', action: 'added', bank: 'LDB', account: '120-00-1122', holder: 'somsack souvanna', date: '2024-02-10 09:00', daysSince: 73, admin: '—' },
];

const actionBadge: Record<Action, { cls: string; icon: typeof Plus }> = {
  added: { cls: 'bg-green-50 text-green-700', icon: Plus },
  removed: { cls: 'bg-red-50 text-red-700', icon: Minus },
  verified: { cls: 'bg-blue-50 text-blue-700', icon: Edit3 },
  'set-primary': { cls: 'bg-amber-50 text-amber-700', icon: Star },
};

const BankAccountChangesTab = () => {
  const totalChanges = data.length;
  const lastChange = data[0];
  const accountsAdded = data.filter((d) => d.action === 'added').length;
  const accountsRemoved = data.filter((d) => d.action === 'removed').length;
  const primaryChanges = data.filter((d) => d.action === 'set-primary').length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
        <div>
          <p className="text-gray-500">total changes</p>
          <p className="text-base font-bold tabular-nums">{totalChanges}</p>
        </div>
        <div>
          <p className="text-gray-500">accounts added</p>
          <p className="text-base font-bold tabular-nums text-green-700">{accountsAdded}</p>
        </div>
        <div>
          <p className="text-gray-500">accounts removed</p>
          <p className="text-base font-bold tabular-nums text-red-700">{accountsRemoved}</p>
        </div>
        <div>
          <p className="text-gray-500">primary switches</p>
          <p className="text-base font-bold tabular-nums text-amber-700">{primaryChanges}</p>
        </div>
        <div>
          <p className="text-gray-500">last change</p>
          <p className="font-mono text-[11px] text-gray-700">{lastChange.date}</p>
          <p className="text-[10px] text-amber-600">({lastChange.daysSince} days ago)</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">change id</th>
              <th className="px-4 py-2 text-left font-semibold">action</th>
              <th className="px-4 py-2 text-left font-semibold">bank</th>
              <th className="px-4 py-2 text-left font-semibold">account</th>
              <th className="px-4 py-2 text-left font-semibold">holder name</th>
              <th className="px-4 py-2 text-left font-semibold">date</th>
              <th className="px-4 py-2 text-right font-semibold">days since</th>
              <th className="px-4 py-2 text-left font-semibold">admin</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const A = actionBadge[d.action];
              const Icon = A.icon;
              return (
                <tr key={d.id} className="border-t border-gray-50">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{d.id}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${A.cls}`}>
                      <Icon className="w-3 h-3" /> {d.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{d.bank}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{d.account}</td>
                  <td className="px-4 py-2 text-gray-700">{d.holder}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{d.date}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{d.daysSince}d</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">
                    {d.admin === '—' ? <span className="text-gray-300">—</span> : `@${d.admin}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankAccountChangesTab;
