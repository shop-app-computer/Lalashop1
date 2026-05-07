import React, { useState } from 'react';
import { Plus, Search, Edit, ArrowUpDown } from 'lucide-react';

const Categories = () => {
  const [q, setQ] = useState('');

  const categories = [
    { id: 'CAT-01', name: 'Electronics', slug: 'electronics', count: 450, status: 'active' },
    { id: 'CAT-02', name: 'Fashion & Clothing', slug: 'fashion', count: 1280, status: 'active' },
    { id: 'CAT-03', name: 'Home Appliances', slug: 'home', count: 320, status: 'active' },
    { id: 'CAT-04', name: 'Beauty & Health', slug: 'beauty', count: 156, status: 'disabled' },
  ];

  const filtered = categories.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" /> Reorder
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Category
        </button>
      </div>

      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search category..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Category Name</th>
                <th className="px-4 py-2 text-left font-semibold">URL Slug</th>
                <th className="px-4 py-2 text-right font-semibold">Products</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{c.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">/{c.slug}</td>
                  <td className="px-4 py-2 text-right text-gray-900">{c.count.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                      c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
