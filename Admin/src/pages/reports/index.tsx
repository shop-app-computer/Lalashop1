import React, { useState, useRef, useEffect } from 'react';
import { Search, Eye, Check, X, ChevronDown } from 'lucide-react';

type ReportType = 'spam' | 'abuse' | 'fraud' | 'counterfeit' | 'other';
type ReportStatus = 'open' | 'reviewing' | 'actioned' | 'dismissed';

type Report = {
  id: string;
  type: ReportType;
  target: string;
  targetType: 'user' | 'shop' | 'product' | 'post';
  reportedBy: string;
  reason: string;
  reportedAt: string;
  status: ReportStatus;
};

const mockReports: Report[] = [
  { id: 'RPT-1180', type: 'counterfeit', target: 'PRD-7720', targetType: 'product', reportedBy: 'U-1042', reason: 'Counterfeit designer product', reportedAt: '2026-04-30 09:42', status: 'actioned' },
  { id: 'RPT-1179', type: 'spam', target: 'U-1090', targetType: 'user', reportedBy: 'U-1010', reason: 'Posting spam links in comments', reportedAt: '2026-04-30 08:15', status: 'reviewing' },
  { id: 'RPT-1178', type: 'fraud', target: 'SHOP-1099', targetType: 'shop', reportedBy: 'U-1055', reason: 'Never delivered after payment', reportedAt: '2026-04-30 07:42', status: 'open' },
  { id: 'RPT-1177', type: 'abuse', target: 'POST-7700', targetType: 'post', reportedBy: 'U-1023', reason: 'Hate speech', reportedAt: '2026-04-29 22:01', status: 'open' },
  { id: 'RPT-1176', type: 'spam', target: 'U-1001', targetType: 'user', reportedBy: 'U-1099', reason: 'False report — abusive reporter', reportedAt: '2026-04-29 18:00', status: 'dismissed' },
];

const typeBadge: Record<ReportType, string> = {
  spam: 'bg-orange-50 text-orange-700',
  abuse: 'bg-red-50 text-red-700',
  fraud: 'bg-purple-50 text-purple-700',
  counterfeit: 'bg-amber-50 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
};

const statusBadge: Record<ReportStatus, string> = {
  open: 'bg-red-50 text-red-700',
  reviewing: 'bg-orange-50 text-orange-700',
  actioned: 'bg-green-50 text-green-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

const statusLabel: Record<ReportStatus, string> = {
  open: 'Open',
  reviewing: 'Reviewing',
  actioned: 'Actioned',
  dismissed: 'Dismissed',
};

const typeLabel: Record<ReportType, string> = {
  spam: 'Spam',
  abuse: 'Abuse',
  fraud: 'Fraud',
  counterfeit: 'Counterfeit',
  other: 'Other',
};

const ReportsPage = () => {
  const [filter, setFilter] = useState<'all' | ReportStatus>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = mockReports.filter(
    (r) => (filter === 'all' || r.status === filter) &&
      (!q || r.target.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()) || r.reason.toLowerCase().includes(q.toLowerCase()))
  );

  const tabs: ('all' | ReportStatus)[] = ['all', 'open', 'reviewing', 'actioned', 'dismissed'];

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[100px] justify-between"
          >
            <span>{filter === 'all' ? 'All' : statusLabel[filter as ReportStatus]}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-md shadow-md py-1 z-10 min-w-[120px]">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilter(t); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    filter === t
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {t === 'all' ? 'All' : statusLabel[t as ReportStatus]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search target, reason, ID..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Report ID</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Target</th>
                <th className="px-4 py-2 text-left font-semibold">Target Type</th>
                <th className="px-4 py-2 text-left font-semibold">Reported By</th>
                <th className="px-4 py-2 text-left font-semibold">Reason</th>
                <th className="px-4 py-2 text-left font-semibold">Reported</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{r.id}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${typeBadge[r.type]}`}>
                      {typeLabel[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{r.target}</td>
                  <td className="px-4 py-2 text-gray-700 capitalize">{r.targetType}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{r.reportedBy}</td>
                  <td className="px-4 py-2 text-gray-700">{r.reason}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{r.reportedAt}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[r.status]}`}>
                      {statusLabel[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button title="View" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button title="Action" className="text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded p-1">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button title="Dismiss" className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
