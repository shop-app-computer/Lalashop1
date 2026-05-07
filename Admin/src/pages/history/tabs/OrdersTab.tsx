import React from 'react';

type Status = 'delivered' | 'processing' | 'cancelled';

const ordersData: { id: string; user: string; items: number; total: string; payment: string; shipping: string; status: Status; date: string }[] = [
  { id: 'ORD-8821', user: 'somsack_s', items: 3, total: '850,000', payment: 'BCEL One', shipping: 'Express', status: 'delivered', date: '2024-04-23 11:20' },
  { id: 'ORD-8822', user: 'unknown_u', items: 1, total: '120,000', payment: 'COD', shipping: 'Standard', status: 'processing', date: '2024-04-23 10:05' },
];

const statusBadge: Record<Status, string> = {
  delivered: 'bg-green-50 text-green-700',
  processing: 'bg-purple-50 text-purple-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const OrdersTab = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-[12px] tabular-nums">
      <thead className="text-[11px] text-gray-500 tracking-wide">
        <tr>
          <th className="px-4 py-2 text-left font-semibold">Order ID</th>
          <th className="px-4 py-2 text-left font-semibold">Customer</th>
          <th className="px-4 py-2 text-right font-semibold">Items</th>
          <th className="px-4 py-2 text-left font-semibold">Payment</th>
          <th className="px-4 py-2 text-right font-semibold">Total (₭)</th>
          <th className="px-4 py-2 text-left font-semibold">Shipping</th>
          <th className="px-4 py-2 text-left font-semibold">Date</th>
          <th className="px-4 py-2 text-left font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {ordersData.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2 font-mono text-[11px] text-gray-700">{item.id}</td>
            <td className="px-4 py-2 font-medium text-gray-900">@{item.user}</td>
            <td className="px-4 py-2 text-right text-gray-700">{item.items}</td>
            <td className="px-4 py-2 text-gray-700">{item.payment}</td>
            <td className="px-4 py-2 text-right font-semibold text-gray-900">{item.total}</td>
            <td className="px-4 py-2 text-gray-700">{item.shipping}</td>
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

export default OrdersTab;
