import React, { useState } from 'react';
import {
  Search, Filter, ChevronDown, Download, Upload, Edit, Plus, RefreshCw,
} from 'lucide-react';

type StockTab = 'all' | 'in' | 'low' | 'out';

interface Item {
  id: number;
  sku: string;
  name: string;
  warehouse: string;
  onHand: number;
  incoming: number;
  reserved: number;
  reorder: number;
  lastRestock: string;
}

const items: Item[] = [
  { id: 1, sku: 'LSO-BAG-001', name: 'Premium Leather Bag', warehouse: 'WH-A · Bin 102', onHand: 5, incoming: 50, reserved: 1, reorder: 10, lastRestock: 'Apr 12' },
  { id: 2, sku: 'LSO-EAR-202', name: 'Wireless Bluetooth Earbuds', warehouse: 'WH-A · Bin 204', onHand: 1200, incoming: 0, reserved: 84, reorder: 200, lastRestock: 'Apr 22' },
  { id: 3, sku: 'LSO-CLK-99', name: 'Minimalist Wall Clock', warehouse: 'WH-B · Bin 011', onHand: 2, incoming: 30, reserved: 0, reorder: 5, lastRestock: 'Mar 28' },
  { id: 4, sku: 'LSO-TSH-01', name: 'Organic Cotton T-Shirt', warehouse: 'WH-A · Bin 318', onHand: 0, incoming: 500, reserved: 0, reorder: 100, lastRestock: 'Mar 04' },
  { id: 5, sku: 'LSO-MUG-22', name: 'Ceramic Pour-Over Set', warehouse: 'WH-B · Bin 044', onHand: 87, incoming: 0, reserved: 6, reorder: 25, lastRestock: 'Apr 18' },
];

interface ItemRow extends Item {
  available: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const STATUS_BADGE: Record<ItemRow['status'], string> = {
  'In Stock': 'bg-green-50 text-green-700',
  'Low Stock': 'bg-orange-50 text-orange-700',
  'Out of Stock': 'bg-red-50 text-red-700',
};

const enrich = (i: Item): ItemRow => {
  const available = Math.max(0, i.onHand - i.reserved);
  let status: ItemRow['status'];
  if (i.onHand === 0) status = 'Out of Stock';
  else if (i.onHand <= i.reorder) status = 'Low Stock';
  else status = 'In Stock';
  return { ...i, available, status };
};

const TABS: { key: StockTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in', label: 'In Stock' },
  { key: 'low', label: 'Low Stock' },
  { key: 'out', label: 'Out of Stock' },
];

const Inventory = () => {
  const [tab, setTab] = useState<StockTab>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const rows = items.map(enrich);
  const totalUnits = rows.reduce((s, r) => s + r.onHand, 0);
  const lowCount = rows.filter((r) => r.status === 'Low Stock').length;
  const outCount = rows.filter((r) => r.status === 'Out of Stock').length;
  const incomingTotal = rows.reduce((s, r) => s + r.incoming, 0);

  const counts: Record<StockTab, number> = {
    all: rows.length,
    in: rows.filter((r) => r.status === 'In Stock').length,
    low: lowCount,
    out: outCount,
  };

  const filtered = tab === 'all'
    ? rows
    : rows.filter((r) =>
        tab === 'in' ? r.status === 'In Stock' : tab === 'low' ? r.status === 'Low Stock' : r.status === 'Out of Stock',
      );

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Upload className="w-3.5 h-3.5 mr-1.5" /> Import CSV
        </button>
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Adjust Stock
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Inventory Value</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">$124,500.80</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total Units</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Low Stock</p>
          <p className="text-xl font-bold text-orange-700 tabular-nums mt-1">{lowCount}</p>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Incoming</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{incomingTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                tab === t.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {t.label}
              <span className="ml-1 text-[10px] text-gray-400 tabular-nums">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Warehouse <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Category <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>
        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU, bin, warehouse…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* Stock table */}
      <div className="rounded-lg overflow-hidden">
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 text-[11px]">
            <span className="font-semibold text-gray-900 tabular-nums">{selected.size} selected</span>
            <span className="text-gray-300">·</span>
            <button className="font-medium text-gray-700 hover:text-black">Adjust Stock</button>
            <button className="font-medium text-gray-700 hover:text-black">Transfer</button>
            <button className="font-medium text-gray-700 hover:text-black">Set Reorder</button>
            <button className="font-medium text-gray-700 hover:text-black">Export</button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-gray-500 hover:text-black">Clear</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] tabular-nums">
            <thead className="text-[11px] text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left font-semibold w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-2 text-left font-semibold">SKU</th>
                <th className="px-4 py-2 text-left font-semibold">Item</th>
                <th className="px-4 py-2 text-right font-semibold">On Hand</th>
                <th className="px-4 py-2 text-right font-semibold">Reserved</th>
                <th className="px-4 py-2 text-right font-semibold">Available</th>
                <th className="px-4 py-2 text-right font-semibold">Incoming</th>
                <th className="px-4 py-2 text-right font-semibold">Reorder At</th>
                <th className="px-4 py-2 text-left font-semibold">Last Restock</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {filtered.map((r) => (
                <tr key={r.id} className="">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{r.sku}</td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <p className="text-[11px] text-gray-500">{r.warehouse}</p>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{r.onHand.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{r.reserved}</td>
                  <td className="px-4 py-2 text-right text-gray-900">{r.available.toLocaleString()}</td>
                  <td className={`px-4 py-2 text-right ${r.incoming > 0 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                    {r.incoming > 0 ? `+${r.incoming}` : '—'}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{r.reorder}</td>
                  <td className="px-4 py-2 text-gray-700">{r.lastRestock}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_BADGE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Adjust">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1" title="Restock">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-500">
          <span>Showing 1–{filtered.length} of {rows.length} items</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 cursor-not-allowed">Prev</button>
            <button className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
