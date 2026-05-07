"use client";
import React, { useState } from "react";
import {
  Info, ChevronLeft,
   ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const mockData = [
  { name: '00:00', value: 400 },
  { name: '04:00', value: 300 },
  { name: '08:00', value: 900 },
  { name: '12:00', value: 1500 },
  { name: '16:00', value: 2400 },
  { name: '20:00', value: 1800 },
  { name: '23:59', value: 1200 },
];

export default function AttrView({ onBack }: { onBack: () => void }) {
  const [timeRange, setTimeRange] = useState("today");

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#121212] antialiased">
      {/* Navigation Bar - Full width & TikTok Style */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#EEEEEE] flex items-center justify-between h-[52px] px-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="active:opacity-50 transition-opacity -ml-1">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">Balance</h1>
        </div>
      </nav>

      <main className="w-full pb-20">
        {/* Time Filter - Sharp edges 100% per design */}
        <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-[#EEEEEE]">
          {["today", "7d", "30d", "custom"].map((id) => (
            <button
              key={id}
              onClick={() => setTimeRange(id)}
              className={`px-5 py-2 text-[13px] rounded-2xl font-bold transition-all shrink-0 ${timeRange === id
                ? "bg-black text-white border border-black" // Selected button: Black background, Black border
                : "bg-white text-[#86878B] border border-[#EEEEEE]" // Normal button: White background, Gray border
                }`}
            // Removed style={{ borderRadius: '0px' }}
            >
              {id === "today" ? "Today" : id === "7d" ? "7 Days" : id === "30d" ? "30 Days" : "Custom"}
            </button>
          ))}
        </div>

        {/* Metric Grid - Full width 2x2 with sharp dividers */}
        <div className="bg-white grid grid-cols-2 border-b border-[#EEEEEE]">
          <MetricItem title="Total Revenue" value="฿0" percent="+18.2" isFirst />
          <MetricItem title="Orders" value="1,284" percent="+5.4" />
          <MetricItem title="CTR" value="4.2%" percent="-0.8" isFirst />
          <MetricItem title="Total Products" value="850" />
        </div>

        {/* Chart Section - Full width, Sharp corners */}
        <div className="bg-white mt-2 border-y border-[#EEEEEE] py-6 px-4"> 
          <div className="flex justify-between items-center mb-6 px-1">
            <div>
              <h3 className="text-[14px] font-bold">Revenue Trend</h3>
              <p className="text-[11px] text-[#86878B]">Last updated: 5 minutes ago</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00aeff]">
              <div className="w-2 h-2 rounded-full bg-[#00aeff] animate-pulse"></div>
              LIVE
            </div>
          </div>

          <div className="h-[220px] w-full -ml-4"> {/* Shift left to make the chart look more full screen */}
            <ResponsiveContainer width="110%" height="100%">
              <AreaChart data={mockData} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00aeff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00aeff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#86878B' }}
                />
                <YAxis hide />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00aeff"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products - Sharp edges, Full width */}
        <div className="bg-white mt-2 border-y border-[#EEEEEE]">
          <div className="px-5 py-4 border-b border-[#F8F8F8] flex justify-between items-center">
            <h3 className="text-[14px] font-bold  tracking-tight">Best Sellers</h3>
            <ChevronRight size={18} className="text-[#C8C9CC]" />
          </div>
          <div className="divide-y divide-[#F8F8F8]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-5 flex items-center justify-between active:bg-[#FAFAFA]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#F5F5F5] flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${i}`} alt="product" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[14px] font-bold line-clamp-1">Premium Product Gen {i}</p>
                    <p className="text-[12px] text-[#86878B]">{120 * i} items sold</p>
                  </div>
                </div>
                <div className="text-right text-[13px] font-bold">
                  ฿2,400
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricItem({ title, value, percent, isFirst }: any) {
  const isPositive = percent && percent.startsWith('+');
  return (
    <div className={`p-5 space-y-2 ${isFirst ? 'border-r border-[#EEEEEE]' : ''}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[#86878B]  tracking-wider">{title}</span>
        <Info size={13} className="text-[#C8C9CC]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[24px] font-bold leading-tight">{value}</span>
        {percent && (
          <div className={`text-[12px] font-bold mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {percent}% <span className="text-[#C8C9CC] font-normal ml-1">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
}