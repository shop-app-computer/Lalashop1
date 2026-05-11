import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { fetchHistoryWithdrawals, type AdminWithdrawRow } from '@/services/adminApi';

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const badge: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  approved: { cls: 'bg-blue-50 text-blue-700', icon: CheckCircle2 },
  completed: { cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  rejected: { cls: 'bg-red-50 text-red-700', icon: XCircle },
  failed: { cls: 'bg-red-50 text-red-700', icon: XCircle },
  pending: { cls: 'bg-orange-50 text-orange-700', icon: Clock },
};

const WithdrawalHistoryTab = () => {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<AdminWithdrawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryWithdrawals({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data ?? []);
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

  const total = items.length;
  const approved = items.filter((d) => d.status === 'approved' || d.status === 'completed').length;
  const declined = items.filter((d) => d.status === 'rejected' || d.status === 'failed').length;
  const totalApproved = items
    .filter((d) => d.status === 'completed')
    .reduce((s, d) => s + d.netAmount, 0);
  const last = items[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
        <div>
          <p className="text-gray-500 uppercase">{t('pages.history.totalRequests')}</p>
          <p className="text-base font-bold tabular-nums">{total}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase">{t('pages.history.approved')}</p>
          <p className="text-base font-bold tabular-nums text-green-700">{approved}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase">{t('pages.history.declined')}</p>
          <p className="text-base font-bold tabular-nums text-red-700">{declined}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase">{t('pages.history.totalPaidOut')} ({t('common.currencySymbol')})</p>
          <p className="text-base font-bold tabular-nums">{formatMoney(totalApproved)}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase">{t('pages.history.lastRequest')}</p>
          <p className="font-mono text-[11px] text-gray-700">{last ? formatDate(last.createdAt) : '—'}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">{t('table.withdrawId')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('table.user')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('table.requested')}</th>
              <th className="px-4 py-2 text-right font-semibold">{t('table.amount')} ({t('common.currencySymbol')})</th>
              <th className="px-4 py-2 text-left font-semibold">{t('table.bankAccount')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('table.status')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('table.processed')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('table.note')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('status.loading')}</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
            )}
            {!loading && !error && items.map((w) => {
              const B = badge[w.status] || badge.pending;
              const Icon = B.icon;
              return (
                <tr key={w._id} className="border-t border-gray-50">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{w._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-2 text-gray-700">{w.user?.name || w.user?.email || '—'}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(w.createdAt)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatMoney(w.amount)}</td>
                  <td className="px-4 py-2">
                    <div className="text-gray-700">{w.bankAccount?.bankName || '—'}</div>
                    <div className="font-mono text-[11px] text-gray-500">{w.bankAccount?.accountNumber || '—'}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${B.cls}`}>
                      <Icon className="w-3 h-3" /> {t(`status.${w.status}`, { defaultValue: w.status })}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{w.processedAt ? formatDate(w.processedAt) : '—'}</td>
                  <td className="px-4 py-2 text-[11px] text-gray-600">{w.adminNote || <span className="text-gray-300">—</span>}</td>
                </tr>
              );
            })}
            {!loading && !error && items.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('pages.history.noWithdrawals')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalHistoryTab;
