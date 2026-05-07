import React, { useEffect, useState } from 'react';
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
            <th className="px-4 py-2 text-left font-semibold">Title / Content</th>
            <th className="px-4 py-2 text-left font-semibold">Recipient</th>
            <th className="px-4 py-2 text-left font-semibold">Type</th>
            <th className="px-4 py-2 text-left font-semibold">Sent</th>
            <th className="px-4 py-2 text-left font-semibold">Read</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                Loading history...
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
              <td className="px-4 py-2 text-gray-700 capitalize">{i.type}</td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(i.createdAt)}</td>
              <td className="px-4 py-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                  i.read ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}>
                  {i.read ? <><CheckCircle2 className="w-3 h-3" /> Read</> : 'Unread'}
                </span>
              </td>
            </tr>
          ))}
          {!loading && !error && items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                No notifications yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTab;
