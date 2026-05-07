import React from 'react';
import { Plus, ChevronDown, MoreHorizontal } from 'lucide-react';

type ZoneStatus = 'active' | 'inactive';

interface Zone {
  id: string;
  name: string;
  regions: string;
  methods: number;
  status: ZoneStatus;
}

interface Rate {
  id: string;
  zone: string;
  method: string;
  price: string;
  eta: string;
}

const zones: Zone[] = [
  { id: 'z-vt', name: 'Vientiane Capital', regions: 'VT, Saysettha, Sikhottabong', methods: 3, status: 'active' },
  { id: 'z-north', name: 'Northern Provinces', regions: 'LP, OD, PSL +5', methods: 2, status: 'active' },
  { id: 'z-south', name: 'Southern Provinces', regions: 'CHA, SVN, SLV +3', methods: 2, status: 'active' },
  { id: 'z-intl-th', name: 'Thailand (Intl)', regions: 'TH (all)', methods: 2, status: 'active' },
  { id: 'z-intl-vn', name: 'Vietnam (Intl)', regions: 'VN (all)', methods: 1, status: 'inactive' },
];

const rates: Rate[] = [
  { id: 'r-1', zone: 'Vientiane Capital', method: 'Standard (Anousith)', price: '15,000 LAK', eta: '1–2 days' },
  { id: 'r-2', zone: 'Vientiane Capital', method: 'Express (HAL Same-day)', price: '35,000 LAK', eta: 'Same day' },
  { id: 'r-3', zone: 'Northern Provinces', method: 'Standard', price: '35,000 LAK', eta: '3–5 days' },
  { id: 'r-4', zone: 'Southern Provinces', method: 'Standard', price: '32,000 LAK', eta: '3–5 days' },
  { id: 'r-5', zone: 'Thailand (Intl)', method: 'Cross-border Std', price: '180,000 LAK', eta: '5–8 days' },
];

const StatusBadge = ({ status }: { status: ZoneStatus }) => {
  const cls = status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600';
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${cls}`}>{status === 'active' ? 'Active' : 'Inactive'}</span>;
};

const ShippingSettings = () => {
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

      {/* Shipping zones table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-black">Shipping zones</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Geographic groups that share shipping methods and rates.</p>
          </div>
          <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add zone
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Zone</th>
                <th className="px-4 py-2 text-left font-semibold">Regions</th>
                <th className="px-4 py-2 text-right font-semibold">Methods</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {zones.map((z) => (
                <tr key={z.id} className="">
                  <td className="px-4 py-2 font-medium text-gray-900">{z.name}</td>
                  <td className="px-4 py-2 text-gray-600">{z.regions}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{z.methods}</td>
                  <td className="px-4 py-2"><StatusBadge status={z.status} /></td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-[11px] font-semibold text-gray-700 hover:underline mr-3">Edit</button>
                    <button className="text-[11px] font-semibold text-red-600 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Default rates table */}
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-black">Default rates</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Flat-rate fallbacks applied when no carrier API quote is available.</p>
          </div>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add rate
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Zone</th>
                <th className="px-4 py-2 text-left font-semibold">Method</th>
                <th className="px-4 py-2 text-right font-semibold">Price</th>
                <th className="px-4 py-2 text-left font-semibold">ETA</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {rates.map((r) => (
                <tr key={r.id} className="">
                  <td className="px-4 py-2 font-medium text-gray-900">{r.zone}</td>
                  <td className="px-4 py-2 text-gray-700">{r.method}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{r.price}</td>
                  <td className="px-4 py-2 text-gray-600">{r.eta}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-[11px] font-semibold text-gray-700 hover:underline mr-3">Edit</button>
                    <button className="text-[11px] font-semibold text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Free shipping threshold */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Free shipping</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Automatic discount applied to orders over a configured subtotal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Enable</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Toggle the storefront promotion banner.</p>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center text-[11px] text-gray-700">
              <input type="checkbox" defaultChecked className="accent-black mr-1.5" />
              Free shipping enabled site-wide
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Threshold</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Order subtotal at which shipping becomes free.</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={500000}
                className="w-40 px-3 py-1.5 rounded-md text-xs font-mono"
              />
              <div className="relative">
                <select className="px-3 py-1.5 rounded-md text-xs appearance-none pr-8">
                  <option>LAK</option>
                  <option>THB</option>
                  <option>USD</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Applies to zones</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Limit the discount to specific shipping zones.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-1.5">
            {zones.map((z) => (
              <label key={z.id} className="inline-flex items-center text-[11px] text-gray-700">
                <input type="checkbox" defaultChecked={z.status === 'active'} className="accent-black mr-1.5" />
                {z.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Packaging defaults */}
      <div className="rounded-lg">
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-black">Packaging defaults</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Used when a SKU has no explicit packaging dimensions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Default weight</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Average parcel weight in grams.</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={500}
                className="w-32 px-3 py-1.5 rounded-md text-xs font-mono"
              />
              <span className="text-[11px] text-gray-500">grams</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Default dimensions</label>
            <p className="text-[11px] text-gray-500 mt-0.5">L × W × H in centimeters.</p>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="number" defaultValue={20} className="w-20 px-3 py-1.5 rounded-md text-xs font-mono" />
            <span className="text-[11px] text-gray-400">×</span>
            <input type="number" defaultValue={15} className="w-20 px-3 py-1.5 rounded-md text-xs font-mono" />
            <span className="text-[11px] text-gray-400">×</span>
            <input type="number" defaultValue={8} className="w-20 px-3 py-1.5 rounded-md text-xs font-mono" />
            <span className="text-[11px] text-gray-500 ml-1">cm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-gray-900">Insurance</label>
            <p className="text-[11px] text-gray-500 mt-0.5">Auto-insure parcels above a configured value.</p>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center text-[11px] text-gray-700">
              <input type="checkbox" defaultChecked className="accent-black mr-1.5" />
              Auto-insure parcels over 1,000,000 LAK
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettings;
