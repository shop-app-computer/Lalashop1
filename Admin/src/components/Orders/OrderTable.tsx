import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import {
  fetchAdminOrders,
  type AdminOrderRow,
  type AdminOrderStatus,
} from '@/services/adminApi';

export type OrderStatus = AdminOrderStatus;
export type Order = AdminOrderRow;

const statusBadge: Record<OrderStatus, string> = {
  paid: 'bg-blue-50 text-blue-700',
  shipping: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-cyan-50 text-cyan-700',
  disputed: 'bg-red-50 text-red-700',
  pending_payment: 'bg-orange-50 text-orange-700',
};

const statusLabel: Record<OrderStatus, string> = {
  paid: 'Paid',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
  pending_payment: 'Pending Payment',
};

const formatCurrency = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface OrderTableProps {
  initialFilter?: 'all' | OrderStatus;
  hideFilters?: boolean;
}

const OrderTable = ({ initialFilter = 'all', hideFilters = false }: OrderTableProps) => {
  const [filter, setFilter] = useState<'all' | OrderStatus>(initialFilter);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminOrders({
      status: filter === 'all' ? undefined : filter,
      search: q || undefined,
      limit: 100,
    })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load orders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, q]);

  const tabs: ('all' | OrderStatus)[] = useMemo(
    () => ['all', 'paid', 'shipping', 'delivered', 'disputed'],
    []
  );

  return (
    <>
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        {!hideFilters && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[100px] justify-between"
            >
              <span>{filter === 'all' ? 'All' : statusLabel[filter as OrderStatus]}</span>
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
                    {t === 'all' ? 'All' : statusLabel[t as OrderStatus]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Date Range
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search order ID, customer, shop..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Order ID</th>
                <th className="px-4 py-2 text-left font-semibold">User</th>
                <th className="px-4 py-2 text-left font-semibold">Shop</th>
                <th className="px-4 py-2 text-right font-semibold">Items</th>
                <th className="px-4 py-2 text-right font-semibold">Amount (₭)</th>
                <th className="px-4 py-2 text-left font-semibold">Payment</th>
                <th className="px-4 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    Loading orders...
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
              {!loading && !error && orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">
                    <Link href={`/orders/${o._id}`} className="hover:text-primary transition-colors">
                      {o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {o.customerId ? (
                      <Link href={`/users/${o.customerId}`} className="hover:text-primary transition-colors">
                        {o.customer}
                      </Link>
                    ) : (
                      o.customer
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {o.shopId ? (
                      <Link href={`/shops/${o.shopId}`} className="text-gray-700 hover:text-primary transition-colors">
                        {o.shop}
                      </Link>
                    ) : (
                      <span className="text-gray-700">{o.shop}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">{o.itemCount}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(o.amount)}</td>
                  <td className="px-4 py-2 text-gray-700">{o.paymentMethod}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && !error && orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    No orders match your filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing {orders.length} of {total} orders</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTable;
