import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Pencil, X, KeyRound, Copy, Check, Store, Loader2 } from 'lucide-react';
import {
  fetchUserById,
  updateUser as apiUpdateUser,
  updateUserBank as apiUpdateUserBank,
  issueSellerCredentials,
  type AdminUserDetail,
  type IssueSellerCredentialsResponse,
} from '@/services/adminApi';

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


interface EditFormState {
  name: string;
  email: string;
  phone: string;
  balance: string;
  password: string;
  pin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const buildInitialForm = (user: AdminUserDetail): EditFormState => ({
  name: user.name ?? '',
  email: user.email ?? '',
  phone: user.phone ?? '',
  balance: String(user.balance ?? 0),
  password: '',
  pin: '',
  bankName: user.bank?.bankName ?? '',
  accountNumber: user.bank?.accountNumber ?? '',
  accountName: user.bank?.accountName ?? '',
});

const UserDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [issuing, setIssuing] = useState(false);
  const [issuedCreds, setIssuedCreds] = useState<IssueSellerCredentialsResponse | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  const handleIssueCredentials = async () => {
    if (typeof id !== 'string' || !user) return;
    const ok = window.confirm(
      `Generate a new seller password for ${user.email}?\n\nThe user will be notified through their in-app inbox with the new credentials. The previous seller password (if any) will stop working.`
    );
    if (!ok) return;
    setIssuing(true);
    setIssueError(null);
    setIssuedCreds(null);
    try {
      const res = await issueSellerCredentials(id);
      if (res.data) setIssuedCreds(res.data);
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : 'Failed to issue credentials');
    } finally {
      setIssuing(false);
    }
  };

  const onCopy = async (field: 'email' | 'password', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (typeof id !== 'string' || !id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchUserById(id)
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setUser(res.data);
        } else {
          setError(res.message || 'User not found');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load user');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const openEdit = () => {
    if (!user) return;
    setForm(buildInitialForm(user));
    setSaveError(null);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditOpen(false);
    setForm(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!user || !form) return;
    setSaving(true);
    setSaveError(null);
    try {
      const userPayload: Record<string, unknown> = {};
      if (form.name.trim() !== (user.name ?? '')) userPayload.name = form.name.trim();
      if (form.email.trim().toLowerCase() !== (user.email ?? '').toLowerCase()) {
        userPayload.email = form.email.trim();
      }
      if (form.phone.trim() !== (user.phone ?? '')) userPayload.phone = form.phone.trim();

      const balanceNum = Number(form.balance);
      if (Number.isFinite(balanceNum) && balanceNum !== (user.balance ?? 0)) {
        userPayload.balance = balanceNum;
      }
      if (form.password.length > 0) userPayload.password = form.password;
      if (form.pin.length > 0) userPayload.pin = form.pin;

      let nextUser: AdminUserDetail = user;
      if (Object.keys(userPayload).length > 0) {
        const res = await apiUpdateUser(user._id, userPayload);
        if (!res.data) throw new Error(res.message || 'Failed to update user');
        nextUser = { ...user, ...res.data, bank: user.bank };
      }

      const bankFilled = form.bankName.trim() && form.accountNumber.trim() && form.accountName.trim();
      const bankChanged =
        form.bankName.trim() !== (user.bank?.bankName ?? '') ||
        form.accountNumber.trim() !== (user.bank?.accountNumber ?? '') ||
        form.accountName.trim() !== (user.bank?.accountName ?? '');

      if (bankFilled && bankChanged) {
        const bankRes = await apiUpdateUserBank(user._id, {
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          accountName: form.accountName.trim(),
        });
        if (!bankRes.data) throw new Error(bankRes.message || 'Failed to update bank');
        nextUser = { ...nextUser, bank: bankRes.data };
      }

      setUser(nextUser);
      setEditOpen(false);
      setForm(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-gray-400 text-[12px]">
        Loading user…
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="rounded-lg px-4 py-3 bg-red-50 text-red-700 text-[12px]">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-black font-sans lowercase">
      <div className="w-full min-h-screen px-2 sm:px-4 md:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-end mb-2 gap-2">
          {user.isSeller && (
            <button
              onClick={handleIssueCredentials}
              disabled={issuing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              title="Generate a new seller password and notify the user"
            >
              {issuing ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
              {issuing ? 'Issuing...' : 'Issue seller credentials'}
            </button>
          )}
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold bg-white text-black"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        {issueError && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {issueError}
          </div>
        )}

        {issuedCreds && (
          <div className="mb-4 rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[12px] font-black text-emerald-900 tracking-wide uppercase">
                Seller credentials issued
              </h3>
            </div>
            <p className="text-[11px] text-emerald-800">
              The user will see these credentials in their in-app notifications. You can also copy
              them here to send out-of-band — the system stores only a hashed copy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
                  <button
                    onClick={() => onCopy('email', issuedCreds.email)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    {copiedField === 'email' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <p className="text-[12px] font-mono text-slate-900 mt-1 break-all">{issuedCreds.email}</p>
              </div>
              <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</span>
                  <button
                    onClick={() => onCopy('password', issuedCreds.password)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    {copiedField === 'password' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <p className="text-[12px] font-mono text-slate-900 mt-1 tracking-wider">{issuedCreds.password}</p>
              </div>
            </div>
            <a
              href={issuedCreds.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-700 hover:underline font-medium"
            >
              Login URL: {issuedCreds.loginUrl} →
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">User Data</h2>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">name</span>
                  <span className="font-medium">{user.name || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">username</span>
                  <span className="font-medium">{user.username || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">email</span>
                  <span className="font-medium normal-case">{user.email}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">phone</span>
                  <span className="font-medium">{user.phone || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">followers</span>
                  <span className="font-medium">{formatNumber(user.followers?.length ?? 0)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">following</span>
                  <span className="font-medium">{formatNumber(user.following?.length ?? 0)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Financial Info</h2>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">bank</span>
                  <span className={user.bank ? 'font-medium' : 'font-medium text-gray-400'}>
                    {user.bank?.bankName || 'not linked'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">account</span>
                  <span className={user.bank ? 'font-mono' : 'font-mono text-gray-400'}>
                    {user.bank?.accountNumber || '—'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Name</span>
                  <span className={user.bank ? 'font-medium' : 'font-medium text-gray-400'}>
                    {user.bank?.accountName || '—'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2 mt-4 pt-2">
                  <span className="text-gray-500 font-bold">balance</span>
                  <span className="text-[14px] font-bold tracking-tight text-blue-600">
                    {formatNumber(user.balance ?? 0)} ₭
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Security & Status</h2>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">2fa</span>
                  <span className="font-medium">
                    {user.twoFactorEnabled ? (
                      <span className="text-green-500">
                        enabled{user.twoFactorType ? ` (${user.twoFactorType})` : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400">disabled</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">password</span>
                  <span className="font-mono">
                    {user.hasPassword
                      ? <span className="text-green-500">●●●●●●● </span>
                      : <span className="text-gray-400">not set</span>}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">pin</span>
                  <span className="font-mono">
                    {user.hasPin
                      ? <span className="text-green-500">●●●●●● </span>
                      : <span className="text-gray-400">not set</span>}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">System Activity</h2>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">registration</span>
                  <span className="font-mono text-gray-600">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">last update</span>
                  <span className="font-mono text-gray-600">{formatDateTime(user.updatedAt)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">user id</span>
                  <span className="font-mono text-gray-600 text-[11px]">{user._id}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {editOpen && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 normal-case">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-[14px] font-semibold">Edit user</h3>
              <button
                onClick={closeEdit}
                disabled={saving}
                className="text-gray-500 hover:text-black p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 text-[12px]">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field
                label="Balance (₭)"
                type="number"
                value={form.balance}
                onChange={(v) => setForm({ ...form, balance: v })}
              />

              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Bank account
                </div>
                <Field label="Bank name" value={form.bankName} onChange={(v) => setForm({ ...form, bankName: v })} />
                <Field
                  label="Account number"
                  value={form.accountNumber}
                  onChange={(v) => setForm({ ...form, accountNumber: v })}
                />
                <Field
                  label="Account name (holder)"
                  value={form.accountName}
                  onChange={(v) => setForm({ ...form, accountName: v })}
                />
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Reset credentials (leave blank to keep current)
                </div>
                <Field
                  label="New password"
                  type="password"
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  placeholder="min 6 characters"
                />
                <Field
                  label="New PIN (6 digits)"
                  type="password"
                  value={form.pin}
                  onChange={(v) => setForm({ ...form, pin: v.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="6 digits"
                />
              </div>

              {saveError && (
                <div className="rounded px-3 py-2 bg-red-50 text-red-700 text-[11px]">{saveError}</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button
                onClick={closeEdit}
                disabled={saving}
                className="px-3 py-1.5 rounded text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 rounded text-[11px] font-semibold bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

const Field = ({ label, value, onChange, type = 'text', placeholder }: FieldProps) => (
  <label className="block">
    <span className="block text-[11px] text-gray-500 mb-1">{label}</span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 rounded border border-gray-200 focus:border-black outline-none text-[12px]"
    />
  </label>
);

export default UserDetailsPage;
