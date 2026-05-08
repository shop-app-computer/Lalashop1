import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ShieldCheck, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, Lock, User,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface InvitePreview {
  email: string;
  name?: string;
  role: "super" | "finance" | "support" | "content";
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
}

interface PreviewResponse {
  success: boolean;
  data?: InvitePreview;
  message?: string;
}

const ROLE_LABELS: Record<InvitePreview["role"], string> = {
  super: "Super Admin",
  finance: "Finance Admin",
  support: "Support Admin",
  content: "Content Admin",
};

const ROLE_DESC: Record<InvitePreview["role"], string> = {
  super: "Full access to every admin section.",
  finance: "Withdrawals, refunds, settlements, and payout decisions.",
  support: "Tickets, reports, and customer assistance.",
  content: "Products, categories, posts, and storefront moderation.",
};

const AcceptInvitePage: React.FC = () => {
  const router = useRouter();
  const tokenRaw = router.query.token;
  const token = typeof tokenRaw === "string" ? tokenRaw : null;

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = (await apiClient(`/admin-invite/preview/${token}`)) as PreviewResponse;
        if (cancelled) return;
        if (!res?.success || !res.data) {
          setError(res?.message || "Invite not found");
          return;
        }
        setPreview(res.data);
        if (res.data.name) setName(res.data.name);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load invite");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    if (!token) return;

    setSubmitting(true);
    try {
      const res = (await apiClient(`/admin-invite/accept/${token}`, {
        method: "POST",
        body: JSON.stringify({ password, name: name.trim() || undefined }),
      })) as { success?: boolean; message?: string };
      if (!res?.success) {
        throw new Error(res?.message || "Failed to accept invite");
      }
      setDone(true);
      // Auto-redirect after a short pause so they see the success state.
      setTimeout(() => {
        void router.replace("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <p className="text-xs text-gray-500">Loading invitation…</p>
        </div>
      </Shell>
    );
  }

  if (error && !preview) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
          <div>
            <p className="text-sm font-bold text-gray-900">This invite isn&apos;t valid</p>
            <p className="text-[12px] text-gray-500 mt-1">{error}</p>
          </div>
          <Link href="/login" className="text-xs text-[#00aeff] font-bold hover:underline mt-2">
            Return to login
          </Link>
        </div>
      </Shell>
    );
  }

  if (!preview) return null;

  if (preview.status !== "pending") {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-gray-900">
              This invite is {preview.status}
            </p>
            <p className="text-[12px] text-gray-500 mt-1">
              {preview.status === "accepted" && "You can sign in directly."}
              {preview.status === "expired" &&
                "Ask your admin to send a new invite — this one is past its expiration date."}
              {preview.status === "revoked" &&
                "This invite was revoked. Contact your admin for a new one."}
            </p>
          </div>
          <Link href="/login" className="text-xs text-[#00aeff] font-bold hover:underline mt-2">
            Go to login
          </Link>
        </div>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center gap-3 py-8">
          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          <div>
            <p className="text-sm font-bold text-gray-900">Account activated</p>
            <p className="text-[12px] text-gray-500 mt-1">
              Redirecting you to login…
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <div className="rounded-md bg-blue-50 px-3 py-3 text-[12px] text-blue-800 space-y-1">
          <p>
            You&apos;ve been invited to join the Lalashop admin team as{" "}
            <strong>{ROLE_LABELS[preview.role]}</strong>.
          </p>
          <p className="text-[11px] text-blue-700/80">{ROLE_DESC[preview.role]}</p>
        </div>

        <div className="rounded-md border border-gray-100 px-3 py-2.5 text-[12px]">
          <p className="text-[10px] font-bold text-gray-500 tracking-wide">
            Your email
          </p>
          <p className="text-gray-900 font-mono">{preview.email}</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</div>
        )}

        <form onSubmit={handleAccept} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-gray-700">Display name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 outline-none rounded-md pl-9 pr-3 py-2 text-sm"
                placeholder="What should we call you?"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 outline-none rounded-md pl-9 pr-9 py-2 text-sm"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700">Confirm password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type={showPwd ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 outline-none rounded-md pl-9 pr-3 py-2 text-sm"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#00aeff] text-white py-2.5 rounded-md text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-[#0096db] disabled:opacity-50 mt-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {submitting ? "Activating…" : "Activate admin account"}
          </button>
        </form>
      </div>
    </Shell>
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-[#00aeff]/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[#00aeff]" />
        </div>
        <h1 className="text-[16px] font-black text-gray-900">Admin invitation</h1>
      </div>
      {children}
    </div>
  </div>
);

export default AcceptInvitePage;
