import React, { useState } from 'react';
import {
  Download, ChevronDown, Landmark, ArrowUpRight,
} from 'lucide-react';

type TxStatus = 'Completed' | 'Pending' | 'Settled' | 'Failed';
type TxType = 'Sale' | 'Withdrawal' | 'Refund' | 'Fee';

interface Transaction {
  id: string;
  internalRef: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  date: string;
}

const transactions: Transaction[] = [
  { id: 'ORD-0921', internalRef: '1992834', type: 'Sale',       amount:   450.00, status: 'Completed', date: 'Oct 24, 2023' },
  { id: 'TRX-8821', internalRef: '2992834', type: 'Withdrawal', amount: -1200.00, status: 'Pending',   date: 'Oct 23, 2023' },
  { id: 'ORD-0922', internalRef: '3992834', type: 'Sale',       amount:   120.00, status: 'Settled',   date: 'Oct 22, 2023' },
  { id: 'ORD-0899', internalRef: '4992834', type: 'Refund',     amount:   -45.00, status: 'Completed', date: 'Oct 21, 2023' },
  { id: 'TRX-8814', internalRef: '5992834', type: 'Fee',        amount:   -12.50, status: 'Completed', date: 'Oct 21, 2023' },
  { id: 'ORD-0918', internalRef: '6992834', type: 'Sale',       amount:   289.00, status: 'Settled',   date: 'Oct 20, 2023' },
];

const statusBadgeClass = (status: TxStatus): string => {
  switch (status) {
    case 'Completed':
    case 'Settled':
      return 'bg-green-50 text-green-700';
    case 'Pending':
      return 'bg-orange-50 text-orange-700';
    case 'Failed':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-blue-50 text-blue-700';
  }
};

const fmtMoney = (n: number): string => {
  const sign = n < 0 ? '-' : n > 0 ? '+' : '';
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${abs}`;
};

const fmtMoneyPlain = (n: number): string =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface KPIProps {
  label: string;
  value: string;
  hint?: string;
}

const KPI = ({ label, value, hint }: KPIProps) => (
  <div className="rounded-lg px-4 py-3">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className="text-xl font-bold text-black tabular-nums mt-1">{value}</p>
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

const FinanceBalance = () => {
  const [amount, setAmount] = useState<string>('');
  const [account, setAccount] = useState<string>('jdb');

  const accounts = [
    { id: 'jdb',  name: 'JDB Bank',          masked: '**** 8892' },
    { id: 'bcel', name: 'BCEL One',          masked: '**** 1107' },
    { id: 'ldb',  name: 'Lao Development Bank', masked: '**** 5520' },
  ];

  const selected = accounts.find((a) => a.id === account) ?? accounts[0];

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> Request Payout
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Available Balance"  value="$12,450.89" hint="Ready to withdraw" />
        <KPI label="Pending Settlement" value="$1,890.00"  hint="Settles in 2–3 days" />
        <KPI label="Total Withdrawn"    value="$45,000.00" hint="Lifetime" />
        <KPI label="Next Payout"        value="May 5, 2026" hint="Est. $1,890.00" />
      </div>

      {/* Settlement schedule mini-card */}
      <div className="rounded-lg px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide">Next settlement</span>
          <span className="text-xs font-semibold text-black tabular-nums">May 5, 2026</span>
          <span className="h-4 w-px bg-gray-200" />
          <span className="text-[11px] text-gray-500">Est. payout</span>
          <span className="text-xs font-semibold text-black tabular-nums">$1,890.00</span>
        </div>
        <button className="text-[11px] font-semibold text-gray-700 hover:underline">View schedule →</button>
      </div>

      {/* Two-column: transactions + payout form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transactions table */}
        <div className="lg:col-span-2 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Transaction history</h3>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
                Type: <span className="font-semibold text-gray-900 ml-1">All</span>
                <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
              </button>
              <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
                Status: <span className="font-semibold text-gray-900 ml-1">All</span>
                <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
              </button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] tabular-nums">
              <thead className="text-[11px] text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Transaction ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Type</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="">
                    <td className="px-4 py-2">
                      <span className="font-mono text-[11px] text-gray-900">{tx.id}</span>
                      <span className="font-mono text-[10px] text-gray-400 ml-2">ref:{tx.internalRef}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{tx.type}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmtMoney(tx.amount)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Payout panel */}
        <div className="rounded-lg">
          <div className="px-4 py-3">
            <h3 className="text-sm font-bold text-black">Request payout</h3>
          </div>
          <div className="p-4 space-y-3">
            {/* Bank account dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-wide mb-1">
                Bank account
              </label>
              <div className="relative">
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="appearance-none w-full rounded-md pl-8 pr-8 py-1.5 text-xs text-gray-900"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.masked}
                    </option>
                  ))}
                </select>
                <Landmark className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {selected.name} · <span className="font-mono">{selected.masked}</span>
              </p>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-wide mb-1">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={100}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-1.5 rounded-md text-xs tabular-nums"
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-gray-400">Available: <span className="tabular-nums text-gray-700">$12,450.89</span></p>
                <button
                  type="button"
                  onClick={() => setAmount('12450.89')}
                  className="text-[11px] font-semibold text-gray-700 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Summary row */}
            <div className="pt-3 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Withdrawal amount</span>
                <span className="tabular-nums text-gray-900">{amount ? fmtMoneyPlain(Number(amount) || 0) : '$0.00'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Processing fee</span>
                <span className="tabular-nums text-gray-900">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pt-2">
                <span className="text-gray-900">You receive</span>
                <span className="tabular-nums text-black">{amount ? fmtMoneyPlain(Number(amount) || 0) : '$0.00'}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-black text-white px-3 py-2 rounded-md text-xs font-semibold inline-flex items-center justify-center hover:bg-gray-900"
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> Confirm withdrawal
            </button>

            <p className="text-[11px] text-gray-400">
              Withdrawals processed within 24–48h. Min $100.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceBalance;
