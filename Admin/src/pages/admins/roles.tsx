import React, { useState } from 'react';
import { Plus, ShieldCheck, Check } from 'lucide-react';

const PERMISSIONS = [
  { key: 'users.view', label: 'View Users' },
  { key: 'users.edit', label: 'Edit Users' },
  { key: 'users.suspend', label: 'Suspend Users' },
  { key: 'shops.approve', label: 'Approve Shops' },
  { key: 'shops.close', label: 'Close Shops' },
  { key: 'products.moderate', label: 'Moderate Products' },
  { key: 'orders.view', label: 'View Orders' },
  { key: 'orders.refund', label: 'Process Refunds' },
  { key: 'finance.view', label: 'View Finance' },
  { key: 'finance.payout', label: 'Process Payouts' },
  { key: 'kyc.review', label: 'Review KYC' },
  { key: 'content.moderate', label: 'Moderate Content' },
  { key: 'admin.manage', label: 'Manage Admins' },
  { key: 'system.settings', label: 'Edit System Settings' },
];

type Role = {
  key: string;
  name: string;
  description: string;
  count: number;
  permissions: string[];
};

const ROLES: Role[] = [
  { key: 'super_admin', name: 'Super Admin', description: 'Full access to all modules and configuration', count: 1, permissions: PERMISSIONS.map((p) => p.key) },
  { key: 'finance_admin', name: 'Finance Admin', description: 'Controls payouts, refunds, transactions', count: 2, permissions: ['users.view', 'orders.view', 'orders.refund', 'finance.view', 'finance.payout'] },
  { key: 'support_admin', name: 'Support Admin', description: 'Handles user support and disputes', count: 4, permissions: ['users.view', 'users.edit', 'orders.view', 'kyc.review'] },
  { key: 'content_admin', name: 'Content Admin', description: 'Moderates posts, products, and reports', count: 2, permissions: ['products.moderate', 'content.moderate'] },
];

const RolesPage = () => {
  const [active, setActive] = useState<string>(ROLES[0].key);
  const role = ROLES.find((r) => r.key === active)!;

  return (
    <div className="space-y-4 text-sm">
      <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
        <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Role
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Roles list */}
        <div className="space-y-2">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => setActive(r.key)}
              className={`w-full text-left rounded-lg p-4 transition-colors ${
                active === r.key ? 'bg-primary-soft' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${active === r.key ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`text-[13px] font-bold ${active === r.key ? 'text-primary' : 'text-gray-900'}`}>
                  {r.name}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{r.description}</p>
              <p className="text-[11px] text-gray-400 mt-2 tabular-nums">
                {r.count} {r.count === 1 ? 'member' : 'members'}
              </p>
            </button>
          ))}
        </div>

        {/* Permissions matrix */}
        <div className="lg:col-span-2 rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-black">{role.name}</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">{role.description}</p>
            </div>
            <div className="text-[11px] text-gray-500 font-semibold tracking-wide tabular-nums">
              {role.permissions.length} / {PERMISSIONS.length} PERMISSIONS
            </div>
          </div>

          <div className="rounded-lg overflow-hidden bg-gray-50">
            {PERMISSIONS.map((p, i) => {
              const has = role.permissions.includes(p.key);
              return (
                <div
                  key={p.key}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i !== PERMISSIONS.length - 1 ? 'border-b border-gray-100' : ''
                  } bg-white`}
                >
                  <div>
                    <p className="text-[12px] font-medium text-gray-900">{p.label}</p>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{p.key}</p>
                  </div>
                  <button
                    className={`w-9 h-5 rounded-full relative transition-colors ${has ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all flex items-center justify-center ${
                        has ? 'left-4' : 'left-0.5'
                      }`}
                    >
                      {has && <Check className="w-2.5 h-2.5 text-green-500" />}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-900">
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
