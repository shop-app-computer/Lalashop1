import React from 'react';
import { MoreVertical, AlertCircle } from 'lucide-react';

const reports = [
  { id: 1, title: 'Inappropriate content report', reportedBy: '@user_xyz', status: 'Pending Review', time: '2 hours ago' },
  { id: 2, title: 'Suspected fake listing', reportedBy: '@buyer_42', status: 'Pending Review', time: '5 hours ago' },
  { id: 3, title: 'Abusive seller behavior', reportedBy: '@somsack_s', status: 'Pending Review', time: '1 day ago' },
  { id: 4, title: 'Counterfeit product report', reportedBy: '@anousone', status: 'Pending Review', time: '2 days ago' },
];

const ReportsTab = () => (
  <div className="divide-y divide-gray-100">
    {reports.map((r) => (
      <div
        key={r.id}
        className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
          <div>
            <div className="text-[13px] font-medium text-gray-900">{r.title}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Reported by {r.reportedBy} · Status: {r.status} · {r.time}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100">
            View
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100">
            Take Action
          </button>
          <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default ReportsTab;
