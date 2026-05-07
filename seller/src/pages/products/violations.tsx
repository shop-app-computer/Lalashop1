import React, { useState } from 'react';
import {
  Search, Filter, ChevronDown, Download, Eye, FileText, ExternalLink, ShieldAlert,
} from 'lucide-react';

type StatusTab = 'all' | 'open' | 'investigating' | 'resolved' | 'dismissed';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type VStatus = 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';

interface Violation {
  id: number;
  type: string;
  product: string;
  sku: string;
  reportedBy: string;
  severity: Severity;
  date: string;
  status: VStatus;
  note: string;
}

const violations: Violation[] = [
  { id: 101, type: 'Counterfeit material', product: 'Brand Clone Watch', sku: 'LSO-WCH-410', reportedBy: 'Trust & Safety bot', severity: 'Critical', date: 'Apr 24', status: 'Open', note: 'Listing flagged for trademark infringement.' },
  { id: 102, type: 'Missing health certificate', product: 'Medical Mask Pack', sku: 'LSO-MED-022', reportedBy: 'Customer report', severity: 'High', date: 'Apr 20', status: 'Investigating', note: 'Upload FDA documentation to continue selling.' },
  { id: 103, type: 'Misleading description', product: 'Slim Fit Tee', sku: 'LSO-TSH-58', reportedBy: 'Buyer dispute', severity: 'Medium', date: 'Apr 15', status: 'Resolved', note: 'Description corrected, listing reinstated.' },
  { id: 104, type: 'Image quality below standard', product: 'Bamboo Toothbrush', sku: 'LSO-BAM-09', reportedBy: 'Catalog audit', severity: 'Low', date: 'Apr 10', status: 'Dismissed', note: 'Re-reviewed and accepted.' },
];

const SEVERITY_BADGE: Record<Severity, string> = {
  'Critical': 'bg-red-50 text-red-700',
  'High': 'bg-orange-50 text-orange-700',
  'Medium': 'bg-gray-100 text-gray-700',
  'Low': 'bg-blue-50 text-blue-700',
};

const STATUS_BADGE: Record<VStatus, string> = {
  'Open': 'bg-red-50 text-red-700',
  'Investigating': 'bg-orange-50 text-orange-700',
  'Resolved': 'bg-green-50 text-green-700',
  'Dismissed': 'bg-gray-100 text-gray-700',
};

const TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];

const ProductViolations = () => {
  const [tab, setTab] = useState<StatusTab>('all');

  const counts: Record<StatusTab, number> = {
    all: violations.length,
    open: violations.filter((v) => v.status === 'Open').length,
    investigating: violations.filter((v) => v.status === 'Investigating').length,
    resolved: violations.filter((v) => v.status === 'Resolved').length,
    dismissed: violations.filter((v) => v.status === 'Dismissed').length,
  };

  const filtered = tab === 'all'
    ? violations
    : violations.filter((v) =>
        tab === 'open' ? v.status === 'Open'
          : tab === 'investigating' ? v.status === 'Investigating'
          : tab === 'resolved' ? v.status === 'Resolved'
          : v.status === 'Dismissed',
      );

  const openCount = counts.open + counts.investigating;
  const penaltyPoints = 1.5;
  const penaltyMax = 12;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded bg-green-50 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
          Account: Good Standing
        </span>
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <FileText className="w-3.5 h-3.5 mr-1.5" /> Read Guidelines
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Open Cases</p>
          <p className="text-xl font-bold text-red-700 tabular-nums mt-1">{openCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Resolved</p>
          <p className="text-xl font-bold text-green-700 tabular-nums mt-1">{counts.resolved}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Penalty Points</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{penaltyPoints} / {penaltyMax}</p>
          <div className="w-full h-1 bg-gray-100 rounded mt-1.5 overflow-hidden">
            <div
              className={`h-full ${penaltyPoints / penaltyMax > 0.7 ? 'bg-red-500' : penaltyPoints / penaltyMax > 0.4 ? 'bg-orange-500' : 'bg-green-500'}`}
              style={{ width: `${(penaltyPoints / penaltyMax) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total (90d)</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{violations.length}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                tab === t.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {t.label}
              <span className="ml-1 text-[10px] text-gray-400 tabular-nums">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Severity <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Type <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Date <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU, case ID, type…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* Violations table */}
      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Case</th>
                <th className="px-4 py-2 text-left font-semibold">Violation</th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-left font-semibold">Reported By</th>
                <th className="px-4 py-2 text-left font-semibold">Severity</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {filtered.map((v) => (
                <tr key={v.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">#{v.id}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{v.type}</p>
                        <p className="text-[11px] text-gray-500">{v.note}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-900">{v.product}</p>
                    <p className="font-mono text-[11px] text-gray-600">{v.sku}</p>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{v.reportedBy}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${SEVERITY_BADGE[v.severity]}`}>
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{v.date}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="View detail">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Submit appeal">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="View product">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing 1–{filtered.length} of {violations.length} cases</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViolations;
