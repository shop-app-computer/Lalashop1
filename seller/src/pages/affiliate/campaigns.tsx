import React from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";

const CampaignsPage: React.FC = () => (
  <div className="space-y-4 text-sm">
    <div>
      <h1 className="text-[16px] font-bold text-gray-900">Affiliate campaigns</h1>
      <p className="text-[12px] text-gray-500 mt-0.5">
        Coordinated affiliate pushes (e.g. seasonal launches, exclusive coupons for creators).
      </p>
    </div>

    <div className="rounded-lg bg-gray-50 px-6 py-12 text-center">
      <Megaphone className="w-7 h-7 text-gray-300 mx-auto mb-3" />
      <h2 className="text-[13px] font-semibold text-gray-700">Campaigns module coming soon</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">
        The MarketingCampaign model has not been implemented yet. For now, manage individual
        product commissions from <Link href="/affiliate/commission" className="text-[#00aeff] hover:underline font-bold">Commission</Link> and view
        creator performance in <Link href="/affiliate/creators" className="text-[#00aeff] hover:underline font-bold">Creators</Link>.
      </p>
    </div>
  </div>
);

export default CampaignsPage;
