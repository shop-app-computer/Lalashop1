import React, { useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';

const StoreSettings = () => {
  const [logoEnabled, setLogoEnabled] = useState(true);

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700">
          Cancel
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-900">
          Save changes
        </button>
      </div>

      {/* General */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">General</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Public-facing identifiers and copy for your storefront.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Store name</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Shown in checkout, invoices, and search results.</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              defaultValue="Lala Premium Global"
              className="w-full px-3 py-1.5 rounded-md text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Store URL</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Slug used for your public storefront link.</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center">
              <span className="px-3 py-1.5 rounded-l-md text-xs text-gray-500 font-mono">lalashop.com/</span>
              <input
                type="text"
                defaultValue="lala-premium"
                className="flex-1 px-3 py-1.5 rounded-r-md text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Description</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Short summary shown on the store profile and meta tags.</p>
          </div>
          <div className="md:col-span-2">
            <textarea
              defaultValue="Premium wholesale and lifestyle goods curated for SEA-Pacific buyers. Verified factories, regional fulfillment."
              className="w-full px-3 py-1.5 rounded-md text-xs min-h-[80px] resize-y"
            />
            <p className="text-[10px] text-gray-400 mt-1">Recommended: under 160 characters for SEO previews.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Default language</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Primary language for product copy.</p>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <select className="w-full px-3 py-1.5 rounded-md text-xs appearance-none pr-8">
                <option>English (en-US)</option>
                <option>Lao (lo-LA)</option>
                <option>Thai (th-TH)</option>
                <option>Vietnamese (vi-VN)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Branding</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Visual identity assets used across storefront surfaces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Store logo</label>
            <p className="text-[11px] text-gray-500 mt-0.5">PNG or JPG, square. Min 512x512px.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block rounded-md p-4 text-[11px] text-gray-500 text-center cursor-pointer">
              <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
              Drop a file here or click to upload
              <input type="file" className="hidden" accept="image/png,image/jpeg" />
            </label>
            <label className="inline-flex items-center mt-2 text-[11px] text-gray-700">
              <input type="checkbox" defaultChecked={logoEnabled} onChange={(e) => setLogoEnabled(e.target.checked)} className="accent-black mr-1.5" />
              Show logo in checkout email header
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Banner image</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Wide hero image for the storefront. 1600x600 recommended.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block rounded-md p-4 text-[11px] text-gray-500 text-center cursor-pointer">
              <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
              Upload banner
              <input type="file" className="hidden" accept="image/*" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Brand color</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Used for buttons and accents on the storefront.</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                defaultValue="#111111"
                className="w-9 h-8 rounded-md cursor-pointer"
              />
              <input
                type="text"
                defaultValue="#111111"
                className="w-32 px-3 py-1.5 rounded-md text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Contact</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">How customers can reach support and where invoices originate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Support email</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Used in transactional email reply-to.</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="email"
              defaultValue="support@lalashop.com"
              className="w-full px-3 py-1.5 rounded-md text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Phone</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Include country code.</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="tel"
              defaultValue="+856 20 5511 8892"
              className="w-full px-3 py-1.5 rounded-md text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Business address</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Used on invoices and customs documents.</p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <input
              type="text"
              placeholder="Street"
              defaultValue="Ban Phonsavanh, Saysettha District"
              className="w-full px-3 py-1.5 rounded-md text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                defaultValue="Vientiane"
                className="w-full px-3 py-1.5 rounded-md text-xs"
              />
              <input
                type="text"
                placeholder="Postal code"
                defaultValue="01000"
                className="w-full px-3 py-1.5 rounded-md text-xs"
              />
            </div>
            <div className="relative">
              <select className="w-full px-3 py-1.5 rounded-md text-xs appearance-none pr-8">
                <option>Lao PDR</option>
                <option>Thailand</option>
                <option>Vietnam</option>
                <option>Cambodia</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tax info */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Tax information</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Required for invoice generation and cross-border settlement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Tax registration ID</label>
            <p className="text-[11px] text-gray-500 mt-0.5">VAT, GST, or local equivalent.</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              defaultValue="LA-1102-883920"
              className="w-full px-3 py-1.5 rounded-md text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Country of registration</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Where your tax ID is issued.</p>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <select className="w-full px-3 py-1.5 rounded-md text-xs appearance-none pr-8">
                <option>Lao PDR</option>
                <option>Thailand</option>
                <option>Vietnam</option>
                <option>Singapore</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Charge tax on shipping</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Apply local tax rates to shipping line items.</p>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center text-[11px] text-gray-700">
              <input type="checkbox" defaultChecked className="accent-black mr-1.5" />
              Enable shipping tax
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
