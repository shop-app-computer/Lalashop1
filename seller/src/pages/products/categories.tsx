import React, { useState } from 'react';
import {
  Plus, Search, Filter, ChevronDown, ChevronRight, Edit, Trash2, ArrowUpDown, Download,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  parent: string | null;
  products: number;
  status: 'Active' | 'Inactive';
  depth: number;
}

const categories: Category[] = [
  { id: 1, name: 'Fashion & Apparel', parent: null, products: 45, status: 'Active', depth: 0 },
  { id: 11, name: 'Womenswear', parent: 'Fashion & Apparel', products: 28, status: 'Active', depth: 1 },
  { id: 12, name: 'Menswear', parent: 'Fashion & Apparel', products: 17, status: 'Active', depth: 1 },
  { id: 2, name: 'Electronics', parent: null, products: 32, status: 'Active', depth: 0 },
  { id: 21, name: 'Audio', parent: 'Electronics', products: 14, status: 'Active', depth: 1 },
  { id: 22, name: 'Wearables', parent: 'Electronics', products: 9, status: 'Active', depth: 1 },
  { id: 3, name: 'Home & Living', parent: null, products: 18, status: 'Active', depth: 0 },
  { id: 4, name: 'Beauty & Health', parent: null, products: 24, status: 'Inactive', depth: 0 },
];

const STATUS_BADGE: Record<Category['status'], string> = {
  'Active': 'bg-green-50 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-700',
};

const Categories = () => {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const selected = categories.find((c) => c.id === selectedId) ?? null;

  const totalProducts = categories.reduce((s, c) => s + (c.depth === 0 ? c.products : 0), 0);
  const activeCount = categories.filter((c) => c.status === 'Active').length;
  const rootCount = categories.filter((c) => c.depth === 0).length;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" /> Reorder
        </button>
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Category
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Categories</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{categories.length}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Root</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{rootCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Active</p>
          <p className="text-xl font-bold text-green-700 tabular-nums mt-1">{activeCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Products mapped</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{totalProducts}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Status <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Depth <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tree table */}
        <div className="lg:col-span-2 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Category</th>
                  <th className="px-4 py-2 text-left font-semibold">Parent</th>
                  <th className="px-4 py-2 text-right font-semibold">Products</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="">
                {categories.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={` cursor-pointer ${selectedId === c.id ? '' : ''}`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center" style={{ paddingLeft: `${c.depth * 16}px` }}>
                        {c.depth > 0 ? (
                          <ChevronRight className="w-3 h-3 text-gray-400 mr-1" />
                        ) : (
                          <span className="w-3 h-3 mr-1" />
                        )}
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{c.parent ?? '—'}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{c.products}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Reorder">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
            <span>Showing {categories.length} categories</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
              <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
            </div>
          </div>
        </div>

        {/* Detail / edit panel */}
        <div className="rounded-lg">
          <div className="px-4 py-3">
            <h3 className="text-sm font-bold text-black">Category detail</h3>
            {selected && <p className="text-[11px] text-gray-500 mt-0.5">Editing: {selected.name}</p>}
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Name</label>
              <input
                type="text"
                defaultValue={selected?.name ?? ''}
                className="mt-1 w-full rounded px-2 py-1.5 text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Parent</label>
              <select
                defaultValue={selected?.parent ?? ''}
                className="mt-1 w-full rounded px-2 py-1.5 text-[12px]"
              >
                <option value="">— None (root) —</option>
                {categories
                  .filter((c) => c.depth === 0)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Status</label>
              <select
                defaultValue={selected?.status ?? 'Active'}
                className="mt-1 w-full rounded px-2 py-1.5 text-[12px]"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
                Save changes
              </button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
