import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet, ShoppingBag, ArrowLeftRight, FileEdit,
  Banknote, FileBadge, Monitor, Globe, Coins, AlertTriangle, LifeBuoy, ShieldCheck,
} from 'lucide-react';
import FinancialTab from './tabs/FinancialTab';
import OrdersTab from './tabs/OrdersTab';
import TransactionsTab from './tabs/TransactionsTab';
import EditLogsTab from './tabs/EditLogsTab';
import WithdrawalHistoryTab from './tabs/WithdrawalHistoryTab';
import BankAccountChangesTab from './tabs/BankAccountChangesTab';
import KYCTab from './tabs/KYCTab';
import LoginDeviceTab from './tabs/LoginDeviceTab';
import LinkedAccountsTab from './tabs/LinkedAccountsTab';
import DepositSourcesTab from './tabs/DepositSourcesTab';
import RiskSignalsTab from './tabs/RiskSignalsTab';
import SupportTab from './tabs/SupportTab';
import AdminAuditTab from './tabs/AdminAuditTab';

const HistoryUI = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('financial');

  const tabs = [
    { id: 'financial', nameKey: 'pages.history.tabs.financial', icon: Wallet, component: <FinancialTab /> },
    { id: 'orders', nameKey: 'pages.history.tabs.orders', icon: ShoppingBag, component: <OrdersTab /> },
    { id: 'transactions', nameKey: 'pages.history.tabs.transactions', icon: ArrowLeftRight, component: <TransactionsTab /> },
    { id: 'withdrawals', nameKey: 'pages.history.tabs.withdrawals', icon: Coins, component: <WithdrawalHistoryTab /> },
    { id: 'bank_changes', nameKey: 'pages.history.tabs.bankChanges', icon: Banknote, component: <BankAccountChangesTab /> },
    { id: 'kyc', nameKey: 'pages.history.tabs.kyc', icon: FileBadge, component: <KYCTab /> },
    { id: 'deposit_sources', nameKey: 'pages.history.tabs.depositSources', icon: ArrowLeftRight, component: <DepositSourcesTab /> },
    { id: 'login_device', nameKey: 'pages.history.tabs.loginDevice', icon: Monitor, component: <LoginDeviceTab /> },
    { id: 'linked_accounts', nameKey: 'pages.history.tabs.linkedAccounts', icon: Globe, component: <LinkedAccountsTab /> },
    { id: 'risk_signals', nameKey: 'pages.history.tabs.riskSignals', icon: AlertTriangle, component: <RiskSignalsTab /> },
    { id: 'edit_logs', nameKey: 'pages.history.tabs.editLogs', icon: FileEdit, component: <EditLogsTab /> },
    { id: 'support', nameKey: 'pages.history.tabs.support', icon: LifeBuoy, component: <SupportTab /> },
    { id: 'admin_audit', nameKey: 'pages.history.tabs.adminAudit', icon: ShieldCheck, component: <AdminAuditTab /> },
  ];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex border-b border-gray-100 text-[12px] overflow-x-auto custom-scrollbar">
        {tabs.map((tItem) => {
          const isActive = activeTab === tItem.id;
          return (
            <button
              key={tItem.id}
              onClick={() => setActiveTab(tItem.id)}
              className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-black border-b-2 border-transparent'
              }`}
            >
              <tItem.icon className="w-3.5 h-3.5" />
              {t(tItem.nameKey)}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg overflow-hidden">
        {tabs.find((tItem) => tItem.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default HistoryUI;
