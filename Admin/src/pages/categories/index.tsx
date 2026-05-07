import React, { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { fetchAdminProducts } from '@/services/adminApi';

interface CategoryRow {
  name: string;
  slug: string;
  count: number;
}

const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const CategoriesPage = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Pull a large slice of products so we can derive every category that exists in the DB.
    fetchAdminProducts({ limit: 200 })
      .then((res) => {
        if (cancelled) return;
        const counts = new Map<string, number>();
        for (const p of res.data ?? []) {
          if (!p.category) continue;
          counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
        }
        const list: CategoryRow[] = Array.from(counts.entries())
          .map(([name, count]) => ({ name, slug: slugify(name), count }))
          .sort((a, b) => b.count - a.count);
        setItems(list);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = items.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Category
        </button>
        <span className="text-[11px] text-gray-400">
          (Categories are derived from existing product entries — formal CRUD coming soon)
        </span>
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
                <th className="px-4 py-2 text-left font-semibold">Category Name</th>
                <th className="px-4 py-2 text-left font-semibold">Slug</th>
                <th className="px-4 py-2 text-right font-semibold">Products</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-gray-400 text-[12px]">Loading...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-red-500 text-[12px]">{error}</td></tr>
              )}
              {!loading && !error && filtered.map((c) => (
                <tr key={c.slug || c.name}>
                  <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500">/{c.slug}</td>
                  <td className="px-4 py-2 text-right text-gray-900">{c.count.toLocaleString()}</td>
                </tr>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-gray-400 text-[12px]">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
