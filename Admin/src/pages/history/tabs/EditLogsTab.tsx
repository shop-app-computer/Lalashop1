import React from 'react';

const editLogsData = [
  { id: 'LOG-001', admin: 'admin_01', ip: '192.168.1.10', target: 'user: somsack_s', action: 'Update Balance', oldValue: '10M', newValue: '15.4M', date: '2024-04-23 14:20' },
  { id: 'LOG-002', admin: 'admin_02', ip: '192.168.1.15', target: 'product: iPhone 15', action: 'Update Price', oldValue: '12M', newValue: '11.5M', date: '2024-04-23 13:10' },
];

const EditLogsTab = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-[12px] tabular-nums">
      <thead className="text-[11px] text-gray-500 tracking-wide">
        <tr>
          <th className="px-4 py-2 text-left font-semibold">Log ID</th>
          <th className="px-4 py-2 text-left font-semibold">Admin / IP</th>
          <th className="px-4 py-2 text-left font-semibold">Target</th>
          <th className="px-4 py-2 text-left font-semibold">Action</th>
          <th className="px-4 py-2 text-left font-semibold">Value Change</th>
          <th className="px-4 py-2 text-left font-semibold">Date</th>
        </tr>
      </thead>
      <tbody>
        {editLogsData.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{item.id}</td>
            <td className="px-4 py-2">
              <div className="font-mono text-[11px] font-semibold text-gray-900">@{item.admin}</div>
              <div className="font-mono text-[11px] text-gray-500 mt-0.5">{item.ip}</div>
            </td>
            <td className="px-4 py-2 text-gray-700">{item.target}</td>
            <td className="px-4 py-2 text-gray-700">{item.action}</td>
            <td className="px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-[11px]">{item.oldValue}</span>
                <span className="text-gray-300">→</span>
                <span className="text-gray-900 font-semibold">{item.newValue}</span>
              </div>
            </td>
            <td className="px-4 py-2 text-gray-500 text-[11px]">{item.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EditLogsTab;
