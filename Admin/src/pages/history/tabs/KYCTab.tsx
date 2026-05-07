import React from 'react';
import { CheckCircle2, XCircle, Clock, FileText, Camera, Building2, Wallet } from 'lucide-react';

type Status = 'verified' | 'pending' | 'rejected' | 'missing';

const items: { label: string; status: Status; submitted: string; verifiedBy: string; note?: string; icon: typeof FileText }[] = [
  { label: 'national id card', status: 'verified', submitted: '2024-04-20', verifiedBy: 'admin_alex', icon: FileText },
  { label: 'selfie with id', status: 'verified', submitted: '2024-04-20', verifiedBy: 'admin_alex', icon: Camera },
  { label: 'proof of address', status: 'pending', submitted: '2024-04-22', verifiedBy: '—', icon: Building2 },
  { label: 'bank statement', status: 'rejected', submitted: '2024-04-18', verifiedBy: 'admin_keo', note: 'document expired', icon: Wallet },
  { label: 'source of wealth', status: 'missing', submitted: '—', verifiedBy: '—', icon: FileText },
  { label: 'tax id', status: 'verified', submitted: '2024-04-20', verifiedBy: 'admin_alex', icon: FileText },
];

const statusBadge: Record<Status, { cls: string; icon: typeof CheckCircle2 }> = {
  verified: { cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  pending: { cls: 'bg-orange-50 text-orange-700', icon: Clock },
  rejected: { cls: 'bg-red-50 text-red-700', icon: XCircle },
  missing: { cls: 'bg-gray-100 text-gray-500', icon: XCircle },
};

const KYCTab = () => {
  const verified = items.filter((i) => i.status === 'verified').length;
  const total = items.length;
  const score = Math.round((verified / total) * 100);

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center gap-4 bg-gray-50/50 px-4 py-3 rounded">
        <div className="min-w-[80px]">
          <p className="text-[11px] text-gray-500">kyc completion</p>
          <p className="text-2xl font-bold tabular-nums">{score}%</p>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${score}%` }} />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {verified} of {total} documents verified
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const S = statusBadge[item.status];
          const SIcon = S.icon;
          const ItemIcon = item.icon;
          return (
            <div key={item.label} className="border border-gray-100 rounded p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ItemIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-[12px]">{item.label}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${S.cls}`}>
                  <SIcon className="w-3 h-3" /> {item.status}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
                <div>
                  submitted: <span className="font-mono text-gray-700">{item.submitted}</span>
                </div>
                <div>
                  verified by:{' '}
                  <span className="font-mono text-gray-700">
                    {item.verifiedBy === '—' ? '—' : `@${item.verifiedBy}`}
                  </span>
                </div>
                {item.note && <div className="text-red-700 font-medium mt-1">⚠ {item.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KYCTab;
