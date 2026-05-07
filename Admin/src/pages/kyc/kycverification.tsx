import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  CheckCircle, XCircle, ArrowLeft, IdCard, FileText, ExternalLink,
  Shield, AlertCircle, Mail, Phone, MapPin, Briefcase, Store,
  FileImage,
} from 'lucide-react';
import {
  fetchKycSubmission,
  reviewKycSubmission,
  type AdminKycSubmission,
} from '@/services/adminApi';

const businessTypeLabels: Record<string, string> = {
  individual: 'Individual',
  sole_proprietor: 'Sole Proprietor',
  corporate: 'Corporate',
  partnership: 'Partnership',
};

const businessDocLabels: Record<string, string> = {
  individual: 'Identity Document',
  sole_proprietor: 'Business Registration Certificate',
  corporate: 'Company Business License',
  partnership: 'Partnership Agreement',
};

const idTypeLabels: Record<string, string> = {
  passport: 'Passport',
  state_id: 'National ID Card',
  national_id: 'National ID Card',
};

const isPdf = (url?: string, mime?: string): boolean => {
  if (mime && mime.toLowerCase().includes('pdf')) return true;
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
};

interface DocCardProps {
  url?: string;
  label: string;
  mimeType?: string;
}

const DocumentCard = ({ url, label, mimeType }: DocCardProps) => {
  if (!url) {
    return (
      <div className="rounded-lg bg-gray-100 aspect-[4/3] flex items-center justify-center text-[11px] text-gray-400 border border-dashed border-gray-200">
        Not provided
      </div>
    );
  }
  const pdf = isPdf(url, mimeType);
  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-gray-100 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {pdf ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center text-gray-500 hover:text-black"
          >
            <FileImage className="w-8 h-8 mb-1" />
            <span className="text-[11px] font-semibold">PDF — open</span>
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-700 truncate">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </a>
      </div>
    </div>
  );
};

const statusBadge: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

type Decision = 'approved' | 'rejected';

const formatDateTime = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const KycVerificationDetail = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';

  const [data, setData] = useState<AdminKycSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decision, setDecision] = useState<Decision>('approved');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKycSubmission(id);
      setData(res.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KYC submission');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const openDecision = (initial: Decision) => {
    setDecision(initial);
    setNote('');
    setSubmitError(null);
    setDecisionOpen(true);
  };

  const submitDecision = async () => {
    if (!data) return;
    if (!note.trim()) {
      setSubmitError('Please provide a description for the user.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await reviewKycSubmission(data._id, {
        decision,
        note: note.trim(),
      });
      if (res.data) setData(res.data);
      setDecisionOpen(false);
      setNote('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="text-sm text-gray-500">No submission ID provided.</div>
    );
  }

  if (loading && !data) {
    return <div className="text-sm text-gray-500">Loading submission…</div>;
  }

  if (error && !data) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => router.push('/kyc')}
          className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to KYC list
        </button>
        <div className="rounded-lg px-4 py-2.5 bg-red-50 text-red-700 text-[12px]">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-gray-500">Submission not found.</div>;
  }

  const idAddress = data.identity.address;
  const fullName = [data.identity.firstName, data.identity.middleName, data.identity.lastName]
    .filter((s) => s && s.trim() !== '')
    .join(' ');

  return (
    <div className="space-y-4 text-sm">
      <button
        onClick={() => router.push('/kyc')}
        className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to KYC list
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[data.status]}`}>
              {statusLabel[data.status]}
            </span>
            <span className="text-[12px] font-semibold text-gray-700">
              {data.shopInfo.shopName}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {data._id.slice(-8).toUpperCase()} · Submitted {formatDateTime(data.submittedAt || data.createdAt)}
            {data.reviewedAt && (
              <span className="ml-2 text-gray-400">
                · Reviewed {formatDateTime(data.reviewedAt)}
              </span>
            )}
          </div>
        </div>

        {data.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openDecision('rejected')}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 inline-flex items-center"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
            </button>
            <button
              onClick={() => openDecision('approved')}
              className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-green-700"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
            </button>
          </div>
        )}
      </div>

      

      {decisionOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => !submitting && setDecisionOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Review submission</h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2">DECISION</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                      decision === 'approved'
                        ? ' text-white'
                        : ' text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                      decision === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2">
                  DESCRIPTION (sent to user)
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder={
                    decision === 'approved'
                      ? 'e.g. Welcome! Your shop is now active and you can list products.'
                      : 'e.g. Please re-upload a clearer copy of your business license.'
                  }
                  className="w-full px-3 py-2 rounded-md text-[12px] border border-gray-200 focus:border-black outline-none transition-colors resize-none"
                />
              </div>

              {submitError && (
                <div className="text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded">
                  {submitError}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setDecisionOpen(false)}
                disabled={submitting}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={submitting}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold text-white disabled:opacity-50 inline-flex items-center gap-1.5 ${
                  decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? 'Submitting…' : decision === 'approved' ? 'Send approval' : 'Send rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section icon={Briefcase} title="Business Information">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Business Type" value={businessTypeLabels[data.businessType] || data.businessType} />
              <Field label=" Category" value={data.shopInfo.shopCategory || '—'} />
              <Field label="Entity Name" value={data.shopInfo.entityName || '—'} />
              <Field label="TIN Number" value={data.identity.tinNumber || '—'} mono />
            </div>
          </Section>

          <Section icon={Store} title="Shop Information">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Shop Name" value={data.shopInfo.shopName} />
              <Field label="Shop Account" value={data.shopInfo.shopAccount || '—'} mono />
              <Field
                label="Email"
                value={data.shopInfo.shopEmail || '—'}
                badge={data.shopInfo.isEmailVerified ? { label: 'Verified', tone: 'green' } : undefined}
                icon={Mail}
              />
              <Field
                label="Phone"
                value={data.shopInfo.phoneNumber || '—'}
                badge={data.shopInfo.isPhoneVerified ? { label: 'Verified', tone: 'green' } : undefined}
                icon={Phone}
              />
            </div>
          </Section>

          <Section icon={IdCard} title="Identity Verification">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ID Type" value={data.identity.idType || '—'} />
              <Field label="ID Number" value={data.identity.idNumber || '—'} mono />
              <Field label="Full Name" value={fullName || '—'} />
              <Field
                label="Account Holder"
                value={
                  data.user?.name ||
                  data.user?.username ||
                  data.user?.email ||
                  '—'
                }
              />
            </div>
          </Section>

          <Section icon={MapPin} title="Address">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Street" value={idAddress.street || '—'} />
              <Field label="Apartment" value={idAddress.apartment || '—'} />
              <Field label="City" value={idAddress.city || '—'} />
              <Field label="State" value={idAddress.state || '—'} />
              <Field label="Country" value={idAddress.country || '—'} />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 tracking-wide">WAREHOUSE ADDRESS</p>
              <p className="text-[12px] text-gray-900 mt-1">
                {data.warehouse.fullAddress || '—'}
              </p>
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          {(() => {
            const isIndividual = data.businessType === 'individual';
            const businessDocLabel =
              businessDocLabels[data.businessType] || 'Business License';
            const idDocLabel =
              idTypeLabels[data.identity.idType] || 'Identity Document';

            const businessDoc =
              data.identity.documents?.find((d) =>
                (d.label || '').toLowerCase().includes('license') ||
                (d.label || '').toLowerCase().includes('registration') ||
                (d.label || '').toLowerCase().includes('agreement')
              ) ||
              (data.identity.businessLicenseUrl
                ? { url: data.identity.businessLicenseUrl, label: businessDocLabel, mimeType: '' }
                : undefined);

            const idDoc =
              data.identity.documents?.find((d) =>
                (d.label || '').toLowerCase().includes('passport') ||
                (d.label || '').toLowerCase().includes('id card') ||
                (d.label || '').toLowerCase().includes('national id')
              ) ||
              (data.identity.idDocumentUrl
                ? { url: data.identity.idDocumentUrl, label: idDocLabel, mimeType: '' }
                : undefined);

            const knownUrls = new Set(
              [businessDoc?.url, idDoc?.url].filter(Boolean) as string[]
            );
            const additionalDocs = (data.identity.documents || []).filter(
              (d) => !knownUrls.has(d.url)
            );

            const docsSubmitted =
              Boolean(businessDoc?.url) || Boolean(idDoc?.url) || additionalDocs.length > 0;

            return (
              <>
                {!isIndividual && (
                  <Section icon={FileText} title={businessDocLabel}>
                    <DocumentCard
                      url={businessDoc?.url}
                      label={businessDoc?.label || businessDocLabel}
                      mimeType={businessDoc?.mimeType}
                    />
                  </Section>
                )}

                <Section icon={IdCard} title={idDocLabel}>
                  <DocumentCard
                    url={idDoc?.url}
                    label={idDoc?.label || idDocLabel}
                    mimeType={idDoc?.mimeType}
                  />
                </Section>

                {additionalDocs.length > 0 && (
                  <Section icon={FileImage} title="Additional Documents">
                    <div className="grid grid-cols-2 gap-3">
                      {additionalDocs.map((doc, i) => (
                        <DocumentCard
                          key={`${doc.url}-${i}`}
                          url={doc.url}
                          label={doc.label || `Document ${i + 1}`}
                          mimeType={doc.mimeType}
                        />
                      ))}
                    </div>
                  </Section>
                )}

                <Section icon={Shield} title="Verification Status">
                  <Field
                    label="Email Verified"
                    value={data.shopInfo.isEmailVerified ? 'Yes' : 'No'}
                    valueTone={data.shopInfo.isEmailVerified ? 'text-green-700' : 'text-red-600'}
                  />
                  <Field
                    label="Phone Verified"
                    value={data.shopInfo.isPhoneVerified ? 'Yes' : 'No'}
                    valueTone={data.shopInfo.isPhoneVerified ? 'text-green-700' : 'text-red-600'}
                  />
                  <Field
                    label="Documents"
                    value={docsSubmitted ? 'Submitted' : 'Missing'}
                    valueTone={docsSubmitted ? 'text-green-700' : 'text-red-600'}
                  />
                </Section>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg p-5 bg-gray-50">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <h3 className="text-[11px] font-semibold text-gray-500 tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({
  label,
  value,
  mono,
  badge,
  icon: Icon,
  valueTone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: { label: string; tone: 'green' | 'red' };
  icon?: typeof Mail;
  valueTone?: string;
}) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label.toUpperCase()}</p>
    <div className="mt-1 flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      <p className={`text-[12px] ${valueTone || 'text-gray-900'} ${mono ? 'font-mono' : ''}`}>{value}</p>
      {badge && (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
            badge.tone === 'green' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {badge.label}
        </span>
      )}
    </div>
  </div>
);

export default KycVerificationDetail;
