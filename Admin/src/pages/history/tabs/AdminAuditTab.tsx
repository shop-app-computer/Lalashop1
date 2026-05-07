import React from 'react';
import { ShieldCheck } from 'lucide-react';

const AdminAuditTab = () => (
  <div className="py-12 text-center px-4">
    <ShieldCheck className="w-6 h-6 text-gray-300 mx-auto mb-2" />
    <p className="text-[13px] text-gray-500 font-medium">Admin audit log not available yet</p>
    <p className="text-[11px] text-gray-400 mt-1">
      Admin action audit model not yet implemented in backend — every admin action will be tracked here once live
    </p>
  </div>
);

export default AdminAuditTab;
