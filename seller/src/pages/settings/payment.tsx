import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

type AccountStatus = 'active' | 'pending' | 'inactive';

interface BankAccount {
  id: string;
  bank: string;
  accountName: string;
  last4: string;
  currency: string;
  primary: boolean;
  status: AccountStatus;
}

interface PaymentMethod {
  id: string;
  name: string;
  fee: string;
  enabled: boolean;
}

const accounts: BankAccount[] = [
  { id: 'a-jdb', bank: 'Junction Development Bank (JDB)', accountName: 'LALA PREMIUM GLOBAL', last4: '8892', currency: 'LAK', primary: true, status: 'active' },
  { id: 'a-bcel', bank: 'BCEL', accountName: 'LALA PREMIUM GLOBAL', last4: '4421', currency: 'LAK', primary: false, status: 'active' },
  { id: 'a-kbank', bank: 'Kasikorn Bank (KBANK)', accountName: 'LALA TH CO LTD', last4: '0917', currency: 'THB', primary: false, status: 'pending' },
];

const initialMethods: PaymentMethod[] = [
  { id: 'visa', name: 'Visa', fee: '2.9% + 1,500 LAK', enabled: true },
  { id: 'mc', name: 'Mastercard', fee: '2.9% + 1,500 LAK', enabled: true },
  { id: 'jdb', name: 'JDB Direct Debit', fee: '0.8%', enabled: true },
  { id: 'bcel', name: 'BCEL OnePay', fee: '0.8%', enabled: true },
  { id: 'promptpay', name: 'PromptPay (TH)', fee: '1.2%', enabled: false },
  { id: 'cod', name: 'Cash on delivery', fee: '0%', enabled: true },
];

const StatusBadge = ({ status }: { status: AccountStatus }) => {
  const map: Record<AccountStatus, { cls: string; label: string }> = {
    active: { cls: 'bg-green-50 text-green-700', label: 'Active' },
    pending: { cls: 'bg-gray-100 text-gray-600', label: 'Pending' },
    inactive: { cls: 'bg-gray-100 text-gray-600', label: 'Inactive' },
  };
  const { cls, label } = map[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${cls}`}>{label}</span>;
};

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!on)}
    className={`relative w-9 h-5 rounded-full transition-colors ${on ? 'bg-black' : 'bg-gray-200'}`}
  >
    <span className={`absolute top-0.5 ${on ? 'left-[18px]' : 'left-0.5'} w-4 h-4 rounded-full transition-all`} />
  </button>
);

const PaymentSettings = () => {
  const [methods, setMethods] = useState(initialMethods);

  const toggleMethod = (id: string, value: boolean) => {
    setMethods(methods.map((m) => (m.id === id ? { ...m, enabled: value } : m)));
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700">
          Cancel
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-900">
          Save changes
        </button>
      </div>

      {/* Payout settings */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Payout settings</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">When and how settled funds are deposited to your account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Payout schedule</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Cadence at which the platform initiates a deposit.</p>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <select className="w-full px-3 py-1.5 rounded-md text-xs appearance-none pr-8">
                <option>Daily (T+2 settlement)</option>
                <option>Weekly (every Monday)</option>
                <option>Bi-weekly</option>
                <option>Monthly (1st of month)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Minimum payout</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Skip payouts below this amount and roll forward.</p>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="number"
              defaultValue={500000}
              className="w-40 px-3 py-1.5 rounded-md text-xs font-mono"
            />
            <span className="text-[11px] text-gray-500">LAK</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Settlement currency</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Currency in which payouts are deposited.</p>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <select className="w-full px-3 py-1.5 rounded-md text-xs appearance-none pr-8">
                <option>LAK — Lao Kip</option>
                <option>THB — Thai Baht</option>
                <option>USD — US Dollar</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Hold reserve</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Withhold a percentage to cover potential refunds.</p>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="number"
              defaultValue={5}
              className="w-24 px-3 py-1.5 rounded-md text-xs font-mono"
            />
            <span className="text-[11px] text-gray-500">% of gross</span>
          </div>
        </div>
      </div>

      {/* Bank accounts table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-black">Bank accounts</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Verified deposit accounts for receiving payouts.</p>
          </div>
          <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add account
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Bank</th>
                <th className="px-4 py-2 text-left font-semibold">Account name</th>
                <th className="px-4 py-2 text-left font-semibold">Account</th>
                <th className="px-4 py-2 text-left font-semibold">Currency</th>
                <th className="px-4 py-2 text-left font-semibold">Primary</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {accounts.map((a) => (
                <tr key={a.id} className="">
                  <td className="px-4 py-2 font-medium text-gray-900">{a.bank}</td>
                  <td className="px-4 py-2 text-gray-700">{a.accountName}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">**** {a.last4}</td>
                  <td className="px-4 py-2 text-gray-700">{a.currency}</td>
                  <td className="px-4 py-2 text-gray-600">{a.primary ? 'Yes' : '—'}</td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-[11px] font-semibold text-gray-700 hover:underline mr-3">Edit</button>
                    <button className="text-[11px] font-semibold text-red-600 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment methods toggle list */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Payment methods accepted</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Methods customers can use at checkout. Disabled methods are hidden.</p>
        </div>
        <ul className="">
          {methods.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-gray-900">{m.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Fee: <span className="font-mono">{m.fee}</span></p>
              </div>
              <Toggle on={m.enabled} onChange={(v) => toggleMethod(m.id, v)} />
            </li>
          ))}
        </ul>
      </div>

      {/* Tax & Fee summary */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Tax & fee summary</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Read-only breakdown of platform deductions.</p>
        </div>
        <div className="">
          <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
            <span className="text-gray-700">Platform commission</span>
            <span className="font-semibold text-gray-900 tabular-nums">3.0%</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
            <span className="text-gray-700">Settlement fee per payout</span>
            <span className="font-semibold text-gray-900 tabular-nums">5,000 LAK</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
            <span className="text-gray-700">FX conversion (cross-currency)</span>
            <span className="font-semibold text-gray-900 tabular-nums">0.85%</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
            <span className="text-gray-700">Refund processing fee</span>
            <span className="font-semibold text-gray-900 tabular-nums">2,000 LAK</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
            <span className="font-semibold text-gray-900">Effective net rate</span>
            <span className="font-bold text-gray-900 tabular-nums">~96.2%</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <button className="text-[11px] font-semibold text-gray-700 hover:underline">View full fee schedule →</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
