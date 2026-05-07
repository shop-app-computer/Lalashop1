import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('financial');

  const tabs = [
    { id: 'financial', name: 'Financial', icon: Wallet, component: <FinancialTab /> },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, component: <OrdersTab /> },
    { id: 'transactions', name: 'Transactions', icon: ArrowLeftRight, component: <TransactionsTab /> },
    { id: 'withdrawals', name: 'Withdrawals', icon: Coins, component: <WithdrawalHistoryTab /> },
    { id: 'bank_changes', name: 'Bank Accounts', icon: Banknote, component: <BankAccountChangesTab /> },
    { id: 'kyc', name: 'KYC', icon: FileBadge, component: <KYCTab /> },
    { id: 'deposit_sources', name: 'Deposit Sources', icon: ArrowLeftRight, component: <DepositSourcesTab /> },
    { id: 'login_device', name: 'Login & Device', icon: Monitor, component: <LoginDeviceTab /> },
    { id: 'linked_accounts', name: 'Linked Accounts', icon: Globe, component: <LinkedAccountsTab /> },
    { id: 'risk_signals', name: 'Risk Signals', icon: AlertTriangle, component: <RiskSignalsTab /> },
    { id: 'edit_logs', name: 'Edit / System Logs', icon: FileEdit, component: <EditLogsTab /> },
    { id: 'support', name: 'Support', icon: LifeBuoy, component: <SupportTab /> },
    { id: 'admin_audit', name: 'Admin Audit', icon: ShieldCheck, component: <AdminAuditTab /> },
  ];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex border-b border-gray-100 text-[12px] overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors whitespace-nowrap ${
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

      <div className="rounded-lg overflow-hidden">
        {tabs.find((t) => t.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default HistoryUI;
