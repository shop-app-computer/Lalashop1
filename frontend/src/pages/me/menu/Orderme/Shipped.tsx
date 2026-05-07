"use client";
import React from "react";

export default function Shipped() {
  return (
    <div className="flex flex-col gap-2">
      {[1].map((i) => (
        <div key={i} className="bg-white p-4 border-y border-[#EEEEEE] flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#F8F8F8]">
            <span className="text-[13px] font-bold text-gray-500 italic">SN-LOGI-2024-00{i}</span>
            <span className="text-[13px] font-medium text-[#00aeff]">Shipped</span>
          </div>
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-[#F8F8F8] rounded-md overflow-hidden flex-shrink-0">
              <img src={`https://picsum.photos/seed/shipped${i}/200/200`} className="w-full h-full object-cover" alt="product" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-[#111111] line-clamp-1 uppercase">In Transit Product {i}</h4>
              <div className="flex justify-between items-end">
                <span className="text-[12px] text-[#888888]">Quantity: 1</span>
                <span className="text-[14px] font-bold">฿1,250.00</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#F8F8F8]">
            <button className="w-full py-2 border border-[#00aeff] text-[#00aeff] rounded-full text-[13px] font-medium active:bg-blue-50">
              Check Delivery Status
            </button>
            <button className="w-full py-2 border border-[#DDDDDD] rounded-full text-[13px] font-medium active:bg-gray-50 text-gray-600">
              Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}