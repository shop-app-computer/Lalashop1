import React from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

const items = [
  { id: 1, title: 'Flash Sale Update', message: "Don't miss out on today's exclusive wholesale deals", audience: 'All Users', timestamp: '2024-04-20 14:30', status: 'delivered' },
  { id: 2, title: 'New Feature Announcement', message: 'POS terminal is now available for sellers', audience: 'Sellers Only', timestamp: '2024-04-19 10:15', status: 'delivered' },
  { id: 3, title: 'Maintenance Notice', message: 'Platform will be down for maintenance on Sunday', audience: 'All Users', timestamp: '2024-04-18 18:42', status: 'delivered' },
];

const HistoryTab = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-[12px] tabular-nums">
      <thead className="text-[11px] text-gray-500 tracking-wide">
        <tr>
          <th className="px-4 py-2 text-left font-semibold">Title / Content</th>
          <th className="px-4 py-2 text-left font-semibold">Audience</th>
          <th className="px-4 py-2 text-left font-semibold">Sent</th>
          <th className="px-4 py-2 text-left font-semibold">Status</th>
          <th className="px-4 py-2 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id}>
            <td className="px-4 py-2">
              <div className="font-medium text-gray-900">{i.title}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-md">{i.message}</div>
            </td>
            <td className="px-4 py-2 text-gray-700">{i.audience}</td>
            <td className="px-4 py-2 text-gray-500 text-[11px]">{i.timestamp}</td>
            <td className="px-4 py-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3" /> Delivered
              </span>
            </td>
            <td className="px-4 py-2 text-right">
              <button className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default HistoryTab;
