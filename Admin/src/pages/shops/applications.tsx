import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Check, X, Eye, ChevronDown } from 'lucide-react';

type AppStatus = 'pending_review' | 'docs_required' | 'approved' | 'rejected';

type Application = {
  id: string;
  applicant: string;
  shopName: string;
  businessType: string;
  category: string;
  submittedAt: string;
  reviewer: string;
  status: AppStatus;
};

const mockApplications: Application[] = [
  { id: 'APP-2026-0421', applicant: 'Mali Thongdy', shopName: 'Beauty Studio', businessType: 'Sole Proprietor', category: 'Beauty', submittedAt: '2026-04-25 14:30', reviewer: 'Admin Alex', status: 'pending_review' },
  { id: 'APP-2026-0420', applicant: 'Bounmy Inthavong', shopName: 'Coffee Roastery', businessType: 'Individual', category: 'Food', submittedAt: '2026-04-28 09:15', reviewer: '—', status: 'pending_review' },
  { id: 'APP-2026-0419', applicant: 'Nakhone P.', shopName: 'Studio Nakhone', businessType: 'Corporate', category: 'Electronics', submittedAt: '2026-04-22 11:08', reviewer: 'Admin Keo', status: 'docs_required' },
  { id: 'APP-2026-0418', applicant: 'Khampheng L.', shopName: 'Khampheng Boutique', businessType: 'Individual', category: 'Fashion', submittedAt: '2026-04-20 16:42', reviewer: 'Admin Alex', status: 'approved' },
  { id: 'APP-2026-0417', applicant: 'Tony R.', shopName: 'Tony Imports', businessType: 'Corporate', category: 'Electronics', submittedAt: '2026-04-19 10:20', reviewer: 'Admin Somsack', status: 'rejected' },
];

const statusBadge: Record<AppStatus, string> = {
  pending_review: 'bg-orange-50 text-orange-700',
  docs_required: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

const statusLabel: Record<AppStatus, string> = {
  pending_review: 'Pending Review',
  docs_required: 'Docs Required',
  approved: 'Approved',
  rejected: 'Rejected',
};

const ApplicationsPage = () => {
  const [filter, setFilter] = useState<'all' | AppStatus>('all');
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

  const filtered = mockApplications.filter(
    (a) => (filter === 'all' || a.status === filter) &&
      (!q || a.applicant.toLowerCase().includes(q.toLowerCase()) || a.shopName.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase()))
  );

  const tabs: ('all' | AppStatus)[] = ['all', 'pending_review', 'docs_required', 'approved', 'rejected'];

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[100px] justify-between"
          >
            <span>{filter === 'all' ? 'All' : statusLabel[filter as AppStatus]}</span>
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
                  {t === 'all' ? 'All' : statusLabel[t as AppStatus]}
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
            placeholder="Search applicant, shop, ID..."
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
                <th className="px-4 py-2 text-left font-semibold">Reviewer</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{a.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{a.applicant}</td>
                  <td className="px-4 py-2 text-gray-700">{a.shopName}</td>
                  <td className="px-4 py-2 text-gray-700">{a.businessType}</td>
                  <td className="px-4 py-2 text-gray-700">{a.category}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{a.submittedAt}</td>
                  <td className="px-4 py-2 text-gray-700">{a.reviewer}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button title="View" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button title="Documents" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button title="Approve" className="text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded p-1">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button title="Reject" className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1">
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

export default ApplicationsPage;
