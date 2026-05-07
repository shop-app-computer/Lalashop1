import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchMyOrders, type SellerOrderRow } from '@/services/sellerApi';

type FilterFn = (o: SellerOrderRow) => boolean;

interface OrderTemplateProps {
  title: string;
  description?: string;
  filter: FilterFn;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  canceled: 'bg-red-50 text-red-700',
};

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const OrderTemplate: React.FC<OrderTemplateProps> = ({ title, description, filter }) => {
  const [allOrders, setAllOrders] = useState<SellerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMyOrders()
      .then((res) => {
        if (!cancelled) setAllOrders(res);
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

  const filtered = allOrders.filter((o) => {
    if (!filter(o)) return false;
    if (!q) return true;
    const haystack = [
      o._id,
      typeof o.user === 'object' && o.user ? o.user.name : '',
      typeof o.user === 'object' && o.user ? o.user.email : '',
      o.shippingAddress?.fullName,
      o.paymentMethod,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h1 className="text-[16px] font-bold text-gray-900">{title}</h1>
        {description && <p className="text-[12px] text-gray-500 mt-0.5">{description}</p>}
      </div>

      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-500">
          {loading ? 'Loading...' : `${filtered.length} order${filtered.length === 1 ? '' : 's'}`}
        </span>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search order ID, customer..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-[#00aeff] outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide bg-gray-50/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Order</th>
                <th className="px-4 py-2 text-left font-semibold">Customer</th>
                <th className="px-4 py-2 text-right font-semibold">Items</th>
                <th className="px-4 py-2 text-right font-semibold">Amount</th>
                <th className="px-4 py-2 text-left font-semibold">Payment</th>
                <th className="px-4 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-500 text-[12px]">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map((o) => {
                const customer =
                  typeof o.user === 'object' && o.user
                    ? o.user.name || o.user.email || 'Guest'
                    : o.shippingAddress?.fullName || 'Guest';
                const itemCount = o.orderItems?.length || 0;
                return (
                  <tr key={o._id} className="border-t border-gray-50">
                    <td className="px-4 py-2 font-mono text-[11px] text-gray-600">
                      {o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900">{customer}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{itemCount}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">
                      ฿{formatMoney(o.totalPrice)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{o.paymentMethod || '—'}</td>
                    <td className="px-4 py-2 text-gray-500 text-[11px]">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${statusBadge[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    No orders match this view
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

export default OrderTemplate;
