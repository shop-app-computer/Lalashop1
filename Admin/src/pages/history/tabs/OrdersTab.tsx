import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchHistoryOrders } from '@/services/adminApi';

interface OrderRow {
  _id: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems?: { qty: number }[];
  createdAt: string;
  user?: { _id: string; name?: string; email?: string; customId?: string };
}

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const statusBadge: Record<string, string> = {
  delivered: 'bg-green-50 text-green-700',
  shipped: 'bg-purple-50 text-purple-700',
  processing: 'bg-blue-50 text-blue-700',
  pending: 'bg-orange-50 text-orange-700',
  canceled: 'bg-gray-100 text-gray-600',
};

const OrdersTab = () => {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryOrders({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems((res.data ?? []) as OrderRow[]);
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
            <th className="px-4 py-2 text-left font-semibold">{t('table.orderId')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.user')}</th>
            <th className="px-4 py-2 text-right font-semibold">{t('pages.shops.details.products')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.payment')}</th>
            <th className="px-4 py-2 text-right font-semibold">{t('table.total')} (₭)</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.createdAt')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.status')}</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('status.loading')}</td></tr>
          )}
          {!loading && error && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
          )}
          {!loading && !error && items.map((o) => (
            <tr key={o._id}>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{o._id.slice(-8).toUpperCase()}</td>
              <td className="px-4 py-2 font-medium text-gray-900">{o.user?.name || o.user?.email || t('common.unknownUser')}</td>
              <td className="px-4 py-2 text-right text-gray-700">{o.orderItems?.length ?? 0}</td>
              <td className="px-4 py-2 text-gray-700">{o.paymentMethod || '—'}</td>
              <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatMoney(o.totalPrice)}</td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(o.createdAt)}</td>
              <td className="px-4 py-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${statusBadge[o.status] || 'bg-gray-100 text-gray-600'}`}>
                  {t(`status.${o.status}`, { defaultValue: o.status })}
                </span>
              </td>
            </tr>
          ))}
          {!loading && !error && items.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-[12px]">{t('status.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTab;
