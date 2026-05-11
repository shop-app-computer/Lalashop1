import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchHistoryTransactions } from '@/services/adminApi';

interface TxRow {
  kind: 'order' | 'withdrawal';
  _id: string;
  amount: number;
  method: string;
  date: string;
  user?: { _id: string; name?: string; email?: string; customId?: string };
  status?: string;
}

const typeBadge: Record<string, string> = {
  order: 'bg-blue-50 text-blue-700',
  withdrawal: 'bg-cyan-50 text-cyan-700',
};

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TransactionsTab = () => {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryTransactions({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems((res.data ?? []) as TxRow[]);
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px] tabular-nums">
        <thead className="text-[11px] text-gray-500 tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">{t('table.transactionId')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.type')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.user')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.payment')}</th>
            <th className="px-4 py-2 text-right font-semibold">{t('table.amount')} (₭)</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.createdAt')}</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('status.loading')}</td></tr>
          )}
          {!loading && error && (
            <tr><td colSpan={6} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
          )}
          {!loading && !error && items.map((tr) => (
            <tr key={`${tr.kind}-${tr._id}`}>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{tr._id.slice(-8).toUpperCase()}</td>
              <td className="px-4 py-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${typeBadge[tr.kind] || 'bg-gray-100 text-gray-600'}`}>
                  {t(`table.${tr.kind}`, { defaultValue: tr.kind })}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-700">{tr.user?.name || tr.user?.email || '—'}</td>
              <td className="px-4 py-2 text-gray-700">{tr.method}</td>
              <td className={`px-4 py-2 text-right font-semibold ${tr.amount < 0 ? 'text-red-700' : 'text-gray-900'}`}>
                {tr.amount < 0 ? '-' : ''}{formatMoney(Math.abs(tr.amount))}
              </td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(tr.date)}</td>
            </tr>
          ))}
          {!loading && !error && items.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('status.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTab;
