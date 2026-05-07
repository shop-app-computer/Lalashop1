import React, { useState } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';

type AppStatus = 'connected' | 'disconnected' | 'error';
type AppCategory = 'Marketing' | 'Shipping' | 'Analytics' | 'Payments';

interface AppItem {
  id: string;
  name: string;
  description: string;
  category: AppCategory;
  status: AppStatus;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string;
  created: string;
}

const apps: AppItem[] = [
  { id: 'tiktok', name: 'TikTok Shop', description: 'Sync products and orders with TikTok Shop.', category: 'Marketing', status: 'connected' },
  { id: 'fb', name: 'Facebook Messenger', description: 'Reply to inbound DMs from your inbox.', category: 'Marketing', status: 'connected' },
  { id: 'ig', name: 'Instagram Business', description: 'Tag products in posts and stories.', category: 'Marketing', status: 'disconnected' },
  { id: 'wa', name: 'WhatsApp Business', description: 'Customer support over WhatsApp.', category: 'Marketing', status: 'error' },
  { id: 'anousith', name: 'Anousith Express', description: 'Generate shipping labels and track parcels.', category: 'Shipping', status: 'connected' },
  { id: 'hal', name: 'HAL Logistic', description: 'Same-day couriers in Vientiane.', category: 'Shipping', status: 'connected' },
  { id: 'flash', name: 'Flash Express', description: 'Cross-border shipping to Thailand.', category: 'Shipping', status: 'disconnected' },
  { id: 'ga4', name: 'Google Analytics 4', description: 'Forward storefront events to GA4.', category: 'Analytics', status: 'connected' },
  { id: 'meta-pixel', name: 'Meta Pixel', description: 'Conversions API for Facebook/Instagram ads.', category: 'Analytics', status: 'disconnected' },
  { id: 'jdb-pay', name: 'JDB Payment Gateway', description: 'Direct debit and card processing.', category: 'Payments', status: 'connected' },
  { id: 'bcel-pay', name: 'BCEL OnePay', description: 'OnePay QR and bank transfer.', category: 'Payments', status: 'connected' },
];

const apiKeys: ApiKey[] = [
  { id: 'k-1', name: 'Webhook ingestion (prod)', prefix: 'lsh_live_a83f…', lastUsed: '2 minutes ago', created: 'Mar 12, 2026' },
  { id: 'k-2', name: 'Inventory sync (warehouse)', prefix: 'lsh_live_b91c…', lastUsed: '1 hour ago', created: 'Feb 28, 2026' },
  { id: 'k-3', name: 'Read-only reporting', prefix: 'lsh_live_c40e…', lastUsed: '3 days ago', created: 'Jan 09, 2026' },
  { id: 'k-4', name: 'Sandbox testing', prefix: 'lsh_test_d18a…', lastUsed: 'Never', created: 'Apr 22, 2026' },
];

const StatusBadge = ({ status }: { status: AppStatus }) => {
  const map: Record<AppStatus, { cls: string; label: string }> = {
    connected: { cls: 'bg-green-50 text-green-700', label: 'Connected' },
    disconnected: { cls: 'bg-gray-100 text-gray-600', label: 'Disconnected' },
    error: { cls: 'bg-red-50 text-red-700', label: 'Error' },
  };
  const { cls, label } = map[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${cls}`}>{label}</span>;
};

const CATEGORIES: AppCategory[] = ['Marketing', 'Shipping', 'Analytics', 'Payments'];

const Integrations = () => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealed({ ...revealed, [id]: !revealed[id] });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700">
          Browse marketplace
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Connect app
        </button>
      </div>

      {/* Apps grouped by category */}
      {CATEGORIES.map((cat) => {
        const items = apps.filter((a) => a.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-black">{cat}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">{items.length} app{items.length === 1 ? '' : 's'} available in this category.</p>
              </div>
            </div>
            <table className="w-full text-[12px]">
              <thead className="text-[11px] text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">App</th>
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="">
                {items.map((a) => (
                  <tr key={a.id} className="">
                    <td className="px-4 py-2 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-2 text-gray-600">{a.description}</td>
                    <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-2 text-right">
                      {a.status === 'connected' ? (
                        <>
                          <button className="text-[11px] font-semibold text-gray-700 hover:underline mr-3">Manage</button>
                          <button className="text-[11px] font-semibold text-red-600 hover:underline">Disconnect</button>
                        </>
                      ) : a.status === 'error' ? (
                        <>
                          <button className="text-[11px] font-semibold text-red-600 hover:underline mr-3">Reconnect</button>
                          <button className="text-[11px] font-semibold text-gray-700 hover:underline">Logs</button>
                        </>
                      ) : (
                        <button className="text-[11px] font-semibold text-gray-700 hover:underline">Connect</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* API Keys */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-black">API keys</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Programmatic access tokens. Treat secrets like passwords — rotate frequently.</p>
          </div>
          <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create key
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Key name</th>
                <th className="px-4 py-2 text-left font-semibold">Prefix</th>
                <th className="px-4 py-2 text-left font-semibold">Last used</th>
                <th className="px-4 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {apiKeys.map((k) => (
                <tr key={k.id} className="">
                  <td className="px-4 py-2 font-medium text-gray-900">{k.name}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">
                    {revealed[k.id] ? k.prefix.replace('…', 'b29f7e1c') : k.prefix}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{k.lastUsed}</td>
                  <td className="px-4 py-2 text-gray-600">{k.created}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => toggleReveal(k.id)}
                      className="text-[11px] font-semibold text-gray-700 hover:underline mr-3 inline-flex items-center"
                    >
                      {revealed[k.id] ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                      {revealed[k.id] ? 'Hide' : 'Reveal'}
                    </button>
                    <button className="text-[11px] font-semibold text-red-600 hover:underline">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook endpoint */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Webhook endpoint</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Outbound HTTP endpoint that receives store events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Endpoint URL</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Must be HTTPS. Receives signed POST payloads.</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="url"
              defaultValue="https://hooks.lala-premium.com/lalashop/events"
              className="w-full px-3 py-1.5 rounded-md text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Events</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Select which events trigger this webhook.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-1.5">
            {['order.created', 'order.paid', 'order.refunded', 'product.updated', 'inventory.low', 'review.submitted'].map((ev) => (
              <label key={ev} className="inline-flex items-center text-[11px] text-gray-700">
                <input type="checkbox" defaultChecked className="accent-black mr-1.5" />
                <span className="font-mono">{ev}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
