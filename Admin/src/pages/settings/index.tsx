import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const SettingsPage = () => (
  <div className="space-y-4 text-sm">
    <div className="rounded-lg bg-gray-50 px-6 py-12 text-center">
      <SettingsIcon className="w-7 h-7 text-gray-300 mx-auto mb-3" />
      <h2 className="text-[13px] font-semibold text-gray-700">Platform settings module coming soon</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">
        Site-wide settings (maintenance mode, default currency, API endpoints, etc.) will be
        configurable from this page once the Settings model is added to the backend.
      </p>
    </div>
  </div>
);

export default SettingsPage;
