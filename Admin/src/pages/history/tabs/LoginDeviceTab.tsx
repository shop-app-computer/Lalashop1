import React, { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
import { fetchHistoryLoginDevice } from '@/services/adminApi';

interface LoginRow {
  _id: string;
  name?: string;
  email?: string;
  customId?: string;
  lastKnownIp?: string;
  updatedAt: string;
  createdAt: string;
}

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const LoginDeviceTab = () => {
  const [items, setItems] = useState<LoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryLoginDevice({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems((res.data ?? []) as LoginRow[]);
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

  const uniqueIps = new Set(items.map((d) => d.lastKnownIp).filter(Boolean)).size;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
        <div>
          <p className="text-gray-500">unique users</p>
          <p className="text-base font-bold tabular-nums">{items.length}</p>
        </div>
        <div>
          <p className="text-gray-500">unique IPs (recent)</p>
          <p className="text-base font-bold tabular-nums">{uniqueIps}</p>
        </div>
        <div>
          <p className="text-gray-500">data note</p>
          <p className="text-[11px] text-gray-400">based on lastKnownIp + updatedAt</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">User</th>
              <th className="px-4 py-2 text-left font-semibold">Last Known IP</th>
              <th className="px-4 py-2 text-left font-semibold">Last Active</th>
              <th className="px-4 py-2 text-left font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-[12px]">Loading...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
            )}
            {!loading && !error && items.map((u) => (
              <tr key={u._id} className="border-t border-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{u.name || u.email || '—'}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-700">
                  <span className="inline-flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-gray-400" /> {u.lastKnownIp || '—'}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(u.updatedAt)}</td>
                <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
            {!loading && !error && items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-[12px]">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginDeviceTab;
