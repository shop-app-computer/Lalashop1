import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Store, ShoppingBag, CreditCard, History, Bell, Settings,
  DollarSign, Activity, Package,
  CheckCircle, Clock, AlertCircle, Globe, Layers, ShieldCheck,
  Calendar, Filter, ChevronDown, Search,
} from 'lucide-react';
import {
  fetchDashboardStats,
  fetchRecentActivity,
  type DashboardStats,
  type RecentActivity,
} from '@/services/adminApi';

const quickLinks = [
  { title: 'All Users', icon: Users, href: '/users/alluser' },
  { title: 'Sellers', icon: Store, href: '/users/sellers' },
  { title: 'Shop Center', icon: ShoppingBag, href: '/shops/shopcenter' },
  { title: 'Withdrawals', icon: CreditCard, href: '/withdrawpage/Seller/SellerWithdrawals' },
  { title: 'History', icon: History, href: '/history/history' },
  { title: 'Notifications', icon: Bell, href: '/notifications' },
  { title: 'Categories', icon: Layers, href: '/categories' },
  { title: 'Settings', icon: Settings, href: '/settings' },
];

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

const typeBadge: Record<string, string> = {
  shop: 'bg-purple-50 text-purple-700',
  finance: 'bg-green-50 text-green-700',
  user: 'bg-blue-50 text-blue-700',
  system: 'bg-gray-100 text-gray-700',
};

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);
const formatCurrency = (value: number): string => `₭${formatNumber(Math.round(value))}`;
const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export default function Dashboard() {
  const [range, setRange] = useState('30d');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivity(),
        ]);
        if (cancelled) return;
        setStats(statsRes.data ?? null);
        setActivity(activityRes.data ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totals = stats?.totals;
  const secondaryTotals = stats?.secondary;

  const primaryCards = [
    {
      label: 'Total Users',
      value: totals ? formatNumber(totals.users) : '—',
      icon: Users,
      detail: secondaryTotals ? `${formatNumber(secondaryTotals.activeUsersToday)} active today` : '',
    },
    {
      label: 'Active Shops',
      value: totals ? formatNumber(totals.activeShops) : '—',
      icon: Store,
      detail: secondaryTotals
        ? `${formatNumber(secondaryTotals.pendingShopApprovals)} pending approval`
        : '',
    },
    {
      label: 'Total Revenue',
      value: totals ? formatCurrency(totals.revenue) : '—',
      icon: DollarSign,
      detail: 'Paid orders, all-time',
    },
    {
      label: 'Total Products',
      value: totals ? formatNumber(totals.products) : '—',
      icon: Package,
      detail: 'Across all shops',
    },
  ];

  const secondaryCards = [
    { label: 'Pending Orders', value: secondaryTotals?.pendingOrders ?? 0, icon: Clock, tone: 'text-orange-700' },
    { label: 'Completed Orders', value: secondaryTotals?.completedOrders ?? 0, icon: CheckCircle, tone: 'text-green-700' },
    { label: 'Pending Shops', value: secondaryTotals?.pendingShopApprovals ?? 0, icon: AlertCircle, tone: 'text-red-700' },
    { label: 'Active Today', value: secondaryTotals?.activeUsersToday ?? 0, icon: Globe, tone: 'text-blue-700' },
  ];

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
          <Activity className="w-3.5 h-3.5 mr-1.5" /> System Health
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          Export Report
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 min-w-[100px] justify-between"
          >
            <span>{RANGES.find((r) => r.key === range)?.label ?? range}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-md shadow-md py-1 z-10 min-w-[120px]">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => { setRange(r.key); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold transition-colors ${range === r.key
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search platform-wide..."
            className="pl-7 pr-3 py-1 rounded text-[11px] w-64 bg-gray-50 border border-gray-100 focus:border-primary outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-2.5 bg-red-50 text-red-700 text-[12px]">
          {error}
        </div>
      )}

      {/* Primary KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {primaryCards.map((s) => (
          <div key={s.label} className="rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{s.label}</p>
              <span className="inline-flex items-center text-[11px] font-semibold text-gray-500">
                <s.icon className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xl font-bold text-black tabular-nums mt-1">
              {loading ? '...' : s.value}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">{s.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
