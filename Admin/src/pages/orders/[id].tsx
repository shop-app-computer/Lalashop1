import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Package, User, Store, CreditCard, MapPin,
  Truck, FileText, MessageSquare, AlertCircle, CheckCircle2,
  XCircle, Clock, Receipt, Loader2, ExternalLink,
} from 'lucide-react';
import {
  fetchAdminOrder,
  reviewAdminSlip,
  type AdminOrderDetail,
  type AdminOrderStatus,
} from '@/services/adminApi';

const statusBadge: Record<string, string> = {
  paid: 'bg-blue-50 text-blue-700',
  shipping: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-cyan-50 text-cyan-700',
  disputed: 'bg-red-50 text-red-700',
  pending_payment: 'bg-orange-50 text-orange-700',
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
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slipBusy, setSlipBusy] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const reload = async () => {
    if (typeof id !== 'string') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminOrder(id);
      setOrder(res.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.orders.details.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReviewSlip = async (action: 'verify' | 'reject', reason?: string) => {
    if (!order?.slip?._id) return;
    setSlipBusy(true);
    setSlipError(null);
    try {
      await reviewAdminSlip(order.slip._id, { action, reason });
      setRejectOpen(false);
      setRejectReason('');
      await reload();
    } catch (err) {
      setSlipError(err instanceof Error ? err.message : t('pages.orders.details.failedToUpdateSlip'));
    } finally {
      setSlipBusy(false);
    }
  };

  if (loading) {
    return <div className="text-[13px] text-gray-400 py-12 text-center">{t('pages.orders.details.loading')}</div>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4 text-sm">
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t('pages.orders.details.back')}
        </button>
        <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error || t('pages.orders.details.notFound')}
        </div>
      </div>
    );
  }

  const customerName = order.user?.name || order.shippingAddress?.fullName || t('common.guest');
  const customerUserId = order.user?._id || '';
  const customerCustomId = order.user?.customId || customerUserId;
  const firstSeller = order.orderItems?.[0]?.seller;
  const shopName = firstSeller?.name || firstSeller?.email || '—';
  const shopId = firstSeller?._id || '';

  const subtotal = order.orderItems.reduce((s, it) => s + it.qty * it.price, 0);
  const shipping = Math.max(0, order.totalPrice - subtotal);

  const statusKey: AdminOrderStatus = order.status;
  const isDisputed = statusKey === 'disputed';

  const slip = order.slip;
  const slipPending = slip?.status === 'pending';
  const slipVerified = slip?.status === 'verified';
  const slipRejected = slip?.status === 'rejected';
  const amountMatches = slip ? Math.abs(slip.transferAmount - order.totalPrice) < 1 : true;
  const account = slip?.paymentMethod;
  const accountLine = account
    ? account.kind === 'promptpay'
      ? `PromptPay · ${account.promptpayId || account.label || ''}`
      : account.kind === 'bank'
        ? `${account.bankName || account.label || 'Bank'} ····${(account.accountNumber || '').slice(-4)} (${account.accountName || '—'})`
        : account.label || 'Static QR'
    : '—';

  return (
    <div className="space-y-4 text-sm">
      <button
        onClick={() => router.push('/orders')}
        className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {t('pages.orders.details.back')}
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-[12px] text-gray-500">#{order._id.slice(-10).toUpperCase()}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[statusKey] ?? 'bg-gray-100 text-gray-600'}`}>
              {t(`status.${statusKey}`, statusKey)}
            </span>
            {shopId && (
              <Link
                href={`/shops/${shopId}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors"
              >
                <Store className="w-3 h-3" />
                {t('pages.orders.details.fromShop')}: {shopName}
              </Link>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('pages.orders.details.placedAt', { date: formatDate(order.createdAt) })}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> {t('pages.orders.details.contactBuyer')}
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> {t('pages.orders.details.invoice')}
          </button>
          {isDisputed && (
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-orange-700 bg-orange-50 inline-flex items-center hover:bg-orange-100">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> {t('pages.orders.details.escalate')}
            </button>
          )}
        </div>
      </div>

      {slip && (
        <div
          className={`rounded-2xl border-2 p-5 ${
            slipVerified
              ? ' border-emerald-100 bg-emerald-50/30'
              : slipRejected
                ? ' border-rose-100 bg-rose-50/30'
                : 'border-amber-100 bg-amber-50/30'
          }`}
        >
          <div className="flex items-start gap-2 mb-3">
            <Receipt className={`w-4 h-4 mt-0.5 ${slipVerified ? 'text-emerald-600' : slipRejected ? 'text-rose-600' : 'text-amber-600'}`} />
            <div className="flex-1 min-w-0">
              <h3 className={`text-[13px] font-bold ${slipVerified ? 'text-emerald-900' : slipRejected ? 'text-rose-900' : 'text-amber-900'}`}>
                {slipVerified
                  ? t('pages.orders.details.paymentVerified')
                  : slipRejected
                    ? t('pages.orders.details.paymentRejected')
                    : t('pages.orders.details.slipAwaitingReview')}
              </h3>
              <p className="text-[11px] text-gray-700 mt-0.5">
                <strong>{customerName}</strong> {t('pages.orders.details.transferred')}{' '}
                <strong className="tabular-nums">฿{formatMoney(slip.transferAmount)}</strong> {t('pages.orders.details.to')}{' '}
                <strong>{accountLine}</strong>.
                {!amountMatches && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold tracking-wide">
                    {t('pages.orders.details.amountMismatch')} ฿{formatMoney(order.totalPrice)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href={slip.slipImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slip.slipImageUrl} alt={t('pages.orders.details.slip')} className="w-full h-auto" />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-2.5 h-2.5" /> {t('actions.view')}
              </span>
            </a>

            <div className="md:col-span-2 space-y-2 text-[12px]">
              <SlipRow label={t('pages.orders.details.orderAmount')} value={`฿${formatMoney(order.totalPrice)}`} />
              <SlipRow label={t('pages.orders.details.transferredAmount')} value={`฿${formatMoney(slip.transferAmount)}`} bold />
              {slip.transferRef && <SlipRow label={t('table.transactionId')} value={slip.transferRef} mono />}
              {slip.transferredAt && <SlipRow label={t('pages.orders.details.transferredAt')} value={formatDate(slip.transferredAt)} />}
              <SlipRow label={t('pages.orders.details.toAccount')} value={accountLine} />
              {slip.buyerNote && <SlipRow label={t('pages.orders.details.buyerNote')} value={slip.buyerNote} />}
              {slipRejected && slip.rejectionReason && (
                <p className="px-2 py-1.5 rounded bg-rose-50 text-rose-700 text-[11px]">
                  {slip.rejectionReason}
                </p>
              )}
              {slipVerified && slip.reviewedBy && (
                <p className="text-[11px] text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('pages.orders.details.verifiedBy')} {slip.reviewedBy.name || slip.reviewedBy.email} ·{' '}
                  {formatDate(slip.reviewedAt)}
                </p>
              )}

              {slipPending && (
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <button
                    onClick={() => handleReviewSlip('verify')}
                    disabled={slipBusy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {slipBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {slipBusy ? t('actions.confirming') : t('actions.confirmPayment')}
                  </button>
                  <button
                    onClick={() => setRejectOpen(true)}
                    disabled={slipBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {t('actions.reject')}
                  </button>
                  {slipError && (
                    <span className="text-[11px] text-rose-600 font-medium">{slipError}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!slip && !order.isPaid && (
        <div className="rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 text-[12px] text-gray-600 inline-flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          {t('pages.orders.details.awaitingPayment')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide">
                {t('pages.orders.details.items')}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold tabular-nums">
                  {order.orderItems.length}
                </span>
              </h3>
            </div>
            <div className="rounded-lg overflow-hidden space-y-2">
              {order.orderItems.map((it) => {
                const productId = it.product?._id;
                const inner = (
                  <>
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
                        {productId ? productId.slice(-8).toUpperCase() : '—'}
                      </p>
                    </div>
                    <div className="text-[12px] text-gray-500">×{it.qty}</div>
                    <div className="text-[12px] text-gray-700">{formatMoney(it.price)} {t('common.currencySymbol')}</div>
                    <div className="text-[13px] font-bold text-gray-900 w-32 text-right tabular-nums">
                      {formatMoney(it.qty * it.price)} {t('common.currencySymbol')}
                    </div>
                  </>
                );
                return productId ? (
                  <Link
                    key={it._id}
                    href={`/products/${productId}`}
                    className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={it._id} className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg">
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg overflow-hidden">
            <Row label={t('pages.orders.details.subtotal')} value={`${formatMoney(subtotal)} ${t('common.currencySymbol')}`} />
            <Row label={t('pages.orders.details.shippingFee')} value={`${formatMoney(shipping)} ${t('common.currencySymbol')}`} />
            <Row label={t('pages.orders.details.total')} value={`${formatMoney(order.totalPrice)} ${t('common.currencySymbol')}`} bold />
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide mb-3">{t('pages.orders.details.timeline')}</h3>
            <div className="border-l border-gray-200 ml-2 pl-2">
              <TimelineEvent at={formatDate(order.createdAt)} event={t('pages.orders.details.eventPlaced')} actor={t('pages.orders.details.actorCustomer')} />
              {order.isPaid && (
                <TimelineEvent at={formatDate(order.paidAt)} event={t('pages.orders.details.eventPaid')} actor={t('pages.orders.details.actorSystem')} />
              )}
              {order.rawStatus === 'shipped' && (
                <TimelineEvent at={formatDate(order.updatedAt)} event={t('pages.orders.details.eventShipped')} actor={t('pages.orders.details.actorSeller')} />
              )}
              {order.isDelivered && (
                <TimelineEvent at={formatDate(order.deliveredAt)} event={t('pages.orders.details.eventDelivered')} actor={t('pages.orders.details.actorCarrier')} />
              )}
              {order.rawStatus === 'canceled' && (
                <TimelineEvent at={formatDate(order.updatedAt)} event={t('pages.orders.details.eventCancelled')} actor={t('pages.orders.details.actorAdmin')} />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Section icon={User} title={t('pages.orders.details.customer')}>
            <Row2
              label={t('auth.name')}
              value={customerName}
              link={customerUserId ? `/users/${customerUserId}` : undefined}
            />
            <Row2 label={t('table.user') + ' ID'} value={customerCustomId || '—'} mono />
            {order.user?.email && <Row2 label={t('auth.email')} value={order.user.email} />}
            {order.user?.phone && <Row2 label={t('auth.phone')} value={order.user.phone} />}
          </Section>

          <Section icon={Store} title={t('pages.orders.details.shop')}>
            <Row2 label={t('auth.name')} value={shopName} link={shopId ? `/shops/${shopId}` : undefined} />
            <Row2 label={t('table.shop') + ' ID'} value={firstSeller?.customId || shopId || '—'} mono />
          </Section>

          <Section icon={CreditCard} title={t('pages.orders.details.payment')}>
            <Row2 label={t('table.payment')} value={order.paymentMethod || '—'} />
            <Row2
              label={t('table.status')}
              value={
                order.isPaid
                  ? t('status.paid')
                  : slipPending
                    ? t('pages.orders.details.awaitingVerification')
                    : slipRejected
                      ? t('status.rejected')
                      : t('status.unpaid')
              }
            />
            <Row2 label={t('pages.orders.details.paidAt')} value={formatDate(order.paidAt)} />
            {account && <Row2 label={t('pages.orders.details.toAccount')} value={accountLine} />}
          </Section>

          <Section icon={Truck} title={t('pages.orders.details.shipping')}>
            <Row2 label={t('table.status')} value={order.isDelivered ? t('status.delivered') : t('pages.orders.details.inTransit')} />
            <Row2 label={t('status.delivered')} value={formatDate(order.deliveredAt)} />
          </Section>

          <Section icon={MapPin} title={t('pages.orders.details.shipping')}>
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

      {/* Reject reason modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-[14px] font-bold">{t('pages.orders.rejectModal.title')}</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-[12px] text-gray-600">
                {t('pages.orders.rejectModal.description')}
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder={t('pages.orders.rejectModal.placeholder')}
                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-primary outline-none text-[12px]"
              />
              {slipError && (
                <p className="rounded px-3 py-2 bg-red-50 text-red-700 text-[11px]">{slipError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => setRejectOpen(false)}
                disabled={slipBusy}
                className="px-3 py-1.5 rounded text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={() => handleReviewSlip('reject', rejectReason.trim())}
                disabled={slipBusy || !rejectReason.trim()}
                className="px-4 py-1.5 rounded text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {slipBusy ? t('pages.orders.rejectModal.rejectingShort') : t('pages.orders.rejectModal.rejectButton')}
              </button>
            </div>
          </div>
        </div>
      )}
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

interface SlipRowProps {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}
const SlipRow = ({ label, value, mono, bold }: SlipRowProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] text-gray-500">{label}</span>
    <span
      className={`text-right break-all ${mono ? 'font-mono text-[11px]' : ''} ${
        bold ? 'font-bold text-gray-900' : 'text-gray-700'
      }`}
    >
      {value}
    </span>
  </div>
);

export default OrderDetailPage;

