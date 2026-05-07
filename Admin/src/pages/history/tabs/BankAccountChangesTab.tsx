import React, { useEffect, useState } from 'react';
import { fetchHistoryBankChanges } from '@/services/adminApi';

interface BankRow {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified?: boolean;
  user?: { _id: string; name?: string; email?: string; customId?: string };
  createdAt: string;
  updatedAt: string;
}

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const BankAccountChangesTab = () => {
  const [items, setItems] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryBankChanges({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems((res.data ?? []) as BankRow[]);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const verifiedCount = items.filter((b) => b.isVerified).length;
  const last = items[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
        <div>
          <p className="text-gray-500">total bank records</p>
          <p className="text-base font-bold tabular-nums">{items.length}</p>
        </div>
        <div>
          <p className="text-gray-500">verified</p>
          <p className="text-base font-bold tabular-nums text-green-700">{verifiedCount}</p>
        </div>
        <div>
          <p className="text-gray-500">unverified</p>
          <p className="text-base font-bold tabular-nums text-amber-700">{items.length - verifiedCount}</p>
        </div>
        <div>
          <p className="text-gray-500">last update</p>
          <p className="font-mono text-[11px] text-gray-700">{last ? formatDate(last.updatedAt) : '—'}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">user</th>
              <th className="px-4 py-2 text-left font-semibold">bank</th>
              <th className="px-4 py-2 text-left font-semibold">account</th>
              <th className="px-4 py-2 text-left font-semibold">holder name</th>
              <th className="px-4 py-2 text-left font-semibold">verified</th>
              <th className="px-4 py-2 text-left font-semibold">last updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">Loading...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
            )}
            {!loading && !error && items.map((b) => (
              <tr key={b._id} className="border-t border-gray-50">
                <td className="px-4 py-2 text-gray-700">{b.user?.name || b.user?.email || '—'}</td>
                <td className="px-4 py-2 text-gray-700">{b.bankName}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{b.accountNumber}</td>
                <td className="px-4 py-2 text-gray-700">{b.accountName}</td>
                <td className="px-4 py-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${b.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {b.isVerified ? 'verified' : 'unverified'}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(b.updatedAt)}</td>
              </tr>
            ))}
            {!loading && !error && items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">No bank records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankAccountChangesTab;
