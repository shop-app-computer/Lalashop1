import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const AdminAuditPage = () => (
  <div className="space-y-4 text-sm">
    <div className="flex items-center gap-2">
      <Link
        href="/admins"
        className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100"
      >
        ← Back to admins
      </Link>
    </div>

    <div className="rounded-lg bg-gray-50 px-6 py-12 text-center">
      <ShieldCheck className="w-7 h-7 text-gray-300 mx-auto mb-3" />
      <h2 className="text-[13px] font-semibold text-gray-700">Admin audit log not yet recorded</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">
        Admin action audit model is not yet implemented in the backend. Once added, every
        approve/reject/edit by an admin will be tracked here with before/after values, IP, and timestamp.
      </p>
      <p className="text-[11px] text-gray-400 mt-3">
        Until then, see the <Link href="/history/history" className="text-primary hover:underline">History page</Link> for system-level audit data.
      </p>
    </div>
  </div>
);

export default AdminAuditPage;
