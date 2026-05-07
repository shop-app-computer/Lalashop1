import React, { useState } from 'react';
import {
  Wallet, ShoppingBag, ArrowLeftRight, FileEdit, Search, Calendar, Filter,
} from 'lucide-react';
import FinancialTab from './tabs/FinancialTab';
import OrdersTab from './tabs/OrdersTab';
import TransactionsTab from './tabs/TransactionsTab';
import EditLogsTab from './tabs/EditLogsTab';

const HistoryUI = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [q, setQ] = useState('');

  const tabs = [
    { id: 'financial', name: 'Deposit & Withdraw', icon: Wallet, component: <FinancialTab /> },
    { id: 'orders', name: 'All Orders', icon: ShoppingBag, component: <OrdersTab /> },
    { id: 'transactions', name: 'Transactions', icon: ArrowLeftRight, component: <TransactionsTab /> },
    { id: 'edit_logs', name: 'Edit History', icon: FileEdit, component: <EditLogsTab /> },
  ];

  return (
    <div className="space-y-4 text-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 text-[12px]">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors ${
                isActive
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-black border-b-2 border-transparent'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Date Range
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Filters
        </button>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search records..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden">
        {tabs.find((t) => t.id === activeTab)?.component}
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>System logs</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryUI;
