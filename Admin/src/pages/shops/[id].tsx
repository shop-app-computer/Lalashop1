import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  fetchUserById,
  fetchShopKycByUserId,
  fetchAdminProducts,
  fetchAdminOrders,
  fetchAdminReports,
  type AdminUserDetail,
  type AdminKycSubmission,
  type AdminProductRow,
  type AdminOrderRow,
  type AdminReportRow,
} from '@/services/adminApi';

type Tab = 'overview' | 'products' | 'orders' | 'violations' | 'analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'violations', label: 'Violations' },
  { id: 'analytics', label: 'Analytics' },
];

interface ShopStatus {
  key: 'active' | 'pending' | 'rejected' | 'closed';
  label: string;
  cls: string;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB');
};

const formatDateTime = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB');
};

const buildAddress = (kyc: AdminKycSubmission | null): string => {
  if (!kyc) return '—';
  const a = kyc.identity?.address;
  if (!a) return kyc.warehouse?.fullAddress || '—';
  const parts = [a.street, a.apartment, a.city, a.state, a.zip, a.country]
    .filter((p) => Boolean(p && String(p).trim()))
    .join(', ');
  return parts || kyc.warehouse?.fullAddress || '—';
};

const computeStatus = (
  user: AdminUserDetail,
  kyc: AdminKycSubmission | null,
): ShopStatus => {
  if (kyc?.status === 'approved' || (user.seller_type && user.seller_type.trim() !== '')) {
    return { key: 'active', label: 'Active', cls: ' text-emerald-700' };
  }
  if (kyc?.status === 'rejected') {
    return { key: 'rejected', label: 'Rejected', cls: 'bg-red-50 text-red-700' };
  }
  if (kyc?.status === 'pending') {
    return { key: 'pending', label: 'Pending', cls: 'bg-orange-50 text-orange-700' };
  }
  return { key: 'closed', label: 'Unverified', cls: 'bg-gray-100 text-gray-600' };
};

const ShopDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [kyc, setKyc] = useState<AdminKycSubmission | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id !== 'string' || !id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchUserById(id), fetchShopKycByUserId(id)])
      .then(([userRes, kycData]) => {
        if (cancelled) return;
        if (userRes.data) {
          setUser(userRes.data);
        } else {
          setError(userRes.message || 'Shop not found');
        }
        setKyc(kycData);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load shop');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const status = useMemo(
    () => (user ? computeStatus(user, kyc) : null),
    [user, kyc],
  );

  if (loading) {
    return (
      <div className="text-[12px] text-gray-400 py-12 text-center">Loading shop…</div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-[12px] text-red-600 py-12 text-center">
        {error || 'Shop not found'}
      </div>
    );
  }

  const shopName = kyc?.shopInfo?.shopName || user.name || user.username || '—';
  const ownerName =
    `${kyc?.identity?.firstName ?? ''} ${kyc?.identity?.middleName ?? ''} ${kyc?.identity?.lastName ?? ''}`
      .replace(/\s+/g, ' ')
      .trim() ||
    user.name ||
    '—';
  const category = kyc?.shopInfo?.shopCategory || user.seller_type || '';
  const businessType = kyc?.businessType || '—';
  const followers = user.followers?.length ?? 0;
  const following = user.following?.length ?? 0;
  const stats = user.stats;
  const finance = user.finance;
  const lifetimeIncome = finance
    ? finance.income.sellerWebSales.total +
      finance.income.creatorEarnings.settledTotal +
      finance.income.posRevenue
    : 0;
  const pendingWithdrawalsCount = stats?.pendingWithdrawals ?? 0;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-black">{shopName}</h1>
            {status && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded ${status.cls}`}
              >
                {status.label}
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono">
              {user.customId || user._id.slice(-6)}
            </span>
            {category && <span>· {category}</span>}
            <span>· {formatNumber(followers)} followers</span>
            <span>· {formatNumber(following)} following</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
            Message
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100">
            Suspend
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100">
            Close Shop
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100 text-[12px]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 -mb-px font-medium transition-colors ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Section title="">
              <Row label="Full Name" value={ownerName} />
              <Row label="Shop Email" value={kyc?.shopInfo?.shopEmail || '—'} />
              <Row label="Phone" value={user.phone || '—'} />
              <Row label="Created" value={formatDate(user.createdAt)} />
              <Row label="Verified" value={formatDate(kyc?.reviewedAt)} />
              <Row label="IP" value={user.lastKnownIp || '—'} />
              <Row label="Shop Category" value={kyc?.shopInfo?.shopCategory || '—'} />
              <Row label="Business Type" value={businessType} />
              <Row label="Seller Type" value={user.seller_type || '—'} />
              <Row label="Entity Name" value={kyc?.shopInfo?.entityName || '—'} />
              <Row label="TIN Number" value={kyc?.identity?.tinNumber || '—'} />
            </Section>

            <Section title="KYC Identity">
              <Row label="ID Type" value={kyc?.identity?.idType || '—'} />
              <Row label="ID Number" value={kyc?.identity?.idNumber || '—'} />
              <Row label="Birth Date" value={formatDate(kyc?.identity?.birthDate)} />
              <Row label="ID Expiry" value={formatDate(kyc?.identity?.expiryDate)} />
              <Row label="Address" value={buildAddress(kyc)} />
              {kyc?.warehouse?.fullAddress && (
                <Row label="Warehouse" value={kyc.warehouse.fullAddress} />
              )}
            </Section>

            <Section title="KYC Documents">
              <KycDocLinks kyc={kyc} />
            </Section>

            {user.bank ? (
              <Section title="Bank">
                <Row label="Bank Name" value={user.bank.bankName} />
                <Row label="Account Name" value={user.bank.accountName} />
                <Row label="Account Number" value={user.bank.accountNumber} />
                <Row
                  label="Verified"
                  value={user.bank.isVerified ? 'Yes' : 'No'}
                />
              </Section>
            ) : (
              <Section title="Bank">
                <p className="text-[12px] text-gray-400">
                  No bank account on file.
                </p>
              </Section>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Section title="Lifetime Totals">
              <div className="grid grid-cols-3 gap-3">
                <MetricCard
                  label="Total Products"
                  value={formatNumber(stats?.productCount ?? 0)}
                />
                <MetricCard
                  label="Total Orders"
                  value={formatNumber(finance?.sellerActivity.ordersReceived ?? 0)}
                />
                <MetricCard
                  label="Gross Revenue (₭)"
                  value={formatCurrency(finance?.sellerActivity.grossRevenue ?? 0)}
                />
              </div>
            </Section>

            <Section title="Balance & Payout">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Current Balance (₭)"
                  value={formatCurrency(user.balance ?? 0)}
                />
                <MetricCard
                  label="Pending Withdrawals"
                  value={formatNumber(pendingWithdrawalsCount)}
                />
                <MetricCard
                  label="POS Revenue (₭)"
                  value={formatCurrency(user.posRevenue ?? 0)}
                />
                <MetricCard
                  label="Lifetime Income (₭)"
                  value={formatCurrency(lifetimeIncome)}
                />
              </div>
            </Section>

            {finance && (
              <Section title="Money Source — Where the Balance Came From">
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard
                    label="Web Sales (₭)"
                    value={formatCurrency(finance.income.sellerWebSales.total)}
                  />
                  <MetricCard
                    label="Creator Commission (₭)"
                    value={formatCurrency(finance.income.creatorEarnings.settledTotal)}
                  />
                  <MetricCard
                    label="POS Revenue (₭)"
                    value={formatCurrency(finance.income.posRevenue)}
                  />
                </div>
                <div className="mt-3 space-y-2 text-[12px]">
                  <Row
                    label="Web sales orders"
                    value={`${formatNumber(finance.income.sellerWebSales.orders)} orders · ${formatNumber(finance.income.sellerWebSales.itemsSold)} items sold`}
                  />
                  <Row
                    label="Creator earnings settled"
                    value={`${finance.income.creatorEarnings.byStatus.settled?.count ?? 0} settled · ${finance.income.creatorEarnings.byStatus.pending?.count ?? 0} pending`}
                  />
                  <Row
                    label="Refunds issued"
                    value={`฿${formatCurrency(finance.outgoing.refundsIssued.total)} (${finance.outgoing.refundsIssued.count} refunds)`}
                  />
                </div>
              </Section>
            )}

            {finance && (
              <Section title="Withdrawal History">
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard
                    label="Total Requests"
                    value={formatNumber(finance.withdrawals.totalCount)}
                  />
                  <MetricCard
                    label="Total Amount (₭)"
                    value={formatCurrency(finance.withdrawals.totalAmount)}
                  />
                  <MetricCard
                    label="Net to Bank (₭)"
                    value={formatCurrency(finance.withdrawals.totalNet)}
                  />
                </div>
                <div className="mt-3 space-y-2 text-[12px]">
                  {Object.entries(finance.withdrawals.byStatus).map(([statusKey, row]) => (
                    <Row
                      key={statusKey}
                      label={`${statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}`}
                      value={`฿${formatCurrency(row.totalAmount)} · ${row.count} request${row.count === 1 ? '' : 's'}`}
                    />
                  ))}
                  {Object.keys(finance.withdrawals.byStatus).length === 0 && (
                    <p className="text-[12px] text-gray-400">No withdrawal history.</p>
                  )}
                  {finance.withdrawals.last && (
                    <Row
                      label="Last withdrawal"
                      value={`฿${formatCurrency(finance.withdrawals.last.amount)} (net ฿${formatCurrency(finance.withdrawals.last.netAmount)} · fee ฿${formatCurrency(finance.withdrawals.last.fee)}) · ${finance.withdrawals.last.status} · ${formatDateTime(finance.withdrawals.last.createdAt)}`}
                    />
                  )}
                </div>
              </Section>
            )}

            {finance && (
              <Section title="Order Activity">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2">
                      As a seller (this shop)
                    </p>
                    <div className="space-y-2 text-[12px]">
                      <Row
                        label="Orders received"
                        value={formatNumber(finance.sellerActivity.ordersReceived)}
                      />
                      <Row
                        label="Items sold"
                        value={formatNumber(finance.sellerActivity.itemsSold)}
                      />
                      <Row
                        label="Gross revenue"
                        value={`฿${formatCurrency(finance.sellerActivity.grossRevenue)}`}
                      />
                      <Row
                        label="Avg / order"
                        value={
                          finance.sellerActivity.ordersReceived > 0
                            ? `฿${formatCurrency(finance.sellerActivity.grossRevenue / finance.sellerActivity.ordersReceived)}`
                            : '—'
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2">
                      As a buyer (owner account)
                    </p>
                    <div className="space-y-2 text-[12px]">
                      <Row
                        label="Paid orders"
                        value={formatNumber(finance.buyerActivity.paidCount)}
                      />
                      <Row
                        label="Unpaid / pending"
                        value={formatNumber(finance.buyerActivity.unpaidCount)}
                      />
                      <Row
                        label="Total spent"
                        value={`฿${formatCurrency(finance.buyerActivity.paidTotal)}`}
                      />
                      <Row
                        label="Last paid order"
                        value={
                          finance.buyerActivity.lastPaidAt
                            ? `฿${formatCurrency(finance.buyerActivity.lastPaidAmount)} · ${formatDate(finance.buyerActivity.lastPaidAt)}`
                            : '—'
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                  <Link
                    href={`/orders?seller=${user._id}`}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    View shop orders →
                  </Link>
                  <Link
                    href={`/orders?user=${user._id}`}
                    className="text-primary font-bold hover:underline"
                  >
                    View buyer orders →
                  </Link>
                  <Link
                    href={`/products?seller=${user._id}`}
                    className="text-gray-700 font-bold hover:underline"
                  >
                    View products →
                  </Link>
                </div>
              </Section>
            )}

            {stats?.lastOrderAt && (
              <Section title="Last Order Received">
                <Row
                  label="Amount"
                  value={`฿${formatCurrency(stats.lastOrderTotal)}`}
                />
                <Row
                  label="Status"
                  value={stats.lastOrderStatus || '—'}
                />
                <Row
                  label="When"
                  value={formatDateTime(stats.lastOrderAt)}
                />
              </Section>
            )}

            {user.bio && (
              <Section title="Shop Bio">
                <p className="text-[12px] text-gray-700 whitespace-pre-wrap">
                  {user.bio}
                </p>
              </Section>
            )}

            <Section title="Timestamps">
              <Row label="Created" value={formatDateTime(user.createdAt)} />
              <Row label="Updated" value={formatDateTime(user.updatedAt)} />
              {kyc && (
                <>
                  <Row
                    label="KYC Submitted"
                    value={formatDateTime(kyc.submittedAt)}
                  />
                  <Row
                    label="KYC Reviewed"
                    value={formatDateTime(kyc.reviewedAt)}
                  />
                  {kyc.reviewedBy && (
                    <Row
                      label="Reviewed By"
                      value={kyc.reviewedBy.name || kyc.reviewedBy.email || '—'}
                    />
                  )}
                  {kyc.reviewNote && (
                    <Row label="Review Note" value={kyc.reviewNote} />
                  )}
                </>
              )}
            </Section>
          </div>
        </div>
      )}

      {tab === 'products' && <ProductsTab sellerId={user._id} />}
      {tab === 'orders' && <OrdersTab sellerId={user._id} />}
      {tab === 'violations' && <ViolationsTab sellerId={user._id} />}
      {tab === 'analytics' && <AnalyticsTab user={user} />}
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="rounded-lg p-5 bg-white border border-gray-100">
    {title && (
      <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide mb-4">
        {title}
      </h3>
    )}
    <div className="space-y-3 text-[12px]">{children}</div>
  </div>
);

interface RowProps {
  label: string;
  value: string;
  link?: string;
}

const Row = ({ label, value, link }: RowProps) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">
      {label}
    </p>
    {link ? (
      <Link
        href={link}
        className="block mt-0.5 text-gray-900 hover:text-primary transition-colors"
      >
        {value}
      </Link>
    ) : (
      <p className="mt-0.5 text-gray-900 break-words">{value}</p>
    )}
  </div>
);

interface MetricCardProps {
  label: string;
  value: string;
}

const MetricCard = ({ label, value }: MetricCardProps) => (
  <div className="rounded-lg px-4 py-3 bg-gray-50">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">
      {label}
    </p>
    <p className="text-xl font-bold text-black tabular-nums mt-1">{value}</p>
  </div>
);

interface KycDocLinksProps {
  kyc: AdminKycSubmission | null;
}

const KycDocLinks = ({ kyc }: KycDocLinksProps) => {
  if (!kyc) {
    return <p className="text-[12px] text-gray-400">No KYC submission.</p>;
  }
  const docs: { label: string; url?: string }[] = [];
  if (kyc.identity?.idDocumentUrl) {
    docs.push({
      label: `${kyc.identity.idType || 'ID'} Document`,
      url: kyc.identity.idDocumentUrl,
    });
  }
  if (kyc.identity?.businessLicenseUrl) {
    docs.push({
      label: 'Business License',
      url: kyc.identity.businessLicenseUrl,
    });
  }
  (kyc.identity?.documents || []).forEach((d) => {
    docs.push({ label: d.label || 'Supporting Document', url: d.url });
  });

  if (docs.length === 0) {
    return <p className="text-[12px] text-gray-400">No documents uploaded.</p>;
  }

  return (
    <div className="space-y-2">
      {docs.map((d, i) => (
        <a
          key={`${d.label}-${i}`}
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[12px] text-primary hover:underline break-all"
        >
          {d.label} →
        </a>
      ))}
    </div>
  );
};

// ─── Tabs ────────────────────────────────────────────────────────────

interface ProductsTabProps {
  sellerId: string;
}

const ProductsTab = ({ sellerId }: ProductsTabProps) => {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminProducts({ seller: sellerId, limit: 200 })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const totals = useMemo(() => {
    const inStock = products.reduce((s, p) => s + (p.countInStock || 0), 0);
    const valuation = products.reduce(
      (s, p) => s + (p.price || 0) * (p.countInStock || 0),
      0,
    );
    const active = products.filter((p) => p.status === 'Active').length;
    const draft = products.filter((p) => p.status === 'Draft').length;
    const archived = products.filter((p) => p.status === 'Archived').length;
    return { inStock, valuation, active, draft, archived };
  }, [products]);

  if (loading) {
    return <div className="text-[12px] text-gray-400 py-12 text-center">Loading products…</div>;
  }
  if (error) {
    return <div className="text-[12px] text-red-600 py-6 text-center">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Total Products" value={formatNumber(products.length)} />
        <MetricCard label="Active" value={formatNumber(totals.active)} />
        <MetricCard label="Draft" value={formatNumber(totals.draft)} />
        <MetricCard label="Archived" value={formatNumber(totals.archived)} />
        <MetricCard label="In-stock units" value={formatNumber(totals.inStock)} />
      </div>

      <Section title="">
        {products.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-8">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold text-gray-500 tracking-wide">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3 text-right">Price</th>
                  <th className="py-2 pr-3 text-right">Stock</th>
                  <th className="py-2 pr-3 text-right">Sold</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cover = Array.isArray(p.image) ? p.image[0] : p.image;
                  return (
                    <tr key={p._id} className="border-t border-gray-50">
                      <td className="py-2 pr-3">
                        <Link
                          href={`/products/${p._id}`}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={p.name}
                              className="w-9 h-9 rounded object-cover bg-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100 flex-shrink-0" />
                          )}
                          <span className="font-medium line-clamp-1">{p.name}</span>
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-gray-600">{p.category || '—'}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        ฿{formatCurrency(p.price)}
                      </td>
                      <td
                        className={`py-2 pr-3 text-right tabular-nums ${
                          p.countInStock <= 0 ? 'text-rose-600 font-bold' : ''
                        }`}
                      >
                        {formatNumber(p.countInStock)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-gray-600">
                        {formatNumber(p.soldCount ?? 0)}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.status === 'Draft'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Link
        href={`/products?seller=${sellerId}`}
        className="text-[11px] text-primary font-bold hover:underline"
      >
        Open in full products list →
      </Link>
    </div>
  );
};

interface OrdersTabProps {
  sellerId: string;
}

const OrdersTab = ({ sellerId }: OrdersTabProps) => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminOrders({ seller: sellerId, limit: 200 })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const totals = useMemo(() => {
    const totalAmount = orders.reduce((s, o) => s + (o.amount || 0), 0);
    const paid = orders.filter((o) => o.isPaid).length;
    const delivered = orders.filter((o) => o.isDelivered).length;
    const cancelled = orders.filter((o) => o.rawStatus === 'canceled').length;
    return { totalAmount, paid, delivered, cancelled };
  }, [orders]);

  if (loading) {
    return <div className="text-[12px] text-gray-400 py-12 text-center">Loading orders…</div>;
  }
  if (error) {
    return <div className="text-[12px] text-red-600 py-6 text-center">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Orders" value={formatNumber(orders.length)} />
        <MetricCard label="Paid" value={formatNumber(totals.paid)} />
        <MetricCard label="Delivered" value={formatNumber(totals.delivered)} />
        <MetricCard label="Cancelled" value={formatNumber(totals.cancelled)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MetricCard label="Gross order amount (₭)" value={formatCurrency(totals.totalAmount)} />
        <MetricCard
          label="Avg order (₭)"
          value={formatCurrency(orders.length > 0 ? totals.totalAmount / orders.length : 0)}
        />
      </div>

      <Section title="">
        {orders.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-8">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold text-gray-500 tracking-wide">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3 text-right">Items</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3">Payment</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">When</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-gray-50">
                    <td className="py-2 pr-3 font-mono">
                      <Link
                        href={`/orders/${o._id}`}
                        className="text-primary hover:underline"
                      >
                        {o.id}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-gray-700 line-clamp-1">{o.customer || '—'}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{o.itemCount}</td>
                    <td className="py-2 pr-3 text-right tabular-nums font-bold">
                      ฿{formatCurrency(o.amount)}
                    </td>
                    <td className="py-2 pr-3 text-gray-600">{o.paymentMethod}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                          o.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.status === 'paid' || o.status === 'shipping'
                              ? 'bg-blue-50 text-blue-700'
                              : o.status === 'cancelled' || o.status === 'refunded'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-500">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Link
        href={`/orders?seller=${sellerId}`}
        className="text-[11px] text-primary font-bold hover:underline"
      >
        Open in full orders list →
      </Link>
    </div>
  );
};

interface ViolationsTabProps {
  sellerId: string;
}

const ViolationsTab = ({ sellerId }: ViolationsTabProps) => {
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [flaggedProducts, setFlaggedProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchAdminReports({ targetType: 'shop', targetId: sellerId, limit: 100 }),
      fetchAdminProducts({ seller: sellerId, flag: 'violations', limit: 100 }),
    ])
      .then(([reportsRes, productsRes]) => {
        if (cancelled) return;
        setReports(reportsRes.data ?? []);
        setFlaggedProducts(productsRes.data ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load violations');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const reportTotals = useMemo(() => {
    const open = reports.filter((r) => r.status === 'open').length;
    const reviewing = reports.filter((r) => r.status === 'reviewing').length;
    const actioned = reports.filter((r) => r.status === 'actioned').length;
    const dismissed = reports.filter((r) => r.status === 'dismissed').length;
    return { open, reviewing, actioned, dismissed };
  }, [reports]);

  if (loading) {
    return <div className="text-[12px] text-gray-400 py-12 text-center">Loading violations…</div>;
  }
  if (error) {
    return <div className="text-[12px] text-red-600 py-6 text-center">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Total Reports" value={formatNumber(reports.length)} />
        <MetricCard label="Open" value={formatNumber(reportTotals.open)} />
        <MetricCard label="Reviewing" value={formatNumber(reportTotals.reviewing)} />
        <MetricCard label="Actioned" value={formatNumber(reportTotals.actioned)} />
        <MetricCard label="Flagged Products" value={formatNumber(flaggedProducts.length)} />
      </div>

      <Section title="Reports against this shop">
        {reports.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-6">No reports filed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold text-gray-500 tracking-wide">
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 pr-3">Description</th>
                  <th className="py-2 pr-3">Reported by</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">When</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id} className="border-t border-gray-50">
                    <td className="py-2 pr-3 font-bold tracking-wide text-gray-700">
                      {r.reason}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 max-w-md">
                      <span className="line-clamp-2">{r.description || '—'}</span>
                    </td>
                    <td className="py-2 pr-3 text-gray-600">
                      {r.reportedBy?.name || r.reportedBy?.email || '—'}
                    </td>
                    <td className="py-2 pr-3 text-gray-600">{r.actionTaken}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                          r.status === 'open'
                            ? 'bg-rose-50 text-rose-700'
                            : r.status === 'reviewing'
                              ? 'bg-amber-50 text-amber-700'
                              : r.status === 'actioned'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-500">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Flagged products">
        {flaggedProducts.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-6">No flagged products.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold text-gray-500 tracking-wide">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3 text-right">Price</th>
                  <th className="py-2 pr-3">Tags</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {flaggedProducts.map((p) => {
                  const cover = Array.isArray(p.image) ? p.image[0] : p.image;
                  return (
                    <tr key={p._id} className="border-t border-gray-50">
                      <td className="py-2 pr-3">
                        <Link
                          href={`/products/${p._id}`}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={p.name}
                              className="w-9 h-9 rounded object-cover bg-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100 flex-shrink-0" />
                          )}
                          <span className="font-medium line-clamp-1">{p.name}</span>
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-gray-600">{p.category || '—'}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        ฿{formatCurrency(p.price)}
                      </td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex flex-wrap gap-1">
                          {(p.tags || [])
                            .filter((t) => ['violation', 'reported', 'banned'].includes(t))
                            .map((t) => (
                              <span
                                key={t}
                                className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-rose-50 text-rose-700"
                              >
                                {t}
                              </span>
                            ))}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-600">{p.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
};

interface AnalyticsTabProps {
  user: AdminUserDetail;
}

const AnalyticsTab = ({ user }: AnalyticsTabProps) => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminOrders({ seller: user._id, limit: 500 })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user._id]);

  const stats30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 86400_000;
    const recent = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    const paid = recent.filter((o) => o.isPaid);
    const revenue = paid.reduce((s, o) => s + (o.amount || 0), 0);
    return {
      orders: recent.length,
      paidOrders: paid.length,
      revenue,
      avgOrder: paid.length > 0 ? revenue / paid.length : 0,
    };
  }, [orders]);

  // Daily revenue trend over last 30 days. We bucket paid orders into the
  // local-date string of when they were placed; bars are rendered as a small
  // sparkline so the admin can spot spikes / dead days at a glance.
  const trend = useMemo(() => {
    const days: { label: string; date: string; revenue: number; orders: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        date: key,
        revenue: 0,
        orders: 0,
      });
    }
    const byDate = new Map(days.map((d) => [d.date, d]));
    orders.forEach((o) => {
      if (!o.isPaid) return;
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const bucket = byDate.get(key);
      if (bucket) {
        bucket.revenue += o.amount || 0;
        bucket.orders += 1;
      }
    });
    const max = Math.max(1, ...days.map((d) => d.revenue));
    return { days, max };
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => {
      counts.set(o.status, (counts.get(o.status) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const paymentBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => {
      const k = o.paymentMethod || 'unknown';
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  if (loading) {
    return <div className="text-[12px] text-gray-400 py-12 text-center">Loading analytics…</div>;
  }
  if (error) {
    return <div className="text-[12px] text-red-600 py-6 text-center">{error}</div>;
  }

  const finance = user.finance;

  return (
    <div className="space-y-4">
      <Section title="Last 30 days">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Orders (30d)" value={formatNumber(stats30.orders)} />
          <MetricCard label="Paid orders (30d)" value={formatNumber(stats30.paidOrders)} />
          <MetricCard label="Revenue (30d, ₭)" value={formatCurrency(stats30.revenue)} />
          <MetricCard label="Avg order (₭)" value={formatCurrency(stats30.avgOrder)} />
        </div>
      </Section>

      <Section title="Daily revenue — last 30 days">
        {trend.days.every((d) => d.revenue === 0) ? (
          <p className="text-[12px] text-gray-400 text-center py-6">No paid orders in the last 30 days.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-32">
              {trend.days.map((d) => {
                const h = trend.max > 0 ? Math.max(2, (d.revenue / trend.max) * 100) : 2;
                return (
                  <div
                    key={d.date}
                    className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-colors"
                    style={{ height: `${h}%` }}
                    title={`${d.label} — ฿${formatCurrency(d.revenue)} · ${d.orders} order${d.orders === 1 ? '' : 's'}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 tabular-nums">
              <span>{trend.days[0]?.label}</span>
              <span>{trend.days[Math.floor(trend.days.length / 2)]?.label}</span>
              <span>{trend.days[trend.days.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Order status breakdown (lifetime)">
          {statusBreakdown.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-6">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {statusBreakdown.map(([status, count]) => (
                <Row
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  value={`${formatNumber(count)} (${Math.round((count / orders.length) * 100)}%)`}
                />
              ))}
            </div>
          )}
        </Section>

        <Section title="Payment method mix">
          {paymentBreakdown.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-6">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {paymentBreakdown.map(([method, count]) => (
                <Row
                  key={method}
                  label={method}
                  value={`${formatNumber(count)} (${Math.round((count / orders.length) * 100)}%)`}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {finance && (
        <Section title="Lifetime finance summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Web sales (₭)"
              value={formatCurrency(finance.income.sellerWebSales.total)}
            />
            <MetricCard
              label="Creator commission (₭)"
              value={formatCurrency(finance.income.creatorEarnings.settledTotal)}
            />
            <MetricCard
              label="POS revenue (₭)"
              value={formatCurrency(finance.income.posRevenue)}
            />
            <MetricCard
              label="Withdrawn (₭)"
              value={formatCurrency(finance.withdrawals.totalNet)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            <MetricCard
              label="Items sold (lifetime)"
              value={formatNumber(finance.sellerActivity.itemsSold)}
            />
            <MetricCard
              label="Refunds issued (₭)"
              value={formatCurrency(finance.outgoing.refundsIssued.total)}
            />
            <MetricCard
              label="Current balance (₭)"
              value={formatCurrency(finance.income.currentBalance)}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

export default ShopDetailPage;
