import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type SignalStatus = 'open' | 'reviewed' | 'dismissed';

const data: { id: string; signal: string; description: string; severity: Severity; detected: string; status: SignalStatus }[] = [
  { id: 'R-001', signal: 'unmatched deposit', description: 'deposit of 2,000,000 ₭ from BCEL 999-22-1111 — holder name does not match user', severity: 'critical', detected: '2024-04-19 21:08', status: 'open' },
  { id: 'R-002', signal: 'multi-country login', description: 'login from TH 6h after login from LA — geo-anomaly', severity: 'high', detected: '2024-04-23 09:00', status: 'open' },
  { id: 'R-003', signal: 'rapid bank change', description: 'primary bank changed 2 times in 7 days', severity: 'medium', detected: '2024-04-22 09:30', status: 'reviewed' },
  { id: 'R-004', signal: 'high velocity', description: '5 deposits in 24h totalling 7,250,000 ₭', severity: 'medium', detected: '2024-04-23 12:30', status: 'reviewed' },
  { id: 'R-005', signal: 'large withdrawal after deposit', description: 'withdraw 8,500,000 ₭ within 48h of large deposit (round-tripping pattern)', severity: 'high', detected: '2024-04-05 09:11', status: 'dismissed' },
  { id: 'R-006', signal: 'shared bank with high-risk linked account', description: 'bank account 160-12-3456 also belongs to user @noiy_l (high risk)', severity: 'high', detected: '2024-04-22 09:00', status: 'open' },
  { id: 'R-007', signal: 'failed login attempts', description: '2 consecutive failed logins from 192.168.1.45', severity: 'low', detected: '2024-04-22 22:31', status: 'reviewed' },
];

const sevBadge: Record<Severity, { cls: string; icon: typeof AlertTriangle }> = {
  critical: { cls: 'bg-red-50 text-red-700 border-l-red-500', icon: AlertTriangle },
  high: { cls: 'bg-orange-50 text-orange-700 border-l-orange-500', icon: AlertCircle },
  medium: { cls: 'bg-amber-50 text-amber-700 border-l-amber-500', icon: AlertCircle },
  low: { cls: 'bg-blue-50 text-blue-700 border-l-blue-500', icon: Info },
};

const statusCls: Record<SignalStatus, string> = {
  open: 'text-red-700',
  reviewed: 'text-blue-700',
  dismissed: 'text-gray-400',
};

const RiskSignalsTab = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 px-4 py-3 bg-gray-50/50 text-[11px]">
      <div>
        <p className="text-gray-500">critical</p>
        <p className="text-base font-bold tabular-nums text-red-700">{data.filter((d) => d.severity === 'critical').length}</p>
      </div>
      <div>
        <p className="text-gray-500">high</p>
        <p className="text-base font-bold tabular-nums text-orange-700">{data.filter((d) => d.severity === 'high').length}</p>
      </div>
      <div>
        <p className="text-gray-500">medium</p>
        <p className="text-base font-bold tabular-nums text-amber-700">{data.filter((d) => d.severity === 'medium').length}</p>
      </div>
      <div>
        <p className="text-gray-500">low</p>
        <p className="text-base font-bold tabular-nums text-blue-700">{data.filter((d) => d.severity === 'low').length}</p>
      </div>
      <div>
        <p className="text-gray-500">open</p>
        <p className="text-base font-bold tabular-nums">{data.filter((d) => d.status === 'open').length}</p>
      </div>
    </div>

    <div className="space-y-2 px-4">
      {data.map((r) => {
        const S = sevBadge[r.severity];
        const Icon = S.icon;
        return (
          <div key={r.id} className={`border-l-4 px-3 py-2 rounded text-[12px] ${S.cls}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{r.signal}</p>
                  <p className="text-gray-700 mt-0.5">{r.description}</p>
                </div>
              </div>
              <div className="text-right text-[11px] shrink-0">
                <div className="font-mono text-gray-500">{r.detected}</div>
                <div className={`mt-1 font-semibold ${statusCls[r.status]}`}>{r.status}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default RiskSignalsTab;
