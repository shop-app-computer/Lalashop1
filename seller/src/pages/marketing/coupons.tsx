import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Tag, Trash2, Edit3, Copy, Check } from "lucide-react";
import {
  fetchMyCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type SellerCoupon,
  type CouponInput,
  type CouponType,
  type CouponStatus,
} from "@/services/sellerApi";

const formatMoney = (n: number): string =>
  Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const STATUS_BADGE: Record<CouponStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-gray-100 text-gray-600",
  paused: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
};

const initialForm: CouponInput = {
  code: "",
  title: "",
  description: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  maxDiscount: 0,
  usageLimit: 0,
  perUserLimit: 1,
  scope: "shop",
  status: "draft",
};

const CouponsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<SellerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponInput>(initialForm);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyCoupons();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.kyc.verification.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((c) => c.status === "active").length;
    const totalUsed = items.reduce((s, c) => s + (c.usedCount || 0), 0);
    return { total: items.length, active, used: totalUsed };
  }, [items]);

  const statsList = [
    { label: t('pages.coupons.totalCoupons'), value: stats.total.toString() },
    { label: t('pages.coupons.active'), value: stats.active.toString(), tone: "text-emerald-700" },
    { label: t('pages.coupons.totalRedemptions'), value: stats.used.toString(), tone: "text-[#00aeff]" }
  ];

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c: SellerCoupon) => {
    setForm({
      code: c.code,
      title: c.title,
      description: c.description || "",
      type: c.type,
      value: c.value,
      minOrder: c.minOrder,
      maxDiscount: c.maxDiscount || 0,
      usageLimit: c.usageLimit,
      perUserLimit: c.perUserLimit,
      scope: c.scope,
      status: c.status,
      startsAt: c.startsAt,
      expiresAt: c.expiresAt,
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCoupon(editingId, form);
      } else {
        await createCoupon(form);
      }
      setShowForm(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.productDetail.errSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('pages.coupons.deleteConfirm'))) return;
    await deleteCoupon(id);
    await reload();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1200);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-gray-900">{t('pages.coupons.title')}</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {t('pages.coupons.subtitle')}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#00aeff] text-white px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center hover:bg-[#0096db]"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> {t('pages.coupons.newCoupon')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {statsList.map((s, idx) => (
          <Stat key={idx} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-[12px]">
          <Loader2 className="w-5 h-5 mx-auto animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Tag className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-[13px] font-bold text-gray-700">{t('pages.coupons.noCoupons')}</p>
          <p className="text-[11px] text-gray-500 mt-1">{t('pages.coupons.noCouponsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((c) => (
            <div key={c._id} className="rounded-lg border border-gray-100 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[13px] font-black bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-300">
                      {c.code}
                    </span>
                    <button
                      onClick={() => copyCode(c.code)}
                      className="text-gray-400 hover:text-[#00aeff]"
                      title={t('pages.coupons.copyCode')}
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide ${STATUS_BADGE[c.status]}`}
                    >
                      {t(`status.${c.status}`)}
                    </span>
                  </div>
                  <h3 className="text-[13px] font-bold text-gray-900 mt-1.5 truncate">{c.title}</h3>
                  {c.description && (
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded hover:bg-gray-50 text-gray-400 hover:text-[#00aeff]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="text-gray-400">{t('pages.coupons.discount')}</p>
                  <p className="font-bold text-gray-900">
                    {c.type === "percent" && `${c.value}%`}
                    {c.type === "fixed" && `${t('common.currencySymbol')}${formatMoney(c.value)}`}
                    {c.type === "freeship" && t('pages.coupons.freeship')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">{t('pages.coupons.minOrder')}</p>
                  <p className="font-bold text-gray-900">{t('common.currencySymbol')}{formatMoney(c.minOrder)}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('pages.coupons.used')}</p>
                  <p className="font-bold text-gray-900">
                    {c.usedCount}
                    {c.usageLimit > 0 && ` / ${c.usageLimit}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-gray-900">
                  {editingId ? t('pages.coupons.editCoupon') : t('pages.coupons.newCoupon')}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t('pages.coupons.code')}>
                  <input
                    required
                    className="w-full border rounded px-2 py-1.5 text-xs font-mono"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </Field>
                <Field label={t('pages.coupons.status')}>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CouponStatus })}
                  >
                    <option value="draft">{t('status.draft')}</option>
                    <option value="active">{t('status.active')}</option>
                    <option value="paused">{t('status.paused')}</option>
                    <option value="expired">{t('status.expired')}</option>
                  </select>
                </Field>
              </div>

              <Field label={t('pages.coupons.titleLabel')}>
                <input
                  required
                  className="w-full border rounded px-2 py-1.5 text-xs"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>

              <Field label={t('pages.coupons.descriptionLabel')}>
                <textarea
                  className="w-full border rounded px-2 py-1.5 text-xs"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t('pages.coupons.type')}>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                  >
                    <option value="percent">{t('pages.coupons.percent')}</option>
                    <option value="fixed">{t('pages.coupons.fixed')}</option>
                    <option value="freeship">{t('pages.coupons.freeship')}</option>
                  </select>
                </Field>
                <Field label={t('pages.coupons.value')}>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label={`${t('pages.coupons.minOrder')} (${t('common.currencySymbol')})`}>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                  />
                </Field>
                <Field label={`${t('pages.coupons.maxDiscount')} (${t('common.currencySymbol')})`}>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                  />
                </Field>
                <Field label={t('pages.coupons.usageLimitHint')}>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t('pages.coupons.startsAt')}>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.startsAt ? form.startsAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setForm({ ...form, startsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                    }
                  />
                </Field>
                <Field label={t('pages.coupons.expiresAt')}>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1.5 text-xs"
                    value={form.expiresAt ? form.expiresAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                    }
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded border text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  {t('actions.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-[#00aeff] text-white text-xs font-bold hover:bg-[#0096db] disabled:opacity-50"
                >
                  {saving ? t('pages.coupons.saving') : editingId ? t('pages.coupons.saveChanges') : t('pages.coupons.createCoupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="text-[10px] font-semibold text-gray-500 tracking-wide block mb-1">
      {label}
    </span>
    {children}
  </label>
);

const Stat: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <div className="rounded-lg border border-gray-100 px-4 py-3">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className={`text-[20px] font-bold tabular-nums mt-1 ${tone || "text-gray-900"}`}>{value}</p>
  </div>
);

export default CouponsPage;
