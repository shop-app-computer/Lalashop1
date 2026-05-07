import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { fetchAdminReports, type AdminReportRow } from '@/services/adminApi';

const reasonBadge: Record<string, string> = {
  spam: 'bg-orange-50 text-orange-700',
  abuse: 'bg-red-50 text-red-700',
  fraud: 'bg-purple-50 text-purple-700',
  counterfeit: 'bg-amber-50 text-amber-700',
  harassment: 'bg-rose-50 text-rose-700',
  other: 'bg-gray-100 text-gray-600',
};

const formatTime = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
};

const ReportsTab = () => {
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminReports({ status: 'open', limit: 20 })
      .then((res) => {
        if (cancelled) return;
        setReports(res.data ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-[12px] text-gray-400">Loading reports...</div>
    );
  }

  if (error) {
    return <div className="py-12 text-center text-[12px] text-red-500">{error}</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-[13px] text-gray-500 font-medium">No open reports</p>
        <p className="text-[11px] text-gray-400 mt-1">Reports awaiting review will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
        <span className="text-[11px] text-gray-500 font-medium">
          {reports.length} open report{reports.length === 1 ? '' : 's'} awaiting review
        </span>
        <Link href="/reports" className="text-[11px] font-bold text-primary hover:underline">
          View all →
        </Link>
      </div>

      {reports.map((r) => {
        const reasonCls = reasonBadge[r.reason] ?? 'bg-gray-100 text-gray-600';
        const reporterName = r.reportedBy?.name || r.reportedBy?.email || 'Unknown user';
        return (
          <div
            key={r._id}
            className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`p-1.5 rounded ${reasonCls} flex-shrink-0`}>
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-gray-600">RPT-{r._id.slice(-6).toUpperCase()}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${reasonCls}`}>
                    {r.reason}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize">on {r.targetType}</span>
                </div>
                <div className="text-[12px] text-gray-700 mt-1 line-clamp-1">
                  {r.description || <span className="text-gray-400">No description</span>}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Reported by <span className="font-medium">{reporterName}</span> · {formatTime(r.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/reports/${r._id}`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                View
              </Link>
              <Link
                href={`/reports/${r._id}`}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                Take Action
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportsTab;
