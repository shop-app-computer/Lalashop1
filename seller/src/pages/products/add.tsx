import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, ImagePlus, X, Plus, Trash2, ChevronDown,
  Eye, EyeOff, HelpCircle,
} from 'lucide-react';

type ProductStatus = 'Active' | 'Draft' | 'Archived';
type CommissionType = 'percent' | 'fixed';
type CreatorTier = 'all' | 'bronze' | 'silver' | 'gold';

interface TierPrice {
  id: string;
  minQty: number;
  price: string;
}

interface VariantOption {
  id: string;
  name: string;
  values: string[];
}

const CREATOR_TIERS: { value: CreatorTier; label: string }[] = [
  { value: 'all', label: 'All approved creators' },
  { value: 'bronze', label: 'Bronze and above' },
  { value: 'silver', label: 'Silver and above' },
  { value: 'gold', label: 'Gold only' },
];

const CATEGORIES = [
  'Fashion & Accessories',
  'Electronics & Gadgets',
  'Beauty & Personal Care',
  'Food & Beverages',
  'Home & Living',
  'Mother & Baby',
  'Toys & Hobbies',
  'Sports & Outdoors',
  'Automotive',
  'Health & Wellness',
  'Pet Supplies',
  'Office & Stationery',
  'Tools & Home Improvement',
  'Jewelry & Watches',
  'Digital Products',
  'mobile & computers',
  'Gaming',
  'Others'
];
const COUNTRIES = ['Laos', 'Thailand', 'England', 'China', 'Japan', 'Korea'];
const WEIGHT_UNITS = ['g', 'kg', 'lb', 'oz'];
const DIMENSION_UNITS = ['cm', 'in'];
const STATUS_OPTIONS: ProductStatus[] = ['Active', 'Draft', 'Archived'];

const SectionHeader = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="px-4 py-3 border-b border-gray-100">
    <h3 className="text-sm font-bold text-black">{title}</h3>
    {hint && <p className="text-[11px] text-gray-500 mt-0.5">{hint}</p>}
  </div>
);

const Field = ({
  label, hint, children, optional,
}: { label: string; hint?: string; children: React.ReactNode; optional?: boolean }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-semibold text-gray-700">
        {label}
        {optional && <span className="ml-1 text-gray-400 font-normal">(optional)</span>}
      </label>
      {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const inputCls =
  'w-full px-3 py-1.5 rounded-md text-xs bg-gray-50 border border-gray-100 focus:border-gray-300 focus:bg-white focus:outline-none';

const AddProduct = () => {
  // General
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProductStatus>('Draft');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Media
  const [images, setImages] = useState<string[]>([]);

  // Pricing
  const [price, setPrice] = useState('');
  const [compareAt, setCompareAt] = useState('');
  const [cost, setCost] = useState('');
  const [chargeTax, setChargeTax] = useState(true);

  // Inventory
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowOversell, setAllowOversell] = useState(false);
  const [stock, setStock] = useState('');
  const [reorderAt, setReorderAt] = useState('');

  // Wholesale
  const [moq, setMoq] = useState('');
  const [tiers, setTiers] = useState<TierPrice[]>([
    { id: 't1', minQty: 10, price: '' },
    { id: 't2', minQty: 50, price: '' },
  ]);

  // Creator affiliate
  const [allowCreators, setAllowCreators] = useState(false);
  const [commissionType, setCommissionType] = useState<CommissionType>('percent');
  const [commissionValue, setCommissionValue] = useState('');
  const [minTier, setMinTier] = useState<CreatorTier>('all');
  const [cookieDays, setCookieDays] = useState('30');

  // Variants
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);

  // Shipping
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('g');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [dimUnit, setDimUnit] = useState('cm');
  const [originCountry, setOriginCountry] = useState('Laos');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [slug, setSlug] = useState('');

  // Channels
  const [channels, setChannels] = useState({
    storefront: true,
    tiktok: true,
    facebook: false,
    instagram: false,
  });

  // Derived
  const profit = useMemo(() => {
    const p = parseFloat(price) || 0;
    const c = parseFloat(cost) || 0;
    return p - c;
  }, [price, cost]);

  const margin = useMemo(() => {
    const p = parseFloat(price) || 0;
    const c = parseFloat(cost) || 0;
    if (p <= 0) return 0;
    return ((p - c) / p) * 100;
  }, [price, cost]);

  const commissionPerSale = useMemo(() => {
    const v = parseFloat(commissionValue) || 0;
    const p = parseFloat(price) || 0;
    if (commissionType === 'percent') return (p * v) / 100;
    return v;
  }, [commissionType, commissionValue, price]);

  const sellerNet = useMemo(() => {
    const p = parseFloat(price) || 0;
    return Math.max(0, p - commissionPerSale);
  }, [price, commissionPerSale]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const addImage = () => {
    const placeholder = `https://images.unsplash.com/photo-${1548036328 + images.length}?w=200&h=200&fit=crop`;
    setImages((prev) => [...prev, placeholder]);
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const nextMin = last ? last.minQty * 2 : 10;
    setTiers((prev) => [...prev, { id: `t${Date.now()}`, minQty: nextMin, price: '' }]);
  };

  const removeTier = (id: string) => setTiers((prev) => prev.filter((t) => t.id !== id));

  const updateTier = (id: string, patch: Partial<TierPrice>) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const addVariantOption = () => {
    setVariantOptions((prev) => [
      ...prev,
      { id: `v${Date.now()}`, name: '', values: [] },
    ]);
  };

  const removeVariantOption = (id: string) =>
    setVariantOptions((prev) => prev.filter((v) => v.id !== id));

  const updateVariantOption = (id: string, patch: Partial<VariantOption>) => {
    setVariantOptions((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/products/list"
            className="mt-1 text-gray-500 hover:text-black"
            title="Back to product list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products/list"
            className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700"
          >
            Cancel
          </Link>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
            Save as draft
          </button>
          <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-900">
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* General */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader
              title="General"
              hint="Basic information shown on the storefront and in checkout."
            />
            <div className="p-4 space-y-4">
              <Field label="Title">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Linen Oversized Shirt"
                  className={inputCls}
                />
              </Field>

              <Field label="Description" optional>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe materials, fit, sizing, and why customers will love it."
                  className={`${inputCls} resize-y leading-relaxed`}
                />
                <p className="text-[10px] text-gray-400">
                  {description.length} characters · plain text supported.
                </p>
              </Field>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader
              title="Media"
              hint="Add up to 8 photos. The first image becomes the product cover."
            />
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {images.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative group aspect-square rounded-md bg-gray-50 overflow-hidden border border-gray-100"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-white">
                        Cover
                      </span>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 inline-flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < 8 && (
                  <button
                    onClick={addImage}
                    className="aspect-square rounded-md bg-gray-50 border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-100 flex flex-col items-center justify-center text-gray-500"
                  >
                    <ImagePlus className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-medium">Add image</span>
                  </button>
                )}
              </div>

              <button className="mt-3 inline-flex items-center text-[11px] font-semibold text-gray-700 hover:text-black">
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload from computer
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader title="Pricing" />
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Price">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className={`${inputCls} pl-6`}
                    />
                  </div>
                </Field>
                <Field label="Compare-at price" hint="Strike-through" optional>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      value={compareAt}
                      onChange={(e) => setCompareAt(e.target.value)}
                      placeholder="0.00"
                      className={`${inputCls} pl-6`}
                    />
                  </div>
                </Field>
                <Field label="Cost per item" hint="Internal" optional>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                      className={`${inputCls} pl-6`}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3 px-3 py-2 rounded-md bg-gray-50 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Profit</span>
                  <span className="font-semibold text-gray-900 tabular-nums">${profit.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Margin</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{margin.toFixed(1)}%</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={chargeTax}
                  onChange={(e) => setChargeTax(e.target.checked)}
                  className="rounded"
                />
                Charge VAT on this product
              </label>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader title="Inventory" />
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="SKU (Stock Keeping Unit)">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. LSO-LSH-238"
                    className={`${inputCls} font-mono`}
                  />
                </Field>
                <Field label="Barcode" hint="UPC/EAN/ISBN" optional>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="rounded"
                />
                Track quantity
              </label>

              {trackInventory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                  <Field label="Quantity on hand">
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Low stock threshold" hint="Triggers alert" optional>
                    <input
                      type="number"
                      value={reorderAt}
                      onChange={(e) => setReorderAt(e.target.value)}
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={allowOversell}
                  onChange={(e) => setAllowOversell(e.target.checked)}
                  className="rounded"
                />
                Continue selling when out of stock
              </label>
            </div>
          </div>

          {/* Wholesale */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader
              title="Wholesale pricing"
              hint="Set MOQ and tier pricing for B2B buyers."
            />
            <div className="p-4 space-y-4">
              <Field label="Minimum order quantity (MOQ)" optional>
                <input
                  type="number"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="1"
                  className={`${inputCls} max-w-[160px]`}
                />
              </Field>

              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-2">Tier pricing</p>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-gray-500 tracking-wide px-1">
                    <span className="col-span-5">Min qty</span>
                    <span className="col-span-6">Unit price</span>
                    <span className="col-span-1" />
                  </div>
                  {tiers.map((t) => (
                    <div key={t.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="number"
                        value={t.minQty}
                        onChange={(e) => updateTier(t.id, { minQty: Number(e.target.value) })}
                        className={`${inputCls} col-span-5`}
                      />
                      <div className="relative col-span-6">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          value={t.price}
                          onChange={(e) => updateTier(t.id, { price: e.target.value })}
                          placeholder="0.00"
                          className={`${inputCls} pl-6`}
                        />
                      </div>
                      <button
                        onClick={() => removeTier(t.id)}
                        className="col-span-1 text-gray-400 hover:text-red-600 inline-flex justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addTier}
                  className="mt-2 inline-flex items-center text-[11px] font-semibold text-primary hover:underline"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add tier
                </button>
              </div>
            </div>
          </div>

          {/* Creator affiliate */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader
              title="Creator affiliate program"
              hint="Let approved creators promote this product and earn a commission on each verified sale."
            />
            <div className="p-4 space-y-4">
              <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCreators}
                  onChange={(e) => setAllowCreators(e.target.checked)}
                  className="rounded mt-0.5"
                />
                <span>
                  <span className="font-semibold">Allow creators to list and promote this product</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    Creators can add this product to their feed or storefront. You only pay commission when they drive a verified sale.
                  </span>
                </span>
              </label>

              {allowCreators && (
                <div className="space-y-4 pl-6 ml-2 border-l-2 border-gray-100 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Commission type">
                      <div className="inline-flex bg-gray-100 p-0.5 rounded-md w-full">
                        <button
                          type="button"
                          onClick={() => setCommissionType('percent')}
                          className={`flex-1 px-3 py-1.5 rounded text-[11px] font-semibold transition ${commissionType === 'percent'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-600 hover:text-black'
                            }`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCommissionType('fixed')}
                          className={`flex-1 px-3 py-1.5 rounded text-[11px] font-semibold transition ${commissionType === 'fixed'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-600 hover:text-black'
                            }`}
                        >
                          Fixed ($)
                        </button>
                      </div>
                    </Field>

                    <Field
                      label={commissionType === 'percent' ? 'Commission rate' : 'Commission amount'}
                      hint={commissionType === 'percent' ? 'Of selling price' : 'Per unit sold'}
                    >
                      <div className="relative">
                        {commissionType === 'fixed' && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        )}
                        <input
                          type="number"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value)}
                          placeholder={commissionType === 'percent' ? '10' : '0.00'}
                          step={commissionType === 'percent' ? '0.5' : '0.01'}
                          min="0"
                          max={commissionType === 'percent' ? '100' : undefined}
                          className={`${inputCls} ${commissionType === 'fixed' ? 'pl-6 pr-8' : 'pr-8'}`}
                        />
                        {commissionType === 'percent' && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Minimum creator tier" hint="Restricts who can promote">
                      <div className="relative">
                        <select
                          value={minTier}
                          onChange={(e) => setMinTier(e.target.value as CreatorTier)}
                          className={`${inputCls} appearance-none pr-8`}
                        >
                          {CREATOR_TIERS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>

                    <Field label="Attribution window" hint="Days a click stays valid">
                      <div className="relative">
                        <input
                          type="number"
                          value={cookieDays}
                          onChange={(e) => setCookieDays(e.target.value)}
                          min="1"
                          max="90"
                          className={`${inputCls} pr-12`}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">days</span>
                      </div>
                    </Field>
                  </div>

                  <div className="rounded-md bg-gray-50 px-3 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Creator earns / sale</span>
                      <span className="font-semibold text-primary tabular-nums">
                        ${commissionPerSale.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Your net / sale</span>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        ${sellerNet.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Effective rate</span>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        {parseFloat(price) > 0
                          ? `${((commissionPerSale / parseFloat(price)) * 100).toFixed(1)}%`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Commissions accrue per verified sale and are paid monthly from your affiliate balance.
                    Refunds, cancellations, and chargebacks automatically reverse pending payouts.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader
              title="Variants"
              hint="Add options like size or color. Variants are generated from combinations."
            />
            <div className="p-4 space-y-3">
              {variantOptions.length === 0 ? (
                <p className="text-xs text-gray-500">
                  This product has no variants. Add one to let customers choose between options.
                </p>
              ) : (
                <div className="space-y-3">
                  {variantOptions.map((v) => (
                    <div key={v.id} className="rounded-md border border-gray-100 p-3 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-3">
                          <label className="text-[10px] font-semibold text-gray-500 tracking-wide">
                            Option name
                          </label>
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => updateVariantOption(v.id, { name: e.target.value })}
                            placeholder="Size"
                            className={`${inputCls} mt-1`}
                          />
                        </div>
                        <div className="col-span-8">
                          <label className="text-[10px] font-semibold text-gray-500 tracking-wide">
                            Values
                          </label>
                          <input
                            type="text"
                            defaultValue={v.values.join(', ')}
                            onBlur={(e) =>
                              updateVariantOption(v.id, {
                                values: e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="S, M, L, XL"
                            className={`${inputCls} mt-1`}
                          />
                        </div>
                        <button
                          onClick={() => removeVariantOption(v.id)}
                          className="col-span-1 text-gray-400 hover:text-red-600 mt-5 inline-flex justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={addVariantOption}
                className="inline-flex items-center text-[11px] font-semibold text-primary hover:underline"
              >
                <Plus className="w-3 h-3 mr-1" /> Add option
              </button>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader title="Shipping" />
            <div className="p-4 space-y-4">
              <Field label="Weight">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    className={`${inputCls} max-w-[160px]`}
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className={`${inputCls} max-w-[80px]`}
                  >
                    {WEIGHT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </Field>

              <Field label="Package dimensions" hint="L × W × H" optional>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="L"
                    className={inputCls}
                  />
                  <span className="text-gray-400">×</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="W"
                    className={inputCls}
                  />
                  <span className="text-gray-400">×</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="H"
                    className={inputCls}
                  />
                  <select
                    value={dimUnit}
                    onChange={(e) => setDimUnit(e.target.value)}
                    className={`${inputCls} max-w-[80px]`}
                  >
                    {DIMENSION_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </Field>

              <Field label="Country/region of origin" optional>
                <select
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className={inputCls}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader
              title="Search engine listing"
              hint="How this product appears in Google and social shares."
            />
            <div className="p-4 space-y-4">
              <Field label="Page title" optional>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={name || 'Premium product title'}
                  className={inputCls}
                />
                <p className="text-[10px] text-gray-400">{seoTitle.length}/70 characters</p>
              </Field>

              <Field label="Meta description" optional>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={3}
                  placeholder="Short summary that appears on search results."
                  className={`${inputCls} resize-y`}
                />
                <p className="text-[10px] text-gray-400">{seoDesc.length}/160 characters</p>
              </Field>

              <Field label="URL handle" optional>
                <div className="flex items-center">
                  <span className="px-3 py-1.5 rounded-l-md text-xs text-gray-500 font-mono bg-gray-100">
                    lalashop.com/products/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="premium-linen-shirt"
                    className={`${inputCls} rounded-l-none font-mono`}
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader title="Status" />
            <div className="p-4 space-y-3">
              <Field label="Visibility">
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </Field>
              <p className="flex items-start gap-1.5 text-[11px] text-gray-500">
                {status === 'Active' ? (
                  <><Eye className="w-3 h-3 mt-0.5 text-green-600" /> Visible on storefront after publishing.</>
                ) : status === 'Draft' ? (
                  <><EyeOff className="w-3 h-3 mt-0.5 text-gray-400" /> Hidden until you publish.</>
                ) : (
                  <><EyeOff className="w-3 h-3 mt-0.5 text-gray-400" /> Removed from all sales channels.</>
                )}
              </p>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader title="Organization" />
            <div className="p-4 space-y-4">
              <Field label="Category">
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Vendor / Brand" optional>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="Lala Premium"
                  className={inputCls}
                />
              </Field>

              <Field label="Tags" optional>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag and press Enter"
                    className={inputCls}
                  />
                  <button
                    onClick={addTag}
                    className="px-2 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700"
                      >
                        {t}
                        <button
                          onClick={() => removeTag(t)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          </div>

          {/* Sales channels */}
          <div className="rounded-lg bg-white border border-gray-100">
            <SectionHeader title="Sales channels" />
            <div className="p-4 space-y-2">
              {(
                [
                  { key: 'storefront', label: 'Online storefront' },
                  { key: 'tiktok', label: 'TikTok Shop' },
                  { key: 'facebook', label: 'Facebook Shop' },
                  { key: 'instagram', label: 'Instagram Shop' },
                ] as { key: keyof typeof channels; label: string }[]
              ).map((c) => (
                <label key={c.key} className="flex items-center justify-between text-xs text-gray-700">
                  <span>{c.label}</span>
                  <input
                    type="checkbox"
                    checked={channels[c.key]}
                    onChange={(e) =>
                      setChannels((prev) => ({ ...prev, [c.key]: e.target.checked }))
                    }
                    className="rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Need help with listings?</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Read our seller guide on writing titles and pricing for wholesale.
                </p>
                <button className="mt-2 text-[11px] font-semibold text-primary hover:underline">
                  Open seller guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <Link
          href="/products/list"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700"
        >
          Cancel
        </Link>
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
          Save as draft
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-900">
          Publish product
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
