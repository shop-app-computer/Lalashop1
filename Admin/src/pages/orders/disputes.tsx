import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, MessageSquare, AlertCircle } from 'lucide-react';
import { fetchAdminOrders, type AdminOrderRow } from '@/services/adminApi';

const formatCurrency = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DisputesPage = () => {
  const [disputes, setDisputes] = useState<AdminOrderRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminOrders({ status: 'disputed', search: q || undefined, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setDisputes(res.data ?? []);
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
  }, [q]);

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Open" value={loading ? '—' : disputes.length.toString()} tone="text-red-700" />
        <KPI label="Investigating" value={'—'} tone="text-orange-700" />
        <KPI label="Escalated" value={'—'} tone="text-purple-700" />
      </div>

      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <h2 className="text-[13px] font-semibold text-gray-900">Open disputes</h2>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search dispute, customer, seller..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Order</th>
                <th className="px-4 py-2 text-left font-semibold">Buyer</th>
                <th className="px-4 py-2 text-left font-semibold">Seller</th>
                <th className="px-4 py-2 text-right font-semibold">Amount (₭)</th>
                <th className="px-4 py-2 text-left font-semibold">Opened</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    Loading disputes...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td>
                </tr>
              )}
              {!loading && !error && disputes.map((d) => (
                <tr key={d._id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">
                    <Link href={`/orders/${d._id}`} className="hover:text-primary transition-colors">
                      {d._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{d.customer}</td>
                  <td className="px-4 py-2 text-gray-700">{d.shop}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(d.amount)}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link href={`/orders/${d._id}`} title="View" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button title="Message" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button title="Escalate" className="text-gray-500 hover:text-purple-700 hover:bg-gray-100 rounded p-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && disputes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    No open disputes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KPI = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
  <div className="rounded-lg px-4 py-3">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className={`text-3xl font-bold tabular-nums mt-1 ${tone}`}>{value}</p>
  </div>
);

export default DisputesPage;
