import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

const ConversionPage: React.FC = () => (
  <div className="space-y-4 text-sm">
    <div>
      <h1 className="text-[16px] font-bold text-gray-900">Conversion</h1>
      <p className="text-[12px] text-gray-500 mt-0.5">
        Funnel from product views → cart → checkout. Requires view-tracking which is not yet wired.
      </p>
    </div>
    <div className="rounded-lg bg-gray-50 px-6 py-12 text-center">
      <TrendingUp className="w-7 h-7 text-gray-300 mx-auto mb-3" />
      <h2 className="text-[13px] font-semibold text-gray-700">Conversion tracking coming soon</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">
        Once product page views are tracked we can compute view→cart→buy conversion. For now,
        check the{" "}
        <Link href="/affiliate/performance" className="text-[#00aeff] hover:underline font-bold">
          affiliate performance
        </Link>{" "}
        page for click-to-order conversion via creator links.
      </p>
    </div>
  </div>
);

export default ConversionPage;
