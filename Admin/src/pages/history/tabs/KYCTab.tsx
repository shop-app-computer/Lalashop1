import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { fetchHistoryKyc } from '@/services/adminApi';

interface KycRow {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  shopInfo?: { shopName?: string; shopCategory?: string };
  businessType?: string;
  user?: { _id: string; name?: string; email?: string; customId?: string };
  submittedAt?: string;
  createdAt: string;
}

const statusBadge: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  approved: { cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  rejected: { cls: 'bg-red-50 text-red-700', icon: XCircle },
  pending: { cls: 'bg-orange-50 text-orange-700', icon: Clock },
};

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const KYCTab = () => {
  const [items, setItems] = useState<KycRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistoryKyc({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems((res.data ?? []) as KycRow[]);
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

  const approved = items.filter((i) => i.status === 'approved').length;
  const total = items.length;
  const score = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center gap-4 bg-gray-50/50 px-4 py-3 rounded">
        <div className="min-w-[80px]">
          <p className="text-[11px] text-gray-500">approval rate</p>
          <p className="text-2xl font-bold tabular-nums">{score}%</p>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${score}%` }} />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {approved} of {total} submissions approved
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">User</th>
              <th className="px-4 py-2 text-left font-semibold">Shop Name</th>
              <th className="px-4 py-2 text-left font-semibold">Business Type</th>
              <th className="px-4 py-2 text-left font-semibold">Category</th>
              <th className="px-4 py-2 text-left font-semibold">Submitted</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">Loading...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
            )}
            {!loading && !error && items.map((k) => {
              const B = statusBadge[k.status] || statusBadge.pending;
              const Icon = B.icon;
              return (
                <tr key={k._id} className="border-t border-gray-50">
                  <td className="px-4 py-2">
                    {k.user?._id ? (
                      <Link href={`/users/${k.user._id}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                        {k.user?.name || k.user?.email || '—'}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{k.shopInfo?.shopName || '—'}</td>
                  <td className="px-4 py-2 text-gray-700 capitalize">{k.businessType || '—'}</td>
                  <td className="px-4 py-2 text-gray-700">{k.shopInfo?.shopCategory || '—'}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(k.submittedAt || k.createdAt)}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${B.cls}`}>
                      <Icon className="w-3 h-3" /> {k.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!loading && !error && items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">No KYC submissions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KYCTab;
