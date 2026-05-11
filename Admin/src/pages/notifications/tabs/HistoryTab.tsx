import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { fetchAdminNotifications, type AdminNotificationRow } from '@/services/adminApi';

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const HistoryTab = () => {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<AdminNotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminNotifications({ limit: 100 })
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px] tabular-nums">
        <thead className="text-[11px] text-gray-500 tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">{t('pages.notifications.table.titleContent')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.recipient')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.type')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.sent')}</th>
            <th className="px-4 py-2 text-left font-semibold">{t('table.readStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                {t('pages.notifications.loadingHistory')}
              </td>
            </tr>
          )}
          {!loading && error && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td>
            </tr>
          )}
          {!loading && !error && items.map((i) => (
            <tr key={i._id}>
              <td className="px-4 py-2">
                <div className="font-medium text-gray-900">{i.title}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-md">{i.body}</div>
              </td>
              <td className="px-4 py-2 text-gray-700">
                {i.user?.name || i.user?.email || '—'}
                {i.user?.customId && (
                  <span className="text-gray-400 text-[11px] ml-1">{i.user.customId}</span>
                )}
              </td>
              <td className="px-4 py-2 text-gray-700 capitalize">
                {t(`pages.notifications.types.${i.type}`, { defaultValue: i.type })}
              </td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(i.createdAt)}</td>
              <td className="px-4 py-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                  i.read ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}>
                  {i.read ? <><CheckCircle2 className="w-3 h-3" /> {t('status.read')}</> : t('status.unread')}
                </span>
              </td>
            </tr>
          ))}
          {!loading && !error && items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                {t('pages.notifications.noHistory')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTab;
