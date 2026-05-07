import React from 'react';
import { Send } from 'lucide-react';

const SendTab = () => (
  <div className="max-w-3xl py-6">
    <div className="space-y-5">
      <label className="block">
        <span className="text-[11px] font-semibold text-gray-500 tracking-wide">TITLE</span>
        <input
          placeholder="Notification title..."
          className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-semibold text-gray-500 tracking-wide">MESSAGE</span>
        <textarea
          rows={4}
          placeholder="Write your notification message..."
          className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-semibold text-gray-500 tracking-wide">URL (OPTIONAL)</span>
        <input
          placeholder="https://app.lalashop.com/..."
          className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </label>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100">
          Save Draft
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Send Notification
        </button>
      </div>
    </div>
  </div>
);

export default SendTab;
