import React, { useState } from 'react';
import { ShieldCheck, Key, Smartphone, Mail, Save, User, Activity } from 'lucide-react';

type Tab = 'profile' | 'security' | 'sessions';

const ProfilePage = () => {
  const [tab, setTab] = useState<Tab>('profile');
  const [me] = useState({
    id: 'ADM-0001',
    fullName: 'Admin Alex',
    email: 'alex@lala.shop',
    phone: '020-5555-5555',
    role: 'Super Admin',
    twoFactor: true,
    lastLogin: '2026-04-30 09:12',
    createdAt: '2024-01-15',
  });

  const sessions = [
    { id: 'sess-01', device: 'Chrome / Windows 11', ip: '192.168.1.45', location: 'Vientiane, LA', last: '2 mins ago', current: true },
    { id: 'sess-02', device: 'Safari / iPhone 15', ip: '49.230.x.x', location: 'Vientiane, LA', last: '3 hours ago', current: false },
    { id: 'sess-03', device: 'Firefox / macOS', ip: '171.5.x.x', location: 'Bangkok, TH', last: '2 days ago', current: false },
  ];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex border-b border-gray-100 text-[12px]">
        {([
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security', icon: ShieldCheck },
          { id: 'sessions', label: 'Sessions', icon: Activity },
        ] as { id: Tab; label: string; icon: typeof User }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Admin ID" value={me.id} readOnly />
            <Field label="Role" value={me.role} readOnly />
            <Field label="Full Name" value={me.fullName} />
            <Field label="Email" value={me.email} />
            <Field label="Phone" value={me.phone} />
            <Field label="Member Since" value={me.createdAt} readOnly />
          </div>

          <button className="mt-6 bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="max-w-2xl space-y-3">
          <SecurityRow icon={Key} title="Password" description="Change your admin password" actionLabel="Change" />
          <SecurityRow
            icon={Smartphone}
            title="Two-Factor Authentication"
            description={me.twoFactor ? 'Enabled — Authenticator app' : 'Disabled'}
            actionLabel={me.twoFactor ? 'Manage' : 'Enable'}
            highlight={me.twoFactor}
          />
          <SecurityRow icon={Mail} title="Recovery Email" description="alex.recovery@lala.shop" actionLabel="Update" />
          <SecurityRow icon={ShieldCheck} title="Backup Codes" description="10 codes available" actionLabel="Regenerate" />
        </div>
      )}

      {tab === 'sessions' && (
        <>
          <div className="rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] tabular-nums">
                <thead className="text-[11px] text-gray-500 tracking-wide">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Device</th>
                    <th className="px-4 py-2 text-left font-semibold">IP</th>
                    <th className="px-4 py-2 text-left font-semibold">Location</th>
                    <th className="px-4 py-2 text-left font-semibold">Last Active</th>
                    <th className="px-4 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {s.device}
                        {s.current && (
                          <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{s.ip}</td>
                      <td className="px-4 py-2 text-gray-700">{s.location}</td>
                      <td className="px-4 py-2 text-gray-500">{s.last}</td>
                      <td className="px-4 py-2 text-right">
                        {!s.current && (
                          <button className="text-[12px] text-red-600 hover:text-red-700 font-medium">Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100">
            Revoke All Other Sessions
          </button>
        </>
      )}
    </div>
  );
};

const Field = ({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) => (
  <label className="block">
    <span className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</span>
    <input
      defaultValue={value}
      readOnly={readOnly}
      className={`w-full mt-1 py-2 px-3 rounded-md outline-none text-[12px] ${
        readOnly
          ? 'bg-gray-100 text-gray-500'
          : 'bg-gray-50 border border-gray-100 focus:border-primary text-gray-900'
      } transition-colors`}
    />
  </label>
);

const SecurityRow = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  highlight,
}: {
  icon: typeof Key;
  title: string;
  description: string;
  actionLabel: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-5 py-4">
    <div className="flex items-center gap-4">
      <Icon className={`w-4 h-4 ${highlight ? 'text-green-600' : 'text-gray-400'}`} />
      <div>
        <div className="font-semibold text-gray-900 text-[13px]">{title}</div>
        <div className="text-gray-500 text-[12px] mt-0.5">{description}</div>
      </div>
    </div>
    <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-100">
      {actionLabel}
    </button>
  </div>
);

export default ProfilePage;
