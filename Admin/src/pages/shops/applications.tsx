import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, FileText, Check, X, Eye } from 'lucide-react';
import {
  fetchKycSubmissions,
  reviewKycSubmission,
  type AdminKycSubmission,
  type KycStatus,
} from '@/services/adminApi';

const statusBadge: Record<KycStatus, string> = {
  pending: 'bg-orange-50 text-orange-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

const statusLabel: Record<KycStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ApplicationsPage = () => {
  const [filter, setFilter] = useState<'all' | KycStatus>('all');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<AdminKycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKycSubmissions({
        status: filter === 'all' ? undefined : filter,
        search: q || undefined,
      });
      setItems(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, q]);

  const onReview = async (id: string, decision: 'approved' | 'rejected') => {
    setBusyId(id);
    try {
      await reviewKycSubmission(id, { decision, note: '' });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const tabs: ('all' | KycStatus)[] = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                filter === t ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t === 'all' ? 'All' : statusLabel[t]}
            </button>
          ))}
        </div>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search applicant or shop..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">App ID</th>
                <th className="px-4 py-2 text-left font-semibold">Applicant</th>
                <th className="px-4 py-2 text-left font-semibold">Shop Name</th>
                <th className="px-4 py-2 text-left font-semibold">Business Type</th>
                <th className="px-4 py-2 text-left font-semibold">Category</th>
                <th className="px-4 py-2 text-left font-semibold">Submitted</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    Loading applications...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-red-500 text-[12px]">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && items.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{a._id.slice(-10).toUpperCase()}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    <Link href={`/users/${a.user._id}`} className="hover:text-primary transition-colors">
                      {a.user.name || a.user.email}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{a.shopInfo.shopName}</td>
                  <td className="px-4 py-2 text-gray-700 capitalize">{a.businessType}</td>
                  <td className="px-4 py-2 text-gray-700">{a.shopInfo.shopCategory}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(a.submittedAt)}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link href={`/kyc/${a._id}`} title="View" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button title="Documents" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      {a.status === 'pending' && (
                        <>
                          <button
                            disabled={busyId === a._id}
                            onClick={() => onReview(a._id, 'approved')}
                            title="Approve"
                            className="text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded p-1 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={busyId === a._id}
                            onClick={() => onReview(a._id, 'rejected')}
                            title="Reject"
                            className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    No applications match your filter
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

export default ApplicationsPage;
