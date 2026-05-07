import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Mail, ChevronDown, Send, Copy, RefreshCw, X,
  Upload, ShieldCheck, Check, Clock,
} from 'lucide-react';

type RoleId = 'super' | 'finance' | 'support' | 'content';
type InviteStatus = 'pending' | 'expired' | 'accepted';

const ROLES: { id: RoleId; name: string; description: string; permissions: string[] }[] = [
  { id: 'super', name: 'Super Admin', description: 'Full access — can manage admins, roles, and every module.', permissions: ['Manage admins', 'Manage roles', 'View audit log', 'All admin permissions'] },
  { id: 'finance', name: 'Finance Admin', description: 'Approve withdrawals, payouts, refunds and financial reports.', permissions: ['Approve withdrawals', 'Process payouts', 'View financial reports', 'Refund orders'] },
  { id: 'support', name: 'Support Admin', description: 'Customer support, KYC review, basic account operations.', permissions: ['View users', 'Reset passwords', 'Reply tickets', 'View orders', 'Verify KYC'] },
  { id: 'content', name: 'Content Admin', description: 'Manage posts, banners, notifications, and marketing content.', permissions: ['Manage posts', 'Manage banners', 'Send notifications', 'Edit categories'] },
];


const mockPending: { id: string; email: string; roleId: RoleId; invitedBy: string; sentAt: string; expiresAt: string; status: InviteStatus }[] = [
  { id: 'INV-2026-0421', email: 'viphone@lala.shop', roleId: 'support', invitedBy: 'admin_alex', sentAt: '2026-04-28 10:15', expiresAt: '2026-05-05 10:15', status: 'pending' },
  { id: 'INV-2026-0420', email: 'mali.t@lala.shop', roleId: 'content', invitedBy: 'admin_alex', sentAt: '2026-04-22 14:00', expiresAt: '2026-04-29 14:00', status: 'expired' },
  { id: 'INV-2026-0419', email: 'kham@lala.shop', roleId: 'finance', invitedBy: 'admin_keo', sentAt: '2026-04-20 09:00', expiresAt: '2026-04-27 09:00', status: 'accepted' },
];

const statusBadge: Record<InviteStatus, string> = {
  pending: 'bg-orange-50 text-orange-700',
  expired: 'bg-gray-100 text-gray-500',
  accepted: 'bg-green-50 text-green-700',
};

const statusLabel: Record<InviteStatus, string> = {
  pending: 'Pending',
  expired: 'Expired',
  accepted: 'Accepted',
};

const InviteAdminPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState<RoleId>('support');
  const [message, setMessage] = useState('');
  const [expiry, setExpiry] = useState(7);
  const [require2FA, setRequire2FA] = useState(true);

  const [roleOpen, setRoleOpen] = useState(false);
  const [expiryOpen, setExpiryOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
      if (expiryRef.current && !expiryRef.current.contains(e.target as Node)) setExpiryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRole = ROLES.find((r) => r.id === roleId)!;

  return (
    <div className="space-y-4 text-sm">
      <Link
        href="/admins"
        className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to admins
      </Link>

      <div>
        <p className="text-[12px] text-gray-500 mt-1">Send an email invitation. The invitee will set their own password and 2FA upon accepting.</p>
      </div>

      {/* Form + Role preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2 rounded-lg border border-gray-100 p-5 space-y-4">
          {/* Email */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@lala.shop"
                className="w-full pl-8 pr-3 py-2 rounded-md text-[12px] bg-gray-50 border border-gray-100 focus:border-primary outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">An invite email will be sent to this address.</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Full Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="e.g. Mali Thongdy"
              className="w-full mt-1 px-3 py-2 rounded-md text-[12px] bg-gray-50 border border-gray-100 focus:border-primary outline-none"
            />
          </div>

          {/* Role + Expiry side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Role dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Role</label>
              <div className="relative mt-1" ref={roleRef}>
                <button
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md text-[12px] font-medium bg-gray-50 border border-gray-100 hover:border-primary text-gray-900"
                >
                  <span>{selectedRole.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
                </button>
                {roleOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-md shadow-md py-1 z-10">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { setRoleId(r.id); setRoleOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                          roleId === r.id
                            ? 'bg-gray-50 text-black font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                        }`}
                      >
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{r.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

           
          </div>

          {/* Message */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Personal Message <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Add a note that will be included in the invite email..."
              className="w-full mt-1 px-3 py-2 rounded-md text-[12px] bg-gray-50 border border-gray-100 focus:border-primary outline-none resize-none"
            />
          </div>

          {/* 2FA toggle */}
          <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={require2FA}
              onChange={(e) => setRequire2FA(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Require Two-Factor Authentication on first login</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button className="inline-flex items-center text-[12px] text-gray-500 hover:text-black font-medium">
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Bulk invite via CSV
            </button>
            <div className="flex items-center gap-2">
              <Link
                href="/admins"
                className="px-4 py-2 rounded-md text-[12px] font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Link>
              <button
                disabled={!email}
                className="bg-black text-white px-4 py-2 rounded-md text-[12px] font-semibold inline-flex items-center hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Send Invitation
              </button>
            </div>
          </div>
        </div>

        {/* Role preview side card */}
        <div className="rounded-lg border border-gray-100 p-5 space-y-3 h-fit">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-[12px] font-bold text-black">{selectedRole.name}</h3>
          </div>
          <p className="text-[11px] text-gray-500">{selectedRole.description}</p>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5">PERMISSIONS</p>
            <ul className="space-y-1">
              {selectedRole.permissions.map((p) => (
                <li key={p} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <Check className="w-3 h-3 text-green-600" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100">
            <Link href="/admins/roles" className="text-[11px] text-primary hover:underline">
              View full role matrix →
            </Link>
          </div>
        </div>
      </div>

      {/* Pending invitations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-bold text-black">Pending Invitations</h2>
          <span className="text-[11px] text-gray-500">{mockPending.filter((p) => p.status === 'pending').length} active</span>
        </div>

        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Invite ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Email</th>
                  <th className="px-4 py-2 text-left font-semibold">Role</th>
                  <th className="px-4 py-2 text-left font-semibold">Invited By</th>
                  <th className="px-4 py-2 text-left font-semibold">Sent At</th>
                  <th className="px-4 py-2 text-left font-semibold">Expires At</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPending.map((p) => {
                  const role = ROLES.find((r) => r.id === p.roleId)!;
                  return (
                    <tr key={p.id} className="border-t border-gray-50">
                      <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{p.id}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{p.email}</td>
                      <td className="px-4 py-2 text-gray-700">{role.name}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-gray-500">@{p.invitedBy}</td>
                      <td className="px-4 py-2 text-gray-500 text-[11px]">{p.sentAt}</td>
                      <td className="px-4 py-2 text-gray-500 text-[11px]">{p.expiresAt}</td>
                      <td className="px-4 py-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge[p.status]}`}>
                          {statusLabel[p.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button title="Copy invite link" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Resend"
                            disabled={p.status === 'accepted'}
                            className="text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Cancel"
                            disabled={p.status !== 'pending'}
                            className="text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteAdminPage;
