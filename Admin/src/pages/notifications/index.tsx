import React, { useState } from 'react';
import { Send, History, AlertCircle } from 'lucide-react';
import SendTab from './tabs/SendTab';
import HistoryTab from './tabs/HistoryTab';
import ReportsTab from './tabs/ReportsTab';
import type { BroadcastPayload } from '@/services/adminApi';

type Tab = 'send' | 'history' | 'reports';

const audienceLabelToValue = (label: string): NonNullable<BroadcastPayload['audience']> => {
  switch (label) {
    case 'Sellers Only':
      return 'sellers';
    case 'Buyers Only':
      return 'buyers';
    case 'Creators Only':
      return 'creators';
    default:
      return 'all';
  }
};

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [targetAudienceLabel, setTargetAudienceLabel] = useState('All Users');

  const tabs: { id: Tab; label: string; icon: typeof Send }[] = [
    { id: 'send', label: 'Send Push', icon: Send },
    { id: 'history', label: 'Delivery History', icon: History },
    { id: 'reports', label: 'User Reports', icon: AlertCircle },
  ];

  return (
    <div className="space-y-4 text-sm">
      {activeTab === 'send' && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Target:</span>
          <select
            value={targetAudienceLabel}
            onChange={(e) => setTargetAudienceLabel(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-md px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer focus:border-primary"
          >
            <option>All Users</option>
            <option>Sellers Only</option>
            <option>Buyers Only</option>
            <option>Creators Only</option>
          </select>
        </div>
      )}

      <div className="flex border-b border-gray-100 text-[12px]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors ${
              activeTab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden">
        {activeTab === 'send' && <SendTab audience={audienceLabelToValue(targetAudienceLabel)} />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
};

export default NotificationsPage;
