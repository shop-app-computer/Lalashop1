import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  Eye, Play, Square, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';
type StatusKey = 'all' | 'open' | 'closed';
type ShiftStatus = 'Open' | 'Closed';

interface Shift {
  id: string;
  cashier: string;
  register: string;
  opened: string;
  closed: string | null;
  openingCash: number;
  closingCash: number | null;
  sales: number;
  variance: number | null;
  status: ShiftStatus;
}

const shifts: Shift[] = [
  { id: 'SH-2401', cashier: 'Mali T.', register: '#02', opened: 'Apr 30 · 09:00', closed: null, openingCash: 200.00, closingCash: null, sales: 1320.50, variance: null, status: 'Open' },
  { id: 'SH-2400', cashier: 'Somsak K.', register: '#01', opened: 'Apr 30 · 09:05', closed: null, openingCash: 200.00, closingCash: null, sales: 982.20, variance: null, status: 'Open' },
  { id: 'SH-2399', cashier: 'Mali T.', register: '#02', opened: 'Apr 29 · 09:00', closed: 'Apr 29 · 18:12', openingCash: 200.00, closingCash: 1845.00, sales: 1640.00, variance: 5.00, status: 'Closed' },
  { id: 'SH-2398', cashier: 'Somsak K.', register: '#01', opened: 'Apr 29 · 09:08', closed: 'Apr 29 · 18:30', openingCash: 200.00, closingCash: 1240.50, sales: 1042.00, variance: -1.50, status: 'Closed' },
  { id: 'SH-2397', cashier: 'Viphone S.', register: '#03', opened: 'Apr 28 · 09:00', closed: 'Apr 28 · 17:50', openingCash: 200.00, closingCash: 980.00, sales: 783.00, variance: -3.00, status: 'Closed' },
  { id: 'SH-2396', cashier: 'Mali T.', register: '#02', opened: 'Apr 28 · 09:00', closed: 'Apr 28 · 18:00', openingCash: 200.00, closingCash: 2110.00, sales: 1908.00, variance: 2.00, status: 'Closed' },
  { id: 'SH-2395', cashier: 'Somsak K.', register: '#01', opened: 'Apr 27 · 09:10', closed: 'Apr 27 · 18:15', openingCash: 200.00, closingCash: 1450.00, sales: 1252.00, variance: -2.00, status: 'Closed' },
];

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'custom', label: 'Custom' },
];

const STATUS_TABS: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
];

const STATUS_BADGE: Record<ShiftStatus, string> = {
  Open: 'bg-green-50 text-green-700',
  Closed: 'bg-gray-100 text-gray-600',
};

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtVariance = (n: number) => {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
};

const KPI = ({
  label, value, delta, deltaLabel,
}: { label: string; value: string; delta?: number; deltaLabel?: string }) => (
  <div className="rounded-lg px-4 py-3">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className="text-xl font-bold text-black tabular-nums mt-1">{value}</p>
    {delta !== undefined && (
      <div className="flex items-center gap-1 mt-1">
        <span className={`inline-flex items-center text-[11px] font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
        {deltaLabel && <span className="text-[11px] text-gray-400">{deltaLabel}</span>}
      </div>
    )}
  </div>
);

const ShiftsPage = () => {
  const [range, setRange] = useState<RangeKey>('7d');
  const [statusTab, setStatusTab] = useState<StatusKey>('all');

  const visible = shifts.filter((s) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'open') return s.status === 'Open';
    if (statusTab === 'closed') return s.status === 'Closed';
    return true;
  });

  const openCount = shifts.filter((s) => s.status === 'Open').length;
  const totalSales = shifts.reduce((s, x) => s + x.sales, 0);
  const closedShifts = shifts.filter((s) => s.status === 'Closed');
  const totalVariance = closedShifts.reduce((s, x) => s + (x.variance ?? 0), 0);
  const avgShiftSales = closedShifts.length
    ? closedShifts.reduce((s, x) => s + x.sales, 0) / closedShifts.length
    : 0;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Play className="w-3.5 h-3.5 mr-1.5" /> Open Shift
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                range === r.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Cashier: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shift, cashier…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Open shifts" value={String(openCount)} />
        <KPI label="Total sales" value={fmt(totalSales)} delta={9.4} deltaLabel="vs prev" />
        <KPI label="Avg per shift" value={fmt(avgShiftSales)} delta={4.1} deltaLabel="vs prev" />
        <KPI label="Cash variance" value={fmtVariance(totalVariance)} delta={-0.4} deltaLabel="vs prev" />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusTab(t.key)}
            className={`px-3 py-2 text-[11px] font-semibold border-b-2 -mb-px ${
              statusTab === t.key
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Shift</th>
              <th className="px-4 py-2 text-left font-semibold">Cashier</th>
              <th className="px-4 py-2 text-left font-semibold">Register</th>
              <th className="px-4 py-2 text-left font-semibold">Opened</th>
              <th className="px-4 py-2 text-left font-semibold">Closed</th>
              <th className="px-4 py-2 text-right font-semibold">Open cash</th>
              <th className="px-4 py-2 text-right font-semibold">Sales</th>
              <th className="px-4 py-2 text-right font-semibold">Variance</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{s.id}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{s.cashier}</td>
                <td className="px-4 py-2 text-gray-600">{s.register}</td>
                <td className="px-4 py-2 text-gray-700">{s.opened}</td>
                <td className="px-4 py-2 text-gray-700">{s.closed ?? '—'}</td>
                <td className="px-4 py-2 text-right text-gray-700">{fmt(s.openingCash)}</td>
                <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmt(s.sales)}</td>
                <td className="px-4 py-2 text-right">
                  {s.variance === null ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <span className={s.variance < 0 ? 'text-red-600 font-semibold' : s.variance > 0 ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                      {fmtVariance(s.variance)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {s.status === 'Open' ? (
                    <button className="text-[11px] font-semibold text-red-600 hover:underline inline-flex items-center">
                      <Square className="w-3 h-3 mr-1" /> Close
                    </button>
                  ) : (
                    <button className="text-gray-400 hover:text-black">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftsPage;
