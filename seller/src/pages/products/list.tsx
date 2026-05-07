import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, ChevronDown, Edit, Trash2, ExternalLink, Copy, Download, Upload,
} from 'lucide-react';

type StatusKey = 'all' | 'active' | 'low' | 'out';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  moq: number;
  stock: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  category: string;
  image: string;
}

const products: Product[] = [
  { id: 1, name: 'Premium Leather Bag', sku: 'LSO-BAG-001', price: '$45.00 – $120.00', moq: 10, stock: 450, status: 'Active', category: 'Fashion', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop' },
  { id: 2, name: 'Wireless Bluetooth Earbuds', sku: 'LSO-EAR-202', price: '$12.00 – $25.00', moq: 50, stock: 1200, status: 'Active', category: 'Electronics', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop' },
  { id: 3, name: 'Minimalist Wall Clock', sku: 'LSO-CLK-99', price: '$8.50 – $15.00', moq: 20, stock: 5, status: 'Low Stock', category: 'Home Decor', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=100&h=100&fit=crop' },
  { id: 4, name: 'Organic Cotton T-Shirt', sku: 'LSO-TSH-01', price: '$3.50 – $7.00', moq: 100, stock: 0, status: 'Out of Stock', category: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
];

const STATUS_BADGE: Record<Product['status'], string> = {
  'Active': 'bg-green-50 text-green-700',
  'Low Stock': 'bg-orange-50 text-orange-700',
  'Out of Stock': 'bg-red-50 text-red-700',
};

const STATUS_TABS: { key: StatusKey; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: 124 },
  { key: 'active', label: 'Active', count: 110 },
  { key: 'low', label: 'Low Stock', count: 8 },
  { key: 'out', label: 'Out of Stock', count: 6 },
];

const ProductList = () => {
  const [statusTab, setStatusTab] = useState<StatusKey>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
        </button>
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </button>
        <Link
          href="/products/add"
          className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Product
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">All Products</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">124</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Active</p>
          <p className="text-xl font-bold text-green-700 tabular-nums mt-1">110</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Low Stock</p>
          <p className="text-xl font-bold text-orange-700 tabular-nums mt-1">8</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Out of Stock</p>
          <p className="text-xl font-bold text-red-700 tabular-nums mt-1">6</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusTab(t.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                statusTab === t.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {t.label}
              <span className="ml-1 text-[10px] text-gray-400 tabular-nums">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Category <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Stock <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Price <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU, name, ID…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* Table panel */}
      <div className="rounded-lg overflow-hidden">
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 text-[11px]">
            <span className="font-semibold text-gray-900 tabular-nums">{selected.size} selected</span>
            <span className="text-gray-300">·</span>
            <button className="font-medium text-gray-700 hover:text-black">Edit</button>
            <button className="font-medium text-gray-700 hover:text-black">Duplicate</button>
            <button className="font-medium text-gray-700 hover:text-black">Export</button>
            <button className="font-medium text-red-600 hover:text-red-700">Delete</button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-gray-500 hover:text-black">Clear</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === products.length && products.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-left font-semibold">Category</th>
                <th className="px-4 py-2 text-left font-semibold">Wholesale</th>
                <th className="px-4 py-2 text-left font-semibold">Stock</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {products.map((p) => {
                const stockPct = Math.min(100, (p.stock / 500) * 100);
                const fillColor =
                  p.stock === 0 ? 'bg-red-500' : p.stock < 20 ? 'bg-orange-500' : 'bg-green-500';
                return (
                  <tr key={p.id} className="">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="font-mono text-[11px] text-gray-600">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{p.category}</td>
                    <td className="px-4 py-2">
                      <p className="font-semibold text-gray-900">{p.price}</p>
                      <p className="text-[11px] text-gray-500">MOQ {p.moq}</p>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-semibold text-gray-900">{p.stock.toLocaleString()}</p>
                      <div className="w-24 h-1 bg-gray-100 rounded mt-1 overflow-hidden">
                        <div className={`h-full ${fillColor}`} style={{ width: `${stockPct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Duplicate">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="View on storefront">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing 1–4 of 124 products</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
