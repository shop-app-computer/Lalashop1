import React from 'react';
import Link from 'next/link';
import { Phone, Mail, Globe, CreditCard, Smartphone } from 'lucide-react';

type Match = 'phone' | 'email' | 'ip' | 'bank' | 'device';
type Risk = 'low' | 'medium' | 'high';

const data: { userId: number; username: string; name: string; via: Match[]; matchValue: string; firstSeen: string; risk: Risk }[] = [
  { userId: 1003, username: 'keo_v', name: 'keo viseth', via: ['ip', 'device'], matchValue: '192.168.1.45 / device-A', firstSeen: '2024-03-15', risk: 'medium' },
  { userId: 1042, username: 'noiy_l', name: 'noi lattha', via: ['bank'], matchValue: '160-12-3456', firstSeen: '2024-02-22', risk: 'high' },
  { userId: 1099, username: 'somsri_p', name: 'somsri ph.', via: ['phone'], matchValue: '020-55xxx444', firstSeen: '2023-12-10', risk: 'low' },
  { userId: 1124, username: 'bounmy_t', name: 'bounmy thip', via: ['email', 'ip'], matchValue: 'somsack.s+alt@example.com', firstSeen: '2024-01-05', risk: 'high' },
];

const matchIcon: Record<Match, typeof Phone> = {
  phone: Phone,
  email: Mail,
  ip: Globe,
  bank: CreditCard,
  device: Smartphone,
};

const riskBadge: Record<Risk, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
};

const LinkedAccountsTab = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
      <div>
        <p className="text-gray-500">linked accounts</p>
        <p className="text-base font-bold tabular-nums">{data.length}</p>
      </div>
      <div>
        <p className="text-gray-500">high risk</p>
        <p className="text-base font-bold tabular-nums text-red-700">{data.filter((d) => d.risk === 'high').length}</p>
      </div>
      <div>
        <p className="text-gray-500">shared bank</p>
        <p className="text-base font-bold tabular-nums">{data.filter((d) => d.via.includes('bank')).length}</p>
      </div>
      <div>
        <p className="text-gray-500">shared ip / device</p>
        <p className="text-base font-bold tabular-nums">{data.filter((d) => d.via.includes('ip') || d.via.includes('device')).length}</p>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-[12px] tabular-nums">
        <thead className="text-[11px] text-gray-500 tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">user</th>
            <th className="px-4 py-2 text-left font-semibold">linked via</th>
            <th className="px-4 py-2 text-left font-semibold">match value</th>
            <th className="px-4 py-2 text-left font-semibold">first seen</th>
            <th className="px-4 py-2 text-left font-semibold">risk</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l) => (
            <tr key={l.userId} className="border-t border-gray-50">
              <td className="px-4 py-2">
                <Link href={`/users/${l.userId}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                  {l.name}
                </Link>
                <div className="font-mono text-[11px] text-gray-500">@{l.username}</div>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {l.via.map((m) => {
                    const Icon = matchIcon[m];
                    return (
                      <span key={m} className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        <Icon className="w-3 h-3" /> {m}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{l.matchValue}</td>
              <td className="px-4 py-2 text-gray-500 text-[11px]">{l.firstSeen}</td>
              <td className="px-4 py-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${riskBadge[l.risk]}`}>
                  {l.risk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LinkedAccountsTab;
