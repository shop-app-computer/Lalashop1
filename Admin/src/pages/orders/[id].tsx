import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Package, User, Store, CreditCard, MapPin,
  Truck, FileText, MessageSquare, AlertCircle,
} from 'lucide-react';
import { fetchAdminOrder, type AdminOrderDetail, type AdminOrderStatus } from '@/services/adminApi';

const statusBadge: Record<string, string> = {
  paid: 'bg-blue-50 text-blue-700',
  shipping: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-cyan-50 text-cyan-700',
  disputed: 'bg-red-50 text-red-700',
  pending_payment: 'bg-orange-50 text-orange-700',
};

const statusLabel: Record<string, string> = {
  paid: 'Paid',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
  pending_payment: 'Pending Payment',
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

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminOrder(id)
      .then((res) => {
        if (cancelled) return;
        setOrder(res.data ?? null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="text-[13px] text-gray-400 py-12 text-center">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4 text-sm">
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
        </button>
        <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const customerName = order.user?.name || order.shippingAddress?.fullName || 'Guest';
  const customerId = order.user?.customId || order.user?._id || '';
  const firstSeller = order.orderItems?.[0]?.seller;
  const shopName = firstSeller?.name || firstSeller?.email || '—';
  const shopId = firstSeller?._id || '';

  const subtotal = order.orderItems.reduce((s, it) => s + it.qty * it.price, 0);
  const shipping = Math.max(0, order.totalPrice - subtotal);

  const statusKey: AdminOrderStatus = order.status;
  const isDisputed = statusKey === 'disputed';

  return (
    <div className="space-y-4 text-sm">
      <button
        onClick={() => router.push('/orders')}
        className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[12px] text-gray-500">#{order._id.slice(-10).toUpperCase()}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[statusKey] ?? 'bg-gray-100 text-gray-600'}`}>
              {statusLabel[statusKey] ?? statusKey}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Placed {formatDate(order.createdAt)}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Contact Buyer
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Invoice
          </button>
          {isDisputed && (
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-orange-700 bg-orange-50 inline-flex items-center hover:bg-orange-100">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Escalate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2">
              Items ({order.orderItems.length})
            </h3>
            <div className="rounded-lg overflow-hidden space-y-2">
              {order.orderItems.map((it) => (
                <div key={it._id} className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{it.name}</p>
                    <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                      {it.product?._id ? it.product._id.slice(-8).toUpperCase() : '—'}
                    </p>
                  </div>
                  <div className="text-[12px] text-gray-500">×{it.qty}</div>
                  <div className="text-[12px] text-gray-700">{formatMoney(it.price)} ₭</div>
                  <div className="text-[13px] font-bold text-gray-900 w-32 text-right tabular-nums">
                    {formatMoney(it.qty * it.price)} ₭
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg overflow-hidden">
            <Row label="Subtotal" value={`${formatMoney(subtotal)} ₭`} />
            <Row label="Shipping" value={`${formatMoney(shipping)} ₭`} />
            <Row label="Total" value={`${formatMoney(order.totalPrice)} ₭`} bold />
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide mb-3">Timeline</h3>
            <div className="border-l border-gray-200 ml-2 pl-2">
              <TimelineEvent at={formatDate(order.createdAt)} event="Order placed" actor="Customer" />
              {order.isPaid && (
                <TimelineEvent at={formatDate(order.paidAt)} event="Payment confirmed" actor="System" />
              )}
              {order.rawStatus === 'shipped' && (
                <TimelineEvent at={formatDate(order.updatedAt)} event="Shipped" actor="Seller" />
              )}
              {order.isDelivered && (
                <TimelineEvent at={formatDate(order.deliveredAt)} event="Delivered" actor="Carrier" />
              )}
              {order.rawStatus === 'canceled' && (
                <TimelineEvent at={formatDate(order.updatedAt)} event="Order canceled" actor="Admin/System" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Section icon={User} title="Customer">
            <Row2 label="Name" value={customerName} link={customerId ? `/users/${customerId}` : undefined} />
            <Row2 label="Customer ID" value={customerId || '—'} mono />
            {order.user?.email && <Row2 label="Email" value={order.user.email} />}
            {order.user?.phone && <Row2 label="Phone" value={order.user.phone} />}
          </Section>

          <Section icon={Store} title="Shop">
            <Row2 label="Name" value={shopName} link={shopId ? `/shops/${shopId}` : undefined} />
            <Row2 label="Shop ID" value={firstSeller?.customId || shopId || '—'} mono />
          </Section>

          <Section icon={CreditCard} title="Payment">
            <Row2 label="Method" value={order.paymentMethod || '—'} />
            <Row2 label="Status" value={order.isPaid ? 'Paid' : 'Unpaid'} />
            <Row2 label="Paid At" value={formatDate(order.paidAt)} />
          </Section>

          <Section icon={Truck} title="Shipping">
            <Row2 label="Status" value={order.isDelivered ? 'Delivered' : 'In transit / Pending'} />
            <Row2 label="Delivered" value={formatDate(order.deliveredAt)} />
          </Section>

          <Section icon={MapPin} title="Address">
            <p className="text-[12px] text-gray-700 leading-relaxed">
              <span className="font-medium">{order.shippingAddress.fullName}</span>
              <br />
              {order.shippingAddress.phone}
              <br />
              {order.shippingAddress.address}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

const TimelineEvent = ({ at, event, actor }: { at: string; event: string; actor: string }) => (
  <div className="relative pl-6 pb-5 last:pb-0">
    <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary" />
    <p className="text-[12px] font-medium text-gray-900">{event}</p>
    <p className="text-[11px] text-gray-500 mt-0.5 tabular-nums">{at} · {actor}</p>
  </div>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex items-center justify-between px-5 py-3 ${bold ? 'bg-gray-50 rounded-lg' : ''}`}>
    <span className={`${bold ? 'font-semibold text-gray-900' : 'text-gray-500 text-[12px]'}`}>{label}</span>
    <span className={`tabular-nums ${bold ? 'text-lg font-bold text-black' : 'text-[12px] text-gray-900'}`}>
      {value}
    </span>
  </div>
);

const Section = ({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) => (
  <div className="rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <h4 className="text-[11px] font-semibold text-gray-500 tracking-wide">{title}</h4>
    </div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Row2 = ({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] text-gray-500">{label}</span>
    {link ? (
      <a href={link} className="text-[12px] text-gray-900 hover:text-primary transition-colors truncate">{value}</a>
    ) : (
      <span className={`text-[12px] text-gray-900 truncate ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
    )}
  </div>
);

export default OrderDetailPage;
