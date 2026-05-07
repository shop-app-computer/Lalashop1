import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';

export type ShopStatus = 'active' | 'closed' | 'pending' | 'suspended';

export type Shop = {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category: string;
  products: number;
  sales: string;
  status: ShopStatus;
  createdAt: string;
};

export const SHOP_MOCK: Shop[] = [
  { id: 'SHOP-1001', name: 'Lala Fashion', owner: 'Somsack Souvanna', email: 'lala@fashion.la', phone: '020-5555-5555', category: 'Fashion', products: 145, sales: '12,400,000', status: 'active', createdAt: '2024-04-22' },
  { id: 'SHOP-1002', name: 'Tech Gadgets', owner: 'Keo Viseth', email: 'tech@gadgets.la', phone: '020-2222-3333', category: 'Electronics', products: 89, sales: '8,200,000', status: 'active', createdAt: '2024-03-15' },
  { id: 'SHOP-1003', name: 'Home Decor Plus', owner: 'Phonexay Silavong', email: 'home@decor.la', phone: '020-7777-3333', category: 'Home', products: 256, sales: '5,400,000', status: 'active', createdAt: '2024-02-10' },
  { id: 'SHOP-1004', name: 'Beauty Studio', owner: 'Mali Thongdy', email: 'beauty@studio.la', phone: '020-9999-8888', category: 'Beauty', products: 78, sales: '3,200,000', status: 'pending', createdAt: '2026-04-25' },
  { id: 'SHOP-1005', name: 'Coffee Roastery', owner: 'Bounmy Inthavong', email: 'coffee@roast.la', phone: '020-9999-1111', category: 'Food', products: 24, sales: '890,000', status: 'pending', createdAt: '2026-04-28' },
  { id: 'SHOP-1006', name: 'Old Books Co', owner: 'Anousone K.', email: 'books@old.la', phone: '020-1111-2222', category: 'Books', products: 0, sales: '0', status: 'closed', createdAt: '2024-01-08' },
  { id: 'SHOP-1007', name: 'Gym Supplements', owner: 'Viphone S.', email: 'gym@supp.la', phone: '020-3333-4444', category: 'Health', products: 45, sales: '2,100,000', status: 'suspended', createdAt: '2024-05-20' },
];

const statusBadge: Record<ShopStatus, string> = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-orange-50 text-orange-700',
  closed: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-50 text-red-700',
};

interface ShopTableProps {
  initialFilter?: 'all' | ShopStatus;
  hideFilters?: boolean;
}

const ShopTable = ({ initialFilter = 'all', hideFilters = false }: ShopTableProps) => {
  const [filter, setFilter] = useState<'all' | ShopStatus>(initialFilter);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(
    () =>
      SHOP_MOCK.filter(
        (s) =>
          (filter === 'all' || s.status === filter) &&
          (!q ||
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.owner.toLowerCase().includes(q.toLowerCase()) ||
            s.id.toLowerCase().includes(q.toLowerCase()))
      ),
    [filter, q]
  );

  const tabs: ('all' | ShopStatus)[] = ['all', 'active', 'pending', 'closed', 'suspended'];

  return (
    <>
      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        {!hideFilters && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold capitalize bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[100px] justify-between"
            >
              <span>{filter}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-md shadow-md py-1 z-10 min-w-[120px]">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilter(t); setOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                      filter === t
                        ? 'bg-gray-50 text-black'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search shop name, owner, ID..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Shop ID</th>
                <th className="px-4 py-2 text-left font-semibold">Shop</th>
                <th className="px-4 py-2 text-left font-semibold">Owner</th>
                <th className="px-4 py-2 text-left font-semibold">Category</th>
                <th className="px-4 py-2 text-right font-semibold">Products</th>
                <th className="px-4 py-2 text-right font-semibold">Sales (₭)</th>
                <th className="px-4 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{s.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    <Link href={`/shops/${s.id}`} className="hover:text-primary transition-colors">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{s.owner}</td>
                  <td className="px-4 py-2 text-gray-700">{s.category}</td>
                  <td className="px-4 py-2 text-right text-gray-900">{s.products}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{s.sales}</td>
                  <td className="px-4 py-2 text-gray-500 text-[11px]">{s.createdAt}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${statusBadge[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-[12px]">
                    No shops match your filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing {filtered.length} of {SHOP_MOCK.length} shops</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopTable;
