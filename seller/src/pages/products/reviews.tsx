import React, { useState } from 'react';
import {
  Star, Search, Filter, ChevronDown, Download, MessageSquare, Flag, Eye,
} from 'lucide-react';

type StatusTab = 'all' | 'published' | 'pending' | 'flagged';

interface Review {
  id: number;
  user: string;
  initials: string;
  rating: number;
  date: string;
  product: string;
  sku: string;
  comment: string;
  status: 'Published' | 'Pending' | 'Flagged';
  replied: boolean;
}

const reviews: Review[] = [
  { id: 1, user: 'Lala Fan 01', initials: 'LF', rating: 5, date: 'Apr 30 · 2h', product: 'Premium Leather Bag', sku: 'LSO-BAG-001', comment: 'Quality is amazing! Better than the pictures.', status: 'Published', replied: true },
  { id: 2, user: 'John Business', initials: 'JB', rating: 4, date: 'Apr 29', product: 'Wireless Earbuds', sku: 'LSO-EAR-202', comment: 'Good value for wholesale, will order more.', status: 'Published', replied: false },
  { id: 3, user: 'Mina S.', initials: 'MS', rating: 3, date: 'Apr 27', product: 'Wall Clock', sku: 'LSO-CLK-99', comment: 'Delivery took a bit long but product is fine.', status: 'Pending', replied: false },
  { id: 4, user: 'Anonymous', initials: 'AN', rating: 1, date: 'Apr 26', product: 'Cotton T-Shirt', sku: 'LSO-TSH-01', comment: 'Item never arrived. Filing dispute. Avoid this seller.', status: 'Flagged', replied: false },
  { id: 5, user: 'Rita W.', initials: 'RW', rating: 5, date: 'Apr 24', product: 'Pour-Over Set', sku: 'LSO-MUG-22', comment: 'Beautiful packaging — repurchased twice now.', status: 'Published', replied: true },
];

const STATUS_BADGE: Record<Review['status'], string> = {
  'Published': 'bg-green-50 text-green-700',
  'Pending': 'bg-gray-100 text-gray-700',
  'Flagged': 'bg-red-50 text-red-700',
};

const TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'pending', label: 'Pending' },
  { key: 'flagged', label: 'Flagged' },
];

const StarRow = ({ rating }: { rating: number }) => (
  <div className="inline-flex items-center gap-0.5">
    {[0, 1, 2, 3, 4].map((i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 fill-gray-200'}`}
      />
    ))}
    <span className="ml-1 text-[11px] text-gray-600 tabular-nums">{rating}.0</span>
  </div>
);

const ProductReview = () => {
  const [tab, setTab] = useState<StatusTab>('all');

  const counts: Record<StatusTab, number> = {
    all: reviews.length,
    published: reviews.filter((r) => r.status === 'Published').length,
    pending: reviews.filter((r) => r.status === 'Pending').length,
    flagged: reviews.filter((r) => r.status === 'Flagged').length,
  };

  const filtered = tab === 'all'
    ? reviews
    : reviews.filter((r) =>
        tab === 'published' ? r.status === 'Published' : tab === 'pending' ? r.status === 'Pending' : r.status === 'Flagged',
      );

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const positiveRate = Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100);
  const unreplied = reviews.filter((r) => !r.replied && r.status !== 'Flagged').length;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Bulk Reply
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Average Rating</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{avgRating}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total Reviews</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">1,240</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Positive Rate</p>
          <p className="text-xl font-bold text-green-700 tabular-nums mt-1">{positiveRate}%</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Unreplied</p>
          <p className="text-xl font-bold text-orange-700 tabular-nums mt-1">{unreplied}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                tab === t.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {t.label}
              <span className="ml-1 text-[10px] text-gray-400 tabular-nums">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Rating <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Product <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Replied <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews, SKU, user…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* Reviews table */}
      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Reviewer</th>
                <th className="px-4 py-2 text-left font-semibold">Rating</th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-left font-semibold">Review</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Replied</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {filtered.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-700">
                        {r.initials}
                      </div>
                      <span className="font-medium text-gray-900">{r.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2"><StarRow rating={r.rating} /></td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-900">{r.product}</p>
                    <p className="font-mono text-[11px] text-gray-600">{r.sku}</p>
                  </td>
                  <td className="px-4 py-2 text-gray-700 max-w-md truncate">{r.comment}</td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {r.replied ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">Yes</span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Reply">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1" title="Flag">
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing 1–{filtered.length} of 1,240 reviews</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReview;
