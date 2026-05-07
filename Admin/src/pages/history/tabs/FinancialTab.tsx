import React from 'react';

type Status = 'completed' | 'pending' | 'failed';
type Type = 'deposit' | 'withdraw';

const financialData: { id: string; ref: string; type: Type; amount: string; balanceAfter: string; user: string; status: Status; date: string; bank: string }[] = [
  { id: 'F1001', ref: 'TXN-882910', type: 'deposit', amount: '5,000,000', balanceAfter: '15,000,000', user: 'somsack_s', status: 'completed', date: '2024-04-23 10:30', bank: 'BCEL One' },
  { id: 'F1002', ref: 'TXN-882911', type: 'withdraw', amount: '1,200,000', balanceAfter: '13,800,000', user: 'keo_v', status: 'pending', date: '2024-04-23 09:15', bank: 'LDB' },
  { id: 'F1003', ref: 'TXN-882912', type: 'deposit', amount: '250,000', balanceAfter: '14,050,000', user: 'anousone', status: 'failed', date: '2024-04-22 18:45', bank: 'JDB' },
];

const statusBadge: Record<Status, string> = {
  completed: 'bg-green-50 text-green-700',
  pending: 'bg-orange-50 text-orange-700',
  failed: 'bg-red-50 text-red-700',
};

const typeBadge: Record<Type, string> = {
  deposit: 'bg-green-50 text-green-700',
  withdraw: 'bg-blue-50 text-blue-700',
};

const FinancialTab = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-[12px] tabular-nums">
      <thead className="text-[11px] text-gray-500 tracking-wide">
        <tr>
          <th className="px-4 py-2 text-left font-semibold">ID / Reference</th>
          <th className="px-4 py-2 text-left font-semibold">User</th>
          <th className="px-4 py-2 text-left font-semibold">Type</th>
          <th className="px-4 py-2 text-right font-semibold">Amount (₭)</th>
          <th className="px-4 py-2 text-right font-semibold">Balance After (₭)</th>
          <th className="px-4 py-2 text-left font-semibold">Bank</th>
          <th className="px-4 py-2 text-left font-semibold">Date</th>
          <th className="px-4 py-2 text-left font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {financialData.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2">
              <div className="font-mono text-[11px] font-bold text-gray-900">{item.id}</div>
              <div className="font-mono text-[11px] text-gray-500 mt-0.5">{item.ref}</div>
            </td>
            <td className="px-4 py-2 font-mono text-[11px] text-gray-700">@{item.user}</td>
            <td className="px-4 py-2">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${typeBadge[item.type]}`}>
                {item.type}
              </span>
            </td>
            <td className="px-4 py-2 text-right font-semibold text-gray-900">{item.amount}</td>
            <td className="px-4 py-2 text-right text-gray-700">{item.balanceAfter}</td>
            <td className="px-4 py-2">
              <div className="text-gray-700">{item.bank}</div>
              <div className="text-[11px] text-gray-500">Account transfer</div>
            </td>
            <td className="px-4 py-2 text-gray-500 text-[11px]">{item.date}</td>
            <td className="px-4 py-2">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${statusBadge[item.status]}`}>
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default FinancialTab;
