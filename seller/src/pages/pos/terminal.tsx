import React, { useMemo, useState } from 'react';
import {
  Search, Plus, Minus, Trash2, User, Percent, CreditCard, Banknote,
  QrCode, Pause, Receipt, X, ScanLine, ChevronDown,
} from 'lucide-react';

type CategoryKey = 'all' | 'fashion' | 'electronics' | 'home' | 'beauty' | 'food';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: Exclude<CategoryKey, 'all'>;
  stock: number;
  emoji: string;
}

interface CartLine {
  productId: string;
  qty: number;
}

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'home', label: 'Home' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'food', label: 'Food' },
];

const products: Product[] = [
  { id: 'p-001', sku: 'LSH-238-LA', name: 'Linen Oversized Shirt', price: 45.0, category: 'fashion', stock: 24, emoji: '👕' },
  { id: 'p-002', sku: 'CTT-118-IV', name: 'Cotton Tote — Ivory', price: 28.0, category: 'fashion', stock: 60, emoji: '👜' },
  { id: 'p-003', sku: 'WLT-512-OK', name: 'Wide-Leg Linen Trouser', price: 60.0, category: 'fashion', stock: 18, emoji: '👖' },
  { id: 'p-004', sku: 'KNT-901-CR', name: 'Cropped Knit Cardigan', price: 78.0, category: 'fashion', stock: 12, emoji: '🧥' },
  { id: 'p-005', sku: 'LSO-EAR-202', name: 'Wireless Earbuds', price: 25.0, category: 'electronics', stock: 130, emoji: '🎧' },
  { id: 'p-006', sku: 'SMW-512-OK', name: 'Smart Watch Pro', price: 199.0, category: 'electronics', stock: 8, emoji: '⌚' },
  { id: 'p-007', sku: 'CHG-410-WH', name: 'Fast Charger 30W', price: 19.0, category: 'electronics', stock: 200, emoji: '🔌' },
  { id: 'p-008', sku: 'CPO-044-WH', name: 'Ceramic Pour-Over Set', price: 64.0, category: 'home', stock: 15, emoji: '☕' },
  { id: 'p-009', sku: 'CDL-708-BG', name: 'Soy Wax Candle', price: 18.0, category: 'home', stock: 42, emoji: '🕯️' },
  { id: 'p-010', sku: 'BAM-009-NT', name: 'Bamboo Toothbrush', price: 4.5, category: 'beauty', stock: 300, emoji: '🪥' },
  { id: 'p-011', sku: 'SKN-220-PK', name: 'Hydrating Face Serum', price: 32.0, category: 'beauty', stock: 27, emoji: '🧴' },
  { id: 'p-012', sku: 'COF-099-DR', name: 'Dark Roast Beans 250g', price: 12.0, category: 'food', stock: 88, emoji: '🫘' },
];

const TAX_RATE = 0.07;

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Terminal = () => {
  const [category, setCategory] = useState<CategoryKey>('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([
    { productId: 'p-001', qty: 1 },
    { productId: 'p-005', qty: 2 },
  ]);
  const [discountPct, setDiscountPct] = useState(0);
  const [customer, setCustomer] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (query && !`${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [category, query]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), []);

  const lines = cart
    .map((line) => {
      const product = productMap.get(line.productId);
      if (!product) return null;
      return { product, qty: line.qty, lineTotal: product.price * line.qty };
    })
    .filter((l): l is { product: Product; qty: number; lineTotal: number } => l !== null);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const discountAmount = subtotal * (discountPct / 100);
  const taxable = subtotal - discountAmount;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { productId, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((l) => (l.productId === productId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0);
    });
  };

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPct(0);
    setCustomer(null);
  };

  return (
    <div className="space-y-3 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-gray-700 font-semibold">Register #02</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">Cashier: Mali T.</span>
        </div>
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Pause className="w-3.5 h-3.5 mr-1.5" /> Hold sale
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Product browser */}
        <div className="lg:col-span-3 space-y-3">
          <div className="rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search product or SKU…"
                  className="w-full pl-8 pr-3 py-2 rounded-md text-xs bg-gray-50"
                />
              </div>
              <button className="px-3 py-2 rounded-md text-xs font-semibold text-gray-700 bg-gray-100 inline-flex items-center hover:bg-gray-200">
                <ScanLine className="w-3.5 h-3.5 mr-1.5" /> Scan
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                    category === c.key
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p.id)}
                disabled={p.stock === 0}
                className="rounded-lg p-3 text-left bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100 transition"
              >
                <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center text-3xl mb-2">
                  {p.emoji}
                </div>
                <p className="text-[11px] font-mono text-gray-400">{p.sku}</p>
                <p className="text-xs font-semibold text-gray-900 line-clamp-2 mt-0.5">{p.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-sm font-bold text-black tabular-nums">{fmt(p.price)}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      p.stock < 10 ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.stock} left
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-gray-400">
                No products match your search.
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white border border-gray-100 flex flex-col h-full">
            {/* Customer */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              
              <button
                onClick={() => setCustomer(customer ? null : 'Somsak J.')}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                {customer ? 'Change' : 'Assign'}
              </button>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-4 py-2 max-h-[420px]">
              {lines.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-400">
                  Cart is empty. Tap a product to add.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {lines.map((l) => (
                    <li key={l.product.id} className="py-2.5 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-md bg-gray-50 flex items-center justify-center text-lg">
                        {l.product.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {l.product.name}
                        </p>
                        <p className="text-[11px] text-gray-500 tabular-nums">
                          {fmt(l.product.price)} ea
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(l.product.id, -1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {l.qty}
                        </span>
                        <button
                          onClick={() => updateQty(l.product.id, 1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="w-16 text-right text-xs font-bold tabular-nums">
                        {fmt(l.lineTotal)}
                      </span>
                      <button
                        onClick={() => removeLine(l.product.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Totals */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Percent className="w-3 h-3 text-gray-400" />
                  <span>Discount</span>
                  <select
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    className="text-[11px] bg-gray-50 rounded px-1.5 py-0.5"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={15}>15%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
                <span className="tabular-nums text-red-600">
                  {discountAmount > 0 ? `−${fmt(discountAmount)}` : fmt(0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Percent className="w-3 h-3 text-gray-400" />
                  <span>Discount</span>
                  <select
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    className="text-[11px] bg-gray-50 rounded px-1.5 py-0.5"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={15}>15%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
                <span className="tabular-nums text-red-600">
                  {discountAmount > 0 ? `−${fmt(discountAmount)}` : fmt(0)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (7%)</span>
                <span className="tabular-nums">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-gray-100">
                <span className="text-sm font-bold text-black">Total</span>
                <span className="text-base font-bold text-black tabular-nums">{fmt(total)}</span>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="px-4 pb-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={lines.length === 0}
                  className="flex flex-col items-center py-2.5 rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Banknote className="w-4 h-4 mb-1" />
                  Cash
                </button>
                <button
                  disabled={lines.length === 0}
                  className="flex flex-col items-center py-2.5 rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  Card
                </button>
                <button
                  disabled={lines.length === 0}
                  className="flex flex-col items-center py-2.5 rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  QR Pay
                </button>
              </div>
              <button
                disabled={lines.length === 0}
                className="w-full bg-black text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-900 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Charge {fmt(total)}
              </button>
              {lines.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full py-1.5 text-[11px] font-medium text-gray-500 hover:text-red-600 inline-flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
