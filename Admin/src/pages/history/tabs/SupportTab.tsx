import React from 'react';
import { LifeBuoy } from 'lucide-react';

const SupportTab = () => (
  <div className="py-12 text-center px-4">
    <LifeBuoy className="w-6 h-6 text-gray-300 mx-auto mb-2" />
    <p className="text-[13px] text-gray-500 font-medium">No support tickets yet</p>
    <p className="text-[11px] text-gray-400 mt-1">
      Support ticket model not yet implemented in backend — coming soon
    </p>
  </div>
);

export default SupportTab;
