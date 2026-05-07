import React from "react";
import { BarChart3 } from "lucide-react";

const TrafficPage: React.FC = () => (
  <div className="space-y-4 text-sm">
    <div>
      <h1 className="text-[16px] font-bold text-gray-900">Traffic</h1>
      <p className="text-[12px] text-gray-500 mt-0.5">
        Visitor sources, page views, and engagement metrics for your shop and product pages.
      </p>
    </div>
    <div className="rounded-lg bg-gray-50 px-6 py-12 text-center">
      <BarChart3 className="w-7 h-7 text-gray-300 mx-auto mb-3" />
      <h2 className="text-[13px] font-semibold text-gray-700">Traffic analytics coming soon</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">
        Page-view tracking is not implemented yet. Once added, this page will show traffic sources,
        unique visitors, and bounce rate across your shop pages.
      </p>
    </div>
  </div>
);

export default TrafficPage;
