import React, { useState } from 'react';
import {
  Search, Filter, ChevronDown, Download, MoreVertical, Plus,
  Monitor, Tablet, Smartphone,
} from 'lucide-react';

type StatusKey = 'all' | 'online' | 'offline' | 'paired';
type RegisterStatus = 'Online' | 'Offline' | 'Pairing';
type DeviceType = 'Desktop' | 'Tablet' | 'Mobile';

interface Register {
  id: string;
  name: string;
  location: string;
  device: DeviceType;
  serial: string;
  cashier: string | null;
  lastSync: string;
  status: RegisterStatus;
}

const registers: Register[] = [
  { id: 'REG-01', name: 'Front Counter', location: 'Vientiane Flagship', device: 'Desktop', serial: 'A2X-22918', cashier: 'Somsak K.', lastSync: 'just now', status: 'Online' },
  { id: 'REG-02', name: 'Back Counter', location: 'Vientiane Flagship', device: 'Tablet', serial: 'iPad-441-LO', cashier: 'Mali T.', lastSync: '2m ago', status: 'Online' },
  { id: 'REG-03', name: 'Pop-up Booth', location: 'That Luang Festival', device: 'Tablet', serial: 'iPad-998-PB', cashier: 'Viphone S.', lastSync: '14m ago', status: 'Online' },
  { id: 'REG-04', name: 'Mobile Cashier', location: 'Floor sales', device: 'Mobile', serial: 'And-7712-MC', cashier: null, lastSync: '1h ago', status: 'Offline' },
  { id: 'REG-05', name: 'Luang Prabang #1', location: 'Luang Prabang Branch', device: 'Desktop', serial: 'A2X-23044', cashier: 'Boualay T.', lastSync: '4m ago', status: 'Online' },
  { id: 'REG-06', name: 'Pakse Branch', location: 'Pakse Branch', device: 'Tablet', serial: 'iPad-302-PK', cashier: null, lastSync: 'never', status: 'Pairing' },
];

const STATUS_TABS: { key: StatusKey; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: registers.length },
  { key: 'online', label: 'Online', count: registers.filter((r) => r.status === 'Online').length },
  { key: 'offline', label: 'Offline', count: registers.filter((r) => r.status === 'Offline').length },
  { key: 'paired', label: 'Pairing', count: registers.filter((r) => r.status === 'Pairing').length },
];

const STATUS_BADGE: Record<RegisterStatus, string> = {
  Online: 'bg-green-50 text-green-700',
  Offline: 'bg-gray-100 text-gray-600',
  Pairing: 'bg-orange-50 text-orange-700',
};

const STATUS_DOT: Record<RegisterStatus, string> = {
  Online: 'bg-green-500',
  Offline: 'bg-gray-400',
  Pairing: 'bg-orange-500',
};

const DEVICE_ICON: Record<DeviceType, React.ReactNode> = {
  Desktop: <Monitor className="w-3.5 h-3.5 text-gray-500" />,
  Tablet: <Tablet className="w-3.5 h-3.5 text-gray-500" />,
  Mobile: <Smartphone className="w-3.5 h-3.5 text-gray-500" />,
};

const RegistersPage = () => {
  const [statusTab, setStatusTab] = useState<StatusKey>('all');

  const visible = registers.filter((r) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'online') return r.status === 'Online';
    if (statusTab === 'offline') return r.status === 'Offline';
    if (statusTab === 'paired') return r.status === 'Pairing';
    return true;
  });

  const onlineCount = registers.filter((r) => r.status === 'Online').length;
  const offlineCount = registers.filter((r) => r.status === 'Offline').length;
  const pairingCount = registers.filter((r) => r.status === 'Pairing').length;
  const locationCount = new Set(registers.map((r) => r.location)).size;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Register
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Location: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Device: <span className="font-semibold text-gray-900 ml-1">Any</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search register, serial…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Online</p>
          <p className="text-xl font-bold text-green-600 tabular-nums mt-1">{onlineCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Offline</p>
          <p className="text-xl font-bold text-gray-700 tabular-nums mt-1">{offlineCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Pairing</p>
          <p className="text-xl font-bold text-orange-600 tabular-nums mt-1">{pairingCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Locations</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{locationCount}</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusTab(t.key)}
            className={`px-3 py-2 text-[11px] font-semibold border-b-2 -mb-px ${
              statusTab === t.key
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            {t.label}
            <span className="ml-1 text-gray-400 tabular-nums">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-[12px] tabular-nums">
          <thead className="text-[11px] text-gray-500 tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Register</th>
              <th className="px-4 py-2 text-left font-semibold">Location</th>
              <th className="px-4 py-2 text-left font-semibold">Device</th>
              <th className="px-4 py-2 text-left font-semibold">Serial</th>
              <th className="px-4 py-2 text-left font-semibold">Active cashier</th>
              <th className="px-4 py-2 text-left font-semibold">Last sync</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                    <span className="font-medium text-gray-900">{r.name}</span>
                    <span className="font-mono text-[11px] text-gray-400">{r.id}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-700">{r.location}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-700">
                    {DEVICE_ICON[r.device]}
                    {r.device}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500">{r.serial}</td>
                <td className="px-4 py-2 text-gray-700">{r.cashier ?? <span className="text-gray-400">—</span>}</td>
                <td className="px-4 py-2 text-gray-500">{r.lastSync}</td>
                <td className="px-4 py-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button className="text-gray-400 hover:text-black">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistersPage;
