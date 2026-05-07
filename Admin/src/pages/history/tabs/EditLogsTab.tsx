import React, { useEffect, useState } from 'react';
import { fetchHistoryEditLogs } from '@/services/adminApi';

interface EditLogRow {
  _id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  user?: { _id: string; name?: string; email?: string; customId?: string };
}

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EditLogsTab = () => {
  const [items, setItems] = useState<EditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryEditLogs({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems((res.data ?? []) as EditLogRow[]);
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
            <th className="px-4 py-2 text-left font-semibold">Log ID</th>
            <th className="px-4 py-2 text-left font-semibold">User</th>
            <th className="px-4 py-2 text-left font-semibold">Type</th>
            <th className="px-4 py-2 text-left font-semibold">Title / Description</th>
            <th className="px-4 py-2 text-left font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">Loading...</td></tr>
          )}
          {!loading && error && (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
          )}
          {!loading && !error && items.map((l) => (
            <tr key={l._id}>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{l._id.slice(-8).toUpperCase()}</td>
              <td className="px-4 py-2 text-gray-700">{l.user?.name || l.user?.email || '—'}</td>
              <td className="px-4 py-2 text-gray-700 capitalize">{l.type}</td>
              <td className="px-4 py-2">
                <div className="font-medium text-gray-900">{l.title}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-md">{l.body}</div>
              </td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(l.createdAt)}</td>
            </tr>
          ))}
          {!loading && !error && items.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-[12px]">No edit logs</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EditLogsTab;
