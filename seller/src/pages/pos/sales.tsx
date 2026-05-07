import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  Eye, Banknote, CreditCard, QrCode, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = 'today' | '7d' | '30d' | 'custom';
type StatusKey = 'all' | 'paid' | 'refunded' | 'voided';

type Payment = 'Cash' | 'Card' | 'QR Pay';
type SaleStatus = 'Paid' | 'Refunded' | 'Voided';

interface Sale {
  receipt: string;
  time: string;
  cashier: string;
  register: string;
  items: number;
  payment: Payment;
  total: number;
  status: SaleStatus;
}

const sales: Sale[] = [
  { receipt: 'RC-9921', time: '14:42', cashier: 'Mali T.', register: '#02', items: 3, payment: 'QR Pay', total: 132.50, status: 'Paid' },
  { receipt: 'RC-9920', time: '14:31', cashier: 'Mali T.', register: '#02', items: 1, payment: 'Cash', total: 28.00, status: 'Paid' },
  { receipt: 'RC-9919', time: '14:18', cashier: 'Somsak K.', register: '#01', items: 5, payment: 'Card', total: 412.80, status: 'Paid' },
  { receipt: 'RC-9918', time: '13:55', cashier: 'Somsak K.', register: '#01', items: 2, payment: 'Cash', total: 76.40, status: 'Refunded' },
  { receipt: 'RC-9917', time: '13:40', cashier: 'Mali T.', register: '#02', items: 4, payment: 'Card', total: 215.00, status: 'Paid' },
  { receipt: 'RC-9916', time: '13:22', cashier: 'Mali T.', register: '#02', items: 1, payment: 'Cash', total: 19.00, status: 'Voided' },
  { receipt: 'RC-9915', time: '12:58', cashier: 'Somsak K.', register: '#01', items: 6, payment: 'QR Pay', total: 348.20, status: 'Paid' },
  { receipt: 'RC-9914', time: '12:30', cashier: 'Mali T.', register: '#02', items: 2, payment: 'Card', total: 89.00, status: 'Paid' },
  { receipt: 'RC-9913', time: '11:42', cashier: 'Somsak K.', register: '#01', items: 1, payment: 'Cash', total: 45.00, status: 'Paid' },
];

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'custom', label: 'Custom' },
];

const STATUS_TABS: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'voided', label: 'Voided' },
];

const STATUS_BADGE: Record<SaleStatus, string> = {
  Paid: 'bg-green-50 text-green-700',
  Refunded: 'bg-orange-50 text-orange-700',
  Voided: 'bg-gray-100 text-gray-600',
};

const PAYMENT_ICON: Record<Payment, React.ReactNode> = {
  Cash: <Banknote className="w-3 h-3 text-gray-500" />,
  Card: <CreditCard className="w-3 h-3 text-gray-500" />,
  'QR Pay': <QrCode className="w-3 h-3 text-gray-500" />,
};

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const SalesPage = () => {
  const [range, setRange] = useState<RangeKey>('today');
  const [statusTab, setStatusTab] = useState<StatusKey>('all');

  const visible = sales.filter((s) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'paid') return s.status === 'Paid';
    if (statusTab === 'refunded') return s.status === 'Refunded';
    if (statusTab === 'voided') return s.status === 'Voided';
    return true;
  });

  const paid = sales.filter((s) => s.status === 'Paid');
  const grossSales = paid.reduce((s, x) => s + x.total, 0);
  const refunded = sales.filter((s) => s.status === 'Refunded').reduce((s, x) => s + x.total, 0);
  const avgTicket = paid.length ? grossSales / paid.length : 0;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          New Sale
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
          Register: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipt, cashier…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Gross sales" value={fmt(grossSales)} delta={12.4} deltaLabel="vs prev day" />
        <KPI label="Transactions" value={String(paid.length)} delta={8.2} deltaLabel="vs prev day" />
        <KPI label="Avg ticket" value={fmt(avgTicket)} delta={3.1} deltaLabel="vs prev day" />
        <KPI label="Refunded" value={fmt(refunded)} delta={-2.5} deltaLabel="vs prev day" />
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
              <th className="px-4 py-2 text-left font-semibold">Receipt</th>
              <th className="px-4 py-2 text-left font-semibold">Time</th>
              <th className="px-4 py-2 text-left font-semibold">Cashier</th>
              <th className="px-4 py-2 text-left font-semibold">Register</th>
              <th className="px-4 py-2 text-right font-semibold">Items</th>
              <th className="px-4 py-2 text-left font-semibold">Payment</th>
              <th className="px-4 py-2 text-right font-semibold">Total</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.receipt}>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{s.receipt}</td>
                <td className="px-4 py-2 text-gray-700">{s.time}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{s.cashier}</td>
                <td className="px-4 py-2 text-gray-600">{s.register}</td>
                <td className="px-4 py-2 text-right text-gray-700">{s.items}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-700">
                    {PAYMENT_ICON[s.payment]}
                    {s.payment}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmt(s.total)}</td>
                <td className="px-4 py-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button className="text-gray-400 hover:text-black">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-xs text-gray-400">
                  No sales match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesPage;
