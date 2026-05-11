import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, History, AlertCircle } from 'lucide-react';
import SendTab from './tabs/SendTab';
import HistoryTab from './tabs/HistoryTab';
import ReportsTab from './tabs/ReportsTab';
import type { BroadcastPayload } from '@/services/adminApi';

type Tab = 'send' | 'history' | 'reports';

const NotificationsPage = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [targetAudience, setTargetAudience] = useState<NonNullable<BroadcastPayload['audience']>>('all');

  const tabs: { id: Tab; labelKey: string; icon: typeof Send }[] = [
    { id: 'send', labelKey: 'pages.notifications.tabs.send', icon: Send },
    { id: 'history', labelKey: 'pages.notifications.tabs.history', icon: History },
    { id: 'reports', labelKey: 'pages.notifications.tabs.reports', icon: AlertCircle },
  ];

  const audienceOptions: { value: NonNullable<BroadcastPayload['audience']>; labelKey: string }[] = [
    { value: 'all', labelKey: 'pages.notifications.audience.all' },
    { value: 'sellers', labelKey: 'pages.notifications.audience.sellers' },
    { value: 'buyers', labelKey: 'pages.notifications.audience.buyers' },
    { value: 'creators', labelKey: 'pages.notifications.audience.creators' },
  ];

  return (
    <div className="space-y-4 text-sm">
      {activeTab === 'send' && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">{t('pages.notifications.target')}:</span>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value as any)}
            className="bg-gray-50 border border-gray-100 rounded-md px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer focus:border-primary"
          >
            {audienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex border-b border-gray-100 text-[12px]">
        {tabs.map((tItem) => (
          <button
            key={tItem.id}
            onClick={() => setActiveTab(tItem.id)}
            className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors ${
              activeTab === tItem.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            <tItem.icon className="w-3.5 h-3.5" />
            {t(tItem.labelKey)}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden">
        {activeTab === 'send' && <SendTab audience={targetAudience} />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
};

export default NotificationsPage;
