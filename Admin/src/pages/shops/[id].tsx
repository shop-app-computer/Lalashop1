import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  fetchUserById,
  fetchShopKycByUserId,
  type AdminUserDetail,
  type AdminKycSubmission,
} from '@/services/adminApi';

type Tab = 'overview' | 'products' | 'orders' | 'reviews' | 'violations' | 'analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'reviews', label: 'Reviews' },
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
    `${kyc?.identity?.firstName ?? ''} ${kyc?.identity?.lastName ?? ''}`.trim() ||
    user.name ||
    '—';
  const category = kyc?.shopInfo?.shopCategory || user.seller_type || '';
  const businessType = kyc?.businessType || '—';
  const followers = user.followers?.length ?? 0;
  const following = user.following?.length ?? 0;

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
              <Row
                label="Full Name"
                value={ownerName}
              />
              <Row
                label="Shop Email"
                value={kyc?.shopInfo?.shopEmail || '—'}
              />
              <Row label="Phone" value={user.phone || '—'} />
              <Row label="Created" value={formatDate(user.createdAt)} />
              <Row label="Verified" value={formatDate(kyc?.reviewedAt)} />
              <Row label="IP" value={user.lastKnownIp || '—'} />
              <Row
                label="Shop Category"
                value={kyc?.shopInfo?.shopCategory || '—'}
              />
              <Row label="Business Type" value={businessType} />
              <Row label="Seller Type" value={user.seller_type || '—'} />
              <Row
                label="Entity Name"
                value={kyc?.shopInfo?.entityName || '—'}
              />
              <Row
                label="TIN Number"
                value={kyc?.identity?.tinNumber || '—'}
              />
            </Section>

            
            {user.bank ? (
              <Section title="Bank">
                <Row label="Bank Name" value={user.bank.bankName} />
                <Row label="Account Name" value={user.bank.accountName} />
                <Row label="Account Number" value={user.bank.accountNumber} />
                
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
            <Section title="Performance — Last 30 Days">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard label="Gross Sales" value="—" />
                <MetricCard label="Orders" value="—" />
                <MetricCard label="Avg Order Value" value="—" />
                <MetricCard label="Response Rate" value="—" />
              </div>
            </Section>

            <Section title="Lifetime Totals">
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Total Products" value="—" />
                <MetricCard label="Total Orders" value="—" />
                <MetricCard
                  label="Total Sales (₭)"
                  value="—"
                />
              </div>
            </Section>

            <Section title="Balance & Payout">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Current Balance (₭)"
                  value={formatNumber(user.balance ?? 0)}
                />
                <MetricCard label="Pending Payout (₭)" value="—" />
              </div>
            </Section>

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
                  
                </>
              )}
            </Section>
          </div>
        </div>
      )}

      {tab !== 'overview' && (
        <div className="rounded-lg py-12 text-center text-gray-400 text-[12px]">
          {tab.charAt(0).toUpperCase() + tab.slice(1)} tab — coming soon
        </div>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="rounded-lg p-5 bg-white border border-gray-100">
    <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide mb-4 uppercase">
      {title}
    </h3>
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

export default ShopDetailPage;
