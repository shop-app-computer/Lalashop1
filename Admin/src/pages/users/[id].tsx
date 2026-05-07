import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Pencil, X, KeyRound, Copy, Check, Store, Loader2, ArrowLeft,
  Shield, ShieldCheck, ShieldAlert, ShieldOff, User as UserIcon, Mail,
  Phone, Package, ShoppingBag, FileText, Wallet,
  ExternalLink, Ban, RefreshCw, BadgeCheck, AlertTriangle, Hash,
} from "lucide-react";
import {
  fetchUserById,
  updateUser as apiUpdateUser,
  updateUserBank as apiUpdateUserBank,
  issueSellerCredentials,
  suspendUser,
  updateUserAdminRole,
  type AdminUserDetail,
  type IssueSellerCredentialsResponse,
  type AdminRole,
} from "@/services/adminApi";

const formatNumber = (n: number): string =>
  new Intl.NumberFormat("en-US").format(n);

const formatCurrency = (n: number): string =>
  `฿${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;

const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initial = (name?: string): string =>
  (name || "?").trim().charAt(0).toUpperCase() || "?";

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
  name: user.name ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
  balance: String(user.balance ?? 0),
  password: "",
  pin: "",
  bankName: user.bank?.bankName ?? "",
  accountNumber: user.bank?.accountNumber ?? "",
  accountName: user.bank?.accountName ?? "",
});

const ROLE_LABELS: Record<AdminRole, string> = {
  super: "Super Admin",
  finance: "Finance",
  support: "Support",
  content: "Content",
};

const UserDetailsPage = () => {
  const router = useRouter();
  const idParam = router.query.id;
  const id = typeof idParam === "string" ? idParam : null;

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
  const [copiedField, setCopiedField] = useState<"email" | "password" | null>(null);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendBusy, setSuspendBusy] = useState(false);

  const [adminBusy, setAdminBusy] = useState(false);

  const reload = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUserById(id);
      setUser(res.data ?? null);
      if (!res.data) setError(res.message || "User not found");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onCopy = async (field: "email" | "password", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleIssueCredentials = async () => {
    if (!id || !user) return;
    if (
      !window.confirm(
        `Generate a new seller password for ${user.email}?\n\nThe user will be notified through their in-app inbox with the new credentials. The previous seller password (if any) will stop working.`
      )
    )
      return;
    setIssuing(true);
    setIssueError(null);
    setIssuedCreds(null);
    try {
      const res = await issueSellerCredentials(id);
      if (res.data) setIssuedCreds(res.data);
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : "Failed to issue credentials");
    } finally {
      setIssuing(false);
    }
  };

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
      if (form.name.trim() !== (user.name ?? "")) userPayload.name = form.name.trim();
      if (form.email.trim().toLowerCase() !== (user.email ?? "").toLowerCase()) {
        userPayload.email = form.email.trim();
      }
      if (form.phone.trim() !== (user.phone ?? "")) userPayload.phone = form.phone.trim();

      const balanceNum = Number(form.balance);
      if (Number.isFinite(balanceNum) && balanceNum !== (user.balance ?? 0)) {
        userPayload.balance = balanceNum;
      }
      if (form.password.length > 0) userPayload.password = form.password;
      if (form.pin.length > 0) userPayload.pin = form.pin;

      let nextUser: AdminUserDetail = user;
      if (Object.keys(userPayload).length > 0) {
        const res = await apiUpdateUser(user._id, userPayload);
        if (!res.data) throw new Error(res.message || "Failed to update user");
        nextUser = { ...user, ...res.data, bank: user.bank };
      }

      const bankFilled = form.bankName.trim() && form.accountNumber.trim() && form.accountName.trim();
      const bankChanged =
        form.bankName.trim() !== (user.bank?.bankName ?? "") ||
        form.accountNumber.trim() !== (user.bank?.accountNumber ?? "") ||
        form.accountName.trim() !== (user.bank?.accountName ?? "");

      if (bankFilled && bankChanged) {
        const bankRes = await apiUpdateUserBank(user._id, {
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          accountName: form.accountName.trim(),
        });
        if (!bankRes.data) throw new Error(bankRes.message || "Failed to update bank");
        nextUser = { ...nextUser, bank: bankRes.data };
      }

      setUser(nextUser);
      setEditOpen(false);
      setForm(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendToggle = async () => {
    if (!user || !id) return;
    const next = !user.isSuspended;
    if (next && !suspendReason.trim()) {
      alert("Please enter a reason for suspending this user.");
      return;
    }
    setSuspendBusy(true);
    try {
      await suspendUser(id, { suspended: next, reason: suspendReason.trim() });
      setSuspendOpen(false);
      setSuspendReason("");
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suspend failed");
    } finally {
      setSuspendBusy(false);
    }
  };

  const handleAdminRoleChange = async (role: AdminRole | null) => {
    if (!user) return;
    const willBeAdmin = role !== null;
    const verb = willBeAdmin
      ? `Promote ${user.email} to ${ROLE_LABELS[role!]}?`
      : `Demote ${user.email} from admin?`;
    if (!window.confirm(verb)) return;
    setAdminBusy(true);
    try {
      await updateUserAdminRole(user._id, {
        isAdmin: willBeAdmin,
        adminRole: role,
      });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setAdminBusy(false);
    }
  };

  const trustScore = useMemo(() => {
    if (!user) return 0;
    let score = 50;
    if (user.twoFactorEnabled) score += 15;
    if (user.hasPassword) score += 10;
    if (user.hasPin) score += 5;
    if (user.kyc?.status === "approved") score += 10;
    if (user.bank) score += 5;
    if (user.isSuspended) score -= 50;
    return Math.max(0, Math.min(100, score));
  }, [user]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-3">
        <Link href="/users/alluser" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to users
        </Link>
        <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  const stats = user.stats;
  const kyc = user.kyc;

  return (
    <div className="space-y-4 text-sm">
      <Link
        href="/users/alluser"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to users
      </Link>

      {/* Suspended banner */}
      {user.isSuspended && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
          <Ban className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] font-bold text-rose-900">Account suspended</p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              {user.suspendedReason || "No reason provided"} · since{" "}
              {formatDate(user.suspendedAt)}
            </p>
          </div>
          <button
            onClick={() => {
              setSuspendReason("");
              setSuspendOpen(true);
            }}
            className="px-3 py-1.5 rounded-md text-[11px] font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            Lift suspension
          </button>
        </div>
      )}

      {/* Hero header */}
      <div className="rounded-lg border border-gray-100 p-5 bg-white">
        <div className="flex items-start gap-4 flex-wrap">
          {user.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profileImage}
              alt={user.name || user.email}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00aeff] to-[#0096db] text-white text-xl font-black flex items-center justify-center flex-shrink-0">
              {initial(user.name || user.email)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-black text-gray-900 truncate">
                {user.name || user.email}
              </h1>
              {user.isAdmin && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                  {user.adminRole ? `${user.adminRole} admin` : "admin"}
                </span>
              )}
              {user.isSeller && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                  seller
                </span>
              )}
              {user.twoFactorEnabled && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 2FA
                </span>
              )}
              {kyc?.status === "approved" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" /> KYC verified
                </span>
              )}
              {kyc?.status === "pending" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                  KYC pending
                </span>
              )}
              {kyc?.status === "rejected" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-rose-100 text-rose-700">
                  KYC rejected
                </span>
              )}
              {user.isSuspended && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                  <Ban className="w-3 h-3" /> suspended
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 flex-wrap">
              {user.username && <span>@{user.username}</span>}
              {user.customId && <span className="font-mono">{user.customId}</span>}
              {user.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {user.email}
                </span>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {user.phone}
                </span>
              )}
            </div>
            {user.bio && (
              <p className="text-[12px] text-gray-600 mt-2 leading-relaxed">{user.bio}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {user.isSeller && (
              <button
                onClick={handleIssueCredentials}
                disabled={issuing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                {issuing ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
                {issuing ? "Issuing…" : "Issue seller password"}
              </button>
            )}
            {!user.isSuspended && !user.isAdmin && (
              <button
                onClick={() => {
                  setSuspendReason("");
                  setSuspendOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <Ban className="w-3 h-3" /> Suspend
              </button>
            )}
            {user.isSuspended && (
              <button
                onClick={() => {
                  setSuspendReason("");
                  setSuspendOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <RefreshCw className="w-3 h-3" /> Unsuspend
              </button>
            )}
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Issued credentials banner (after re-issue) */}
      {issueError && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{issueError}</div>
      )}
      {issuedCreds && (
        <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 space-y-3">
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
            <CredCard
              label="Email"
              value={issuedCreds.email}
              copied={copiedField === "email"}
              onCopy={() => onCopy("email", issuedCreds.email)}
            />
            <CredCard
              label="Password"
              value={issuedCreds.password}
              copied={copiedField === "password"}
              onCopy={() => onCopy("password", issuedCreds.password)}
            />
          </div>
          <a
            href={issuedCreds.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
          >
            Login URL: {issuedCreds.loginUrl} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Stat
          icon={Wallet}
          label="Web balance"
          value={formatCurrency(user.balance ?? 0)}
          tone="text-[#00aeff]"
        />
        {user.isSeller && (
          <Stat
            icon={Wallet}
            label="POS revenue"
            value={formatCurrency(user.posRevenue ?? 0)}
            tone="text-emerald-700"
            hint="Non-withdrawable"
          />
        )}
        <Stat
          icon={ShoppingBag}
          label="Orders placed"
          value={formatNumber(stats?.orderCount ?? 0)}
          hint={
            stats?.lastOrderAt
              ? `Last: ${formatCurrency(stats.lastOrderTotal)}`
              : undefined
          }
        />
        {user.isSeller && (
          <Stat
            icon={Package}
            label="Products listed"
            value={formatNumber(stats?.productCount ?? 0)}
          />
        )}
        <Stat
          icon={FileText}
          label="Posts"
          value={formatNumber(stats?.postCount ?? 0)}
        />
        <Stat
          icon={Shield}
          label="Trust score"
          value={`${trustScore}/100`}
          tone={
            trustScore >= 80
              ? "text-emerald-700"
              : trustScore >= 50
              ? "text-amber-700"
              : "text-rose-700"
          }
          hint={user.isSuspended ? "Suspended" : undefined}
        />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile / Identity */}
        <Section title="Identity" icon={UserIcon}>
          <Row label="Display name" value={user.name || "—"} />
          <Row label="Username" value={user.username ? `@${user.username}` : "—"} />
          <Row
            label="Custom ID"
            value={user.customId || "—"}
            mono
          />
          <Row label="Email" value={user.email} mono />
          <Row label="Phone" value={user.phone || "—"} />
          <Row
            label="Followers"
            value={formatNumber(user.followers?.length ?? 0)}
          />
          <Row
            label="Following"
            value={formatNumber(user.following?.length ?? 0)}
          />
          <Row label="Joined" value={formatDate(user.createdAt)} />
        </Section>

        {/* Financial */}
        <Section title="Financial" icon={Wallet}>
          <Row
            label="Web balance"
            value={`฿${formatNumber(user.balance ?? 0)}`}
            tone="text-[#00aeff] font-bold"
          />
          {user.isSeller && (
            <Row
              label="POS revenue"
              value={`฿${formatNumber(user.posRevenue ?? 0)}`}
              tone="text-emerald-700 font-bold"
            />
          )}
          <Row
            label="Pending withdrawals"
            value={formatNumber(stats?.pendingWithdrawals ?? 0)}
            tone={
              (stats?.pendingWithdrawals ?? 0) > 0
                ? "text-amber-700 font-bold"
                : ""
            }
          />
          <Row
            label="Bank"
            value={user.bank?.bankName || "Not linked"}
            tone={user.bank ? "" : "text-gray-400"}
          />
          <Row
            label="Account"
            value={user.bank?.accountNumber || "—"}
            tone={user.bank ? "" : "text-gray-400"}
            mono
          />
          <Row
            label="Holder"
            value={user.bank?.accountName || "—"}
            tone={user.bank ? "" : "text-gray-400"}
          />
          <Row
            label="Bank verified"
            value={
              user.bank?.isVerified ? (
                <span className="text-emerald-600 inline-flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" /> verified
                </span>
              ) : user.bank ? (
                <span className="text-amber-600">unverified</span>
              ) : (
                "—"
              )
            }
          />
        </Section>

        {/* Security & Activity */}
        <Section title="Security & activity" icon={Shield}>
          <Row
            label="2FA"
            value={
              user.twoFactorEnabled ? (
                <span className="text-emerald-600 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  enabled
                  {user.twoFactorType && user.twoFactorType !== "none"
                    ? ` (${user.twoFactorType})`
                    : ""}
                </span>
              ) : (
                <span className="text-gray-400 inline-flex items-center gap-1">
                  <ShieldOff className="w-3 h-3" /> disabled
                </span>
              )
            }
          />
          <Row
            label="Customer password"
            value={
              user.hasPassword ? (
                <span className="text-emerald-600 font-mono">●●●●●●●</span>
              ) : (
                <span className="text-gray-400">not set</span>
              )
            }
          />
          {user.isSeller && (
            <Row
              label="Seller password"
              value={
                user.hasSellerPassword ? (
                  <span className="text-emerald-600 font-mono">●●●●●●●</span>
                ) : (
                  <span className="text-gray-400">not issued</span>
                )
              }
            />
          )}
          <Row
            label="Withdrawal PIN"
            value={
              user.hasPin ? (
                <span className="text-emerald-600 font-mono">●●●●●●</span>
              ) : (
                <span className="text-gray-400">not set</span>
              )
            }
          />
          <Row
            label="Last known IP"
            value={user.lastKnownIp || "—"}
            mono
          />
          <Row
            label="Last update"
            value={formatDateTime(user.updatedAt)}
            mono
          />
          {(user.googleId || user.facebookId) && (
            <Row
              label="Linked accounts"
              value={
                <span className="inline-flex items-center gap-1">
                  {user.googleId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      Google
                    </span>
                  )}
                  {user.facebookId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      Facebook
                    </span>
                  )}
                </span>
              }
            />
          )}
        </Section>
      </div>

      {/* Shop / KYC info row (sellers only) */}
      {user.isSeller && (
        <Section title="Shop & KYC" icon={Store}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="space-y-2">
              <Row label="Shop name" value={user.shopName || "—"} />
              <Row label="Shop category" value={user.shopCategory || "—"} />
              <Row label="Seller type" value={user.seller_type || "—"} />
              {kyc && (
                <>
                  <Row label="KYC status" value={
                    <span className={
                      kyc.status === "approved" ? "text-emerald-600 font-bold uppercase" :
                      kyc.status === "rejected" ? "text-rose-600 font-bold uppercase" :
                      "text-amber-600 font-bold uppercase"
                    }>{kyc.status}</span>
                  } />
                  <Row label="KYC submitted" value={formatDateTime(kyc.submittedAt)} mono />
                  {kyc.reviewedAt && (
                    <Row label="KYC reviewed" value={formatDateTime(kyc.reviewedAt)} mono />
                  )}
                  {kyc.rejectionReason && (
                    <Row label="Rejection reason" value={kyc.rejectionReason} />
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-3 md:mt-0">
              <Link
                href={`/shops/${user._id}`}
                className="rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50 inline-flex items-center justify-between text-[12px] font-bold"
              >
                <span className="inline-flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-gray-400" /> Open shop profile
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href={`/products?seller=${user._id}`}
                className="rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50 inline-flex items-center justify-between text-[12px] font-bold"
              >
                <span className="inline-flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-gray-400" /> View products ({stats?.productCount ?? 0})
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href={`/orders?seller=${user._id}`}
                className="rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50 inline-flex items-center justify-between text-[12px] font-bold"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400" /> View orders
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* Admin role management */}
      <Section title="Admin role" icon={ShieldAlert}>
        {user.isAdmin ? (
          <div className="space-y-3">
            <p className="text-[12px] text-gray-700">
              Currently <strong>{ROLE_LABELS[user.adminRole || "super"]}</strong>.
              {user.adminRole !== "super" && " Change role below or demote."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {(["super", "finance", "support", "content"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleAdminRoleChange(r)}
                  disabled={adminBusy || user.adminRole === r}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold ${
                    user.adminRole === r
                      ? "bg-amber-100 text-amber-700 cursor-default"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
              <button
                onClick={() => handleAdminRoleChange(null)}
                disabled={adminBusy}
                className="ml-auto px-3 py-1.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              >
                Demote (remove admin)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] text-gray-500">
              This user is not an admin. Promote them only if you trust them with the listed scope.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {(["super", "finance", "support", "content"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleAdminRoleChange(r)}
                  disabled={adminBusy}
                  className="px-3 py-1.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                >
                  Promote to {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* System metadata */}
      <Section title="System metadata" icon={Hash}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <Row label="User ID" value={user._id} mono />
            <Row label="Custom ID" value={user.customId || "—"} mono />
            <Row label="Created" value={formatDateTime(user.createdAt)} mono />
          </div>
          <div className="space-y-2">
            <Row label="Updated" value={formatDateTime(user.updatedAt)} mono />
            <Row label="Last IP" value={user.lastKnownIp || "—"} mono />
            {user.isSuspended && (
              <Row
                label="Suspended at"
                value={formatDateTime(user.suspendedAt)}
                mono
                tone="text-rose-700"
              />
            )}
          </div>
        </div>
      </Section>

      {/* Edit modal */}
      {editOpen && form && (
        <Modal title="Edit user" onClose={closeEdit} disabled={saving}>
          <div className="space-y-4 text-[12px]">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field
              label="Balance (฿)"
              type="number"
              value={form.balance}
              onChange={(v) => setForm({ ...form, balance: v })}
            />

            <div className="border-t border-gray-100 pt-3 space-y-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                Bank account
              </p>
              <Field
                label="Bank name"
                value={form.bankName}
                onChange={(v) => setForm({ ...form, bankName: v })}
              />
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
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                Reset credentials (leave blank to keep current)
              </p>
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
                onChange={(v) => setForm({ ...form, pin: v.replace(/\D/g, "").slice(0, 6) })}
                placeholder="6 digits"
              />
            </div>

            {saveError && (
              <div className="rounded px-3 py-2 bg-red-50 text-red-700 text-[11px]">{saveError}</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
            <button
              onClick={closeEdit}
              disabled={saving}
              className="px-3 py-1.5 rounded text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded text-[11px] font-bold bg-[#00aeff] text-white hover:bg-[#0096db] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Suspend modal */}
      {suspendOpen && (
        <Modal
          title={user.isSuspended ? "Lift suspension" : "Suspend user"}
          onClose={() => setSuspendOpen(false)}
          disabled={suspendBusy}
        >
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <p>
                {user.isSuspended
                  ? "Lifting will restore login + ordering for this user."
                  : "Suspended users cannot log in or place orders. Reason is shown to support staff."}
              </p>
            </div>
            {!user.isSuspended && (
              <Field
                label="Reason"
                value={suspendReason}
                onChange={setSuspendReason}
                placeholder="e.g. Suspected fraudulent activity"
              />
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
            <button
              onClick={() => setSuspendOpen(false)}
              disabled={suspendBusy}
              className="px-3 py-1.5 rounded text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspendToggle}
              disabled={suspendBusy}
              className={`px-4 py-1.5 rounded text-[11px] font-bold text-white disabled:opacity-50 ${
                user.isSuspended
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {suspendBusy
                ? "Processing…"
                : user.isSuspended
                ? "Lift suspension"
                : "Suspend"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: typeof UserIcon;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-gray-100 bg-white">
    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <h3 className="text-[13px] font-bold text-gray-900">{title}</h3>
    </div>
    <div className="p-4 space-y-2 text-[12px]">{children}</div>
  </div>
);

interface RowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  tone?: string;
}

const Row: React.FC<RowProps> = ({ label, value, mono, tone }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 last:border-b-0">
    <span className="text-gray-500 text-[11px]">{label}</span>
    <span className={`text-right text-gray-900 break-all ${mono ? "font-mono" : ""} ${tone || ""}`}>
      {value}
    </span>
  </div>
);

interface StatProps {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: string;
  hint?: string;
}

const Stat: React.FC<StatProps> = ({ icon: Icon, label, value, tone, hint }) => (
  <div className="rounded-lg border border-gray-100 bg-white px-4 py-3">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3 h-3 text-gray-400" />
      <p className="text-[10px] font-semibold text-gray-500 tracking-wide">{label}</p>
    </div>
    <p className={`text-[20px] font-black tabular-nums mt-1 ${tone || "text-gray-900"}`}>{value}</p>
    {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

interface CredCardProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}

const CredCard: React.FC<CredCardProps> = ({ label, value, copied, onCopy }) => (
  <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
      >
        {copied ? (
          <>
            <Check size={10} /> Copied
          </>
        ) : (
          <>
            <Copy size={10} /> Copy
          </>
        )}
      </button>
    </div>
    <p className="text-[12px] font-mono text-slate-900 mt-1 break-all">{value}</p>
  </div>
);

interface ModalProps {
  title: string;
  onClose: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, disabled, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="text-[14px] font-bold">{title}</h3>
        <button
          onClick={onClose}
          disabled={disabled}
          className="text-gray-500 hover:text-black p-1 rounded disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = "text", placeholder }) => (
  <label className="block">
    <span className="block text-[11px] text-gray-500 mb-1 font-bold uppercase tracking-wide">
      {label}
    </span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded border border-gray-200 focus:border-[#00aeff] outline-none text-[12px]"
    />
  </label>
);

export default UserDetailsPage;
