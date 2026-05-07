import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

const Settings = () => {
  const settings = [
    { key: 'site_name', value: 'LalaShop Admin', group: 'general', description: 'Public title for the admin dashboard' },
    { key: 'api_endpoint', value: 'http://localhost:5000/api', group: 'network', description: 'Core backend service address' },
    { key: 'maintenance_mode', value: 'false', group: 'system', description: 'Toggle public access to storefront' },
    { key: 'default_currency', value: 'THB (฿)', group: 'localization', description: 'Default currency for all transactions' },
    { key: 'admin_email', value: 'support@lala.shop', group: 'security', description: 'Main contact for system notifications' },
  ];

  const groupBadge: Record<string, string> = {
    general: 'bg-blue-50 text-blue-700',
    network: 'bg-purple-50 text-purple-700',
    system: 'bg-orange-50 text-orange-700',
    localization: 'bg-green-50 text-green-700',
    security: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center hover:bg-gray-100">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Defaults
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Save className="w-3.5 h-3.5 mr-1.5" /> Save All Changes
        </button>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Config Key</th>
                <th className="px-4 py-2 text-left font-semibold">Current Value</th>
                <th className="px-4 py-2 text-left font-semibold">Group</th>
                <th className="px-4 py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.key}>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-700">{s.key}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      defaultValue={s.value}
                      className="w-full bg-gray-50 border border-gray-100 px-3 py-1.5 rounded outline-none focus:border-primary text-[12px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${groupBadge[s.group] || 'bg-gray-100 text-gray-600'}`}>
                      {s.group}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[12px]">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
