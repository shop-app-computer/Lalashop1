import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchHistoryFinancial } from '@/services/adminApi';

interface FinancialData {
  revenue: number;
  ordersPaid: number;
  withdrawals: Record<string, { total: number; count: number }>;
}

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const FinancialTab = () => {
  const { t } = useTranslation('common');
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryFinancial()
      .then((res) => {
        if (cancelled) return;
        setData((res.data as FinancialData) ?? null);
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

  if (loading) {
    return <div className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('pages.history.loadingFinancial')}</div>;
  }

  if (error || !data) {
    return <div className="px-4 py-12 text-center text-red-500 text-[12px]">{error || t('status.empty')}</div>;
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label={t('dashboard.totalRevenue')} value={`${formatMoney(data.revenue)} ${t('common.currencySymbol')}`} tone="text-green-700" />
        <Stat label={t('dashboard.completedOrders')} value={data.ordersPaid.toLocaleString()} tone="text-blue-700" />
        <Stat
          label={t('pages.history.withdrawalsCompleted')}
          value={`${formatMoney(data.withdrawals.completed?.total ?? 0)} ${t('common.currencySymbol')}`}
          tone="text-cyan-700"
        />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2 uppercase">{t('pages.history.withdrawalsBreakdown')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">{t('table.status')}</th>
                <th className="px-4 py-2 text-right font-semibold">{t('pages.history.count')}</th>
                <th className="px-4 py-2 text-right font-semibold">{t('table.netKip')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.withdrawals).map(([status, v]) => (
                <tr key={status}>
                  <td className="px-4 py-2 capitalize text-gray-700">
                    {t(`status.${status}`, { defaultValue: status })}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">{v.count}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatMoney(v.total)}</td>
                </tr>
              ))}
              {Object.keys(data.withdrawals).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('pages.history.noWithdrawalData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
  <div className="rounded-lg px-4 py-3 bg-gray-50/50">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className={`text-xl font-bold tabular-nums mt-1 ${tone}`}>{value}</p>
  </div>
);

export default FinancialTab;
