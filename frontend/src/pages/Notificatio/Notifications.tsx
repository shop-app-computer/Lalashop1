import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Bell,
  ShieldAlert,
  CreditCard,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

type NotificationType =
  | "kyc_approved"
  | "kyc_rejected"
  | "system"
  | "security"
  | "payout"
  | "info";

interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const formatTimeAgo = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "เมื่อสักครู่";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} วันที่แล้ว`;
};

const formatFullDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const getIcon = (type: NotificationType, size = 20) => {
  switch (type) {
    case "kyc_approved":
      return <CheckCircle2 size={size} className="text-emerald-600" />;
    case "kyc_rejected":
      return <XCircle size={size} className="text-red-500" />;
    case "payout":
      return <CreditCard size={size} className="text-blue-500" />;
    case "security":
      return <ShieldAlert size={size} className="text-orange-500" />;
    case "system":
      return <Zap size={size} className="text-violet-500" />;
    default:
      return <Info size={size} className="text-slate-400" />;
  }
};

export default function SystemNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<NotificationItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/notifications");
      setNotifications(res?.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const emitUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notificationsUpdated"));
    }
  };

  const markAsRead = async (n: NotificationItem) => {
    if (n.read) return;
    try {
      await apiClient(`/notifications/${n._id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((p) => (p._id === n._id ? { ...p, read: true } : p))
      );
      emitUpdated();
    } catch {
      /* swallow — non-critical */
    }
  };

  const handleClick = async (n: NotificationItem) => {
    setActive({ ...n, read: true });
    await markAsRead(n);
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((p) => ({ ...p, read: true })));
      emitUpdated();
    } catch {
      /* swallow */
    }
  };

  const navigateLink = () => {
    if (active?.link) router.push(active.link);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all active:scale-90"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-slate-900" />
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Notifications</h1>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-[11px] font-black tracking-widest text-[#00aeff] hover:opacity-70 transition-opacity"
        >
          all read
        </button>
      </div>

      {error && (
        <div className="mx-6 my-4 px-4 py-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#00aeff] animate-spin rounded-full" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => handleClick(n)}
              className={`text-left flex items-start gap-5 p-6 md:px-10 border-b border-slate-50 hover:bg-slate-50/50 transition-all group relative ${
                !n.read ? "bg-slate-50/30" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-1">{getIcon(n.type)}</div>
              <div className="flex-1 space-y-1 relative">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-[15px] font-black ${
                      !n.read ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 bg-[#00aeff] rounded-full shadow-[0_0_8px_rgba(0,174,255,0.6)]" />
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl pb-4 line-clamp-2 whitespace-pre-wrap">
                  {n.body}
                </p>
                <div className="absolute bottom-0 right-0 bg-white/50 pl-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                    {formatTimeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-48 text-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
              <Bell size={48} strokeWidth={1.2} className="text-slate-300" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
              System is quiet
            </p>
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  {getIcon(active.type, 22)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    {active.title}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    {formatFullDate(active.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActive(null)}
                className="p-2 -mr-2 -mt-2 hover:bg-slate-50 rounded-full active:scale-90 transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 flex-1">
              <p className="text-[15px] text-slate-700 whitespace-pre-wrap leading-[1.7]">
                {active.body || "(no content)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
