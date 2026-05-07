import React from 'react';
import { ArrowDownLeft, ShoppingBag, Award, Banknote, RefreshCw } from 'lucide-react';

type Source = 'sales' | 'bank-topup' | 'affiliate' | 'refund' | 'p2p';

const data: { id: string; date: string; type: Source; amount: string; from: string; ref: string; verified: boolean }[] = [
  { id: 'D-9001', date: '2024-04-23 12:30', type: 'sales', amount: '450,000', from: 'order ORD-7721 — buyer keo_v', ref: 'ORD-7721', verified: true },
  { id: 'D-9000', date: '2024-04-22 18:11', type: 'bank-topup', amount: '5,000,000', from: 'BCEL 160-12-3456 — somsack souvanna', ref: 'TXN-882910', verified: true },
  { id: 'D-8997', date: '2024-04-21 09:42', type: 'affiliate', amount: '45,000', from: 'system commission', ref: 'AFF-204', verified: true },
  { id: 'D-8995', date: '2024-04-19 21:08', type: 'bank-topup', amount: '2,000,000', from: 'BCEL 999-22-1111 — UNKNOWN HOLDER', ref: 'TXN-882700', verified: false },
  { id: 'D-8990', date: '2024-04-15 14:55', type: 'refund', amount: '180,000', from: 'order ORD-7611 refunded', ref: 'ORD-7611', verified: true },
  { id: 'D-8988', date: '2024-04-12 10:30', type: 'p2p', amount: '750,000', from: 'wallet — anousone', ref: 'P2P-552', verified: true },
];

const breakdown: { label: string; amount: string; pct: number; color: string; icon: typeof ShoppingBag }[] = [
  { label: 'sales revenue', amount: '450,000', pct: 5, color: 'bg-blue-500', icon: ShoppingBag },
  { label: 'bank top-ups', amount: '7,000,000', pct: 80, color: 'bg-green-500', icon: Banknote },
  { label: 'affiliate', amount: '45,000', pct: 1, color: 'bg-amber-500', icon: Award },
  { label: 'refunds', amount: '180,000', pct: 2, color: 'bg-cyan-500', icon: RefreshCw },
  { label: 'p2p transfers', amount: '750,000', pct: 12, color: 'bg-purple-500', icon: ArrowDownLeft },
];

const typeBadge: Record<Source, string> = {
  sales: 'bg-blue-50 text-blue-700',
  'bank-topup': 'bg-green-50 text-green-700',
  affiliate: 'bg-amber-50 text-amber-700',
  refund: 'bg-cyan-50 text-cyan-700',
  p2p: 'bg-purple-50 text-purple-700',
};

const DepositSourcesTab = () => (
  <div className="space-y-4">
    <div className="px-4 py-3 bg-gray-50/50">
      <p className="text-[11px] text-gray-500 mb-2">source-of-funds breakdown — last 30 days</p>
      <div className="flex h-2 rounded overflow-hidden">
        {breakdown.map((b) => (
          <div key={b.label} className={b.color} style={{ width: `${b.pct}%` }} title={`${b.label}: ${b.pct}%`} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
        {breakdown.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label}>
              <div className="flex items-center gap-1 text-gray-500">
                <Icon className="w-3 h-3" /> {b.label}
              </div>
              <div className="font-bold tabular-nums text-gray-900">₭{b.amount}</div>
              <div className="text-gray-400">{b.pct}%</div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-[12px] tabular-nums">
        <thead className="text-[11px] text-gray-500 tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">deposit id</th>
            <th className="px-4 py-2 text-left font-semibold">date</th>
            <th className="px-4 py-2 text-left font-semibold">type</th>
            <th className="px-4 py-2 text-right font-semibold">amount (₭)</th>
            <th className="px-4 py-2 text-left font-semibold">source / from</th>
            <th className="px-4 py-2 text-left font-semibold">reference</th>
            <th className="px-4 py-2 text-left font-semibold">verified</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id} className="border-t border-gray-50">
              <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{d.id}</td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{d.date}</td>
              <td className="px-4 py-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${typeBadge[d.type]}`}>
                  {d.type}
                </span>
              </td>
              <td className="px-4 py-2 text-right font-semibold text-gray-900">{d.amount}</td>
              <td className={`px-4 py-2 text-[11px] ${d.verified ? 'text-gray-700' : 'text-red-700 font-semibold'}`}>{d.from}</td>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{d.ref}</td>
              <td className="px-4 py-2">
                {d.verified ? (
                  <span className="text-[11px] text-green-700">✓ verified</span>
                ) : (
                  <span className="text-[11px] text-red-700 font-semibold">⚠ mismatch</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DepositSourcesTab;
