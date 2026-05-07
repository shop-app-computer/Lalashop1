import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check } from 'lucide-react';

const ROLES = [
  {
    id: 'super',
    name: 'Super Admin',
    description: 'Full access — can manage admins, roles, and every module.',
    permissions: ['Manage admins', 'Manage roles', 'View audit log', 'All admin permissions'],
  },
  {
    id: 'finance',
    name: 'Finance Admin',
    description: 'Approve withdrawals, payouts, refunds and financial reports.',
    permissions: ['Approve withdrawals', 'Process payouts', 'View financial reports', 'Refund orders'],
  },
  {
    id: 'support',
    name: 'Support Admin',
    description: 'Customer support, KYC review, basic account operations.',
    permissions: ['View users', 'Reset passwords', 'Reply tickets', 'View orders', 'Verify KYC'],
  },
  {
    id: 'content',
    name: 'Content Admin',
    description: 'Manage posts, banners, notifications, and marketing content.',
    permissions: ['Manage posts', 'Manage banners', 'Send notifications', 'Edit categories'],
  },
];

const RolesPage = () => (
  <div className="space-y-4 text-sm">
    <div className="flex items-center gap-2">
      <Link
        href="/admins"
        className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100"
      >
        ← Back to admins
      </Link>
    </div>

    <div className="rounded-lg bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
      Note: granular role/permission system is not yet enforced in the backend. Currently any
      user with <span className="font-mono">isAdmin: true</span> has full access. The roles below
      are a planned design.
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ROLES.map((r) => (
        <div key={r.id} className="rounded-lg border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-[13px] font-bold text-black">{r.name}</h3>
          </div>
          <p className="text-[12px] text-gray-600">{r.description}</p>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5">PERMISSIONS</p>
            <ul className="space-y-1">
              {r.permissions.map((p) => (
                <li key={p} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <Check className="w-3 h-3 text-green-600" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RolesPage;
