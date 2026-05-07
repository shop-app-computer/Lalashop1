import React from 'react';

type Type = 'commission' | 'payment' | 'refund';

const transactionsData: { id: string; from: string; to: string; type: Type; amount: string; note: string; date: string }[] = [
  { id: 'TX-9901', from: 'System', to: 'somsack_s', type: 'commission', amount: '45,000', note: 'Affiliate reward for ORD-7721', date: '2024-04-23 12:00' },
  { id: 'TX-9902', from: 'keo_v', to: 'Shop A', type: 'payment', amount: '1,200,000', note: 'Product purchase payment', date: '2024-04-23 09:15' },
];

const typeBadge: Record<Type, string> = {
  commission: 'bg-green-50 text-green-700',
  payment: 'bg-blue-50 text-blue-700',
  refund: 'bg-cyan-50 text-cyan-700',
};

const TransactionsTab = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-[12px] tabular-nums">
      <thead className="text-[11px] text-gray-500 tracking-wide">
        <tr>
          <th className="px-4 py-2 text-left font-semibold">TX ID</th>
          <th className="px-4 py-2 text-left font-semibold">From</th>
          <th className="px-4 py-2 text-left font-semibold">To</th>
          <th className="px-4 py-2 text-left font-semibold">Type</th>
          <th className="px-4 py-2 text-right font-semibold">Amount (₭)</th>
          <th className="px-4 py-2 text-left font-semibold">Note</th>
          <th className="px-4 py-2 text-left font-semibold">Date</th>
        </tr>
      </thead>
      <tbody>
        {transactionsData.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{item.id}</td>
            <td className="px-4 py-2 text-gray-700">{item.from}</td>
            <td className="px-4 py-2 text-gray-700">{item.to}</td>
            <td className="px-4 py-2">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${typeBadge[item.type]}`}>
                {item.type}
              </span>
            </td>
            <td className="px-4 py-2 text-right font-semibold text-gray-900">{item.amount}</td>
            <td className="px-4 py-2 text-gray-500 text-[11px]">{item.note}</td>
            <td className="px-4 py-2 text-gray-500 text-[11px]">{item.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TransactionsTab;
