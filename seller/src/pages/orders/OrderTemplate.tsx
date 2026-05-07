import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download,
  Eye, MoreVertical, ArrowUp, ArrowDown,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const OrdersPage = ({ status }: { status: string }) => {
  const [range, setRange] = useState<RangeKey>('30d');

  const orders = [
    { id: 'ORD-7721', customer: 'Somsak J.', sku: 'LSH-238-LA', product: 'Premium Cotton Tee', amount: 45.00, qty: 1, date: '2024-04-28', status },
    { id: 'ORD-7722', customer: 'Viphone S.', sku: 'DNJ-118-BL', product: 'Denim Jacket', amount: 89.00, qty: 1, date: '2024-04-28', status },
    { id: 'ORD-7723', customer: 'Keo P.', sku: 'WEB-044-WH', product: 'Wireless Earbuds', amount: 120.00, qty: 1, date: '2024-04-27', status },
    { id: 'ORD-7724', customer: 'Anousone K.', sku: 'SMW-512-OK', product: 'Smart Watch', amount: 199.00, qty: 1, date: '2024-04-27', status },
    { id: 'ORD-7725', customer: 'Boualay T.', sku: 'LWA-901-CR', product: 'Leather Wallet', amount: 35.00, qty: 2, date: '2024-04-26', status },
    { id: 'ORD-7726', customer: 'Ladda B.', sku: 'CTT-118-IV', product: 'Cotton Tote — Ivory', amount: 28.00, qty: 3, date: '2024-04-26', status },
    { id: 'ORD-7727', customer: 'Sengdeuane V.', sku: 'CPO-044-WH', product: 'Ceramic Pour-Over Set', amount: 64.00, qty: 1, date: '2024-04-25', status },
  ];

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pending': return 'bg-orange-50 text-orange-700';
      case 'processing': return 'bg-blue-50 text-blue-700';
      case 'shipping': return 'bg-purple-50 text-purple-700';
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      case 'returned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalValue = orders.reduce((s, o) => s + o.amount * o.qty, 0);
  const avgValue = totalValue / orders.length;
  const today = orders.filter((o) => o.date === '2024-04-28').length;

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          New Order
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
          Apr 1 – Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Channel: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search order, SKU, customer…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total {status}</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{orders.length}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />4.2% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Avg Order Value</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{fmt(avgValue)}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />1.8% vs prev
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Today</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{today}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-red-600 mt-1">
            <ArrowDown className="w-3 h-3" />0.6% vs yest
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Past 7 Days</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{fmt(totalValue)}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />8.1% vs prev
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-black">{status} orders</h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md text-[11px] font-medium text-gray-700">Bulk update</button>
            <button className="text-[11px] font-semibold text-primary hover:underline">View all →</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Order ID</th>
                <th className="px-4 py-2 text-left font-semibold">Customer</th>
                <th className="px-4 py-2 text-left font-semibold">SKU</th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-right font-semibold">Qty</th>
                <th className="px-4 py-2 text-right font-semibold">Amount</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {orders.map((order) => (
                <tr key={order.id} className="">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{order.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{order.customer}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{order.sku}</td>
                  <td className="px-4 py-2 text-gray-700">{order.product}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{order.qty}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmt(order.amount * order.qty)}</td>
                  <td className="px-4 py-2 text-gray-500">{order.date}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing <span className="font-semibold text-gray-900">1–{orders.length}</span> of <span className="font-semibold text-gray-900">128</span> orders</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Prev</button>
            <button className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
