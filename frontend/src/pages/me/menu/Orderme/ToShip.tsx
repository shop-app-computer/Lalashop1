"use client";
import React from "react";

export default function ToShip() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-4 border-y border-[#EEEEEE] flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#F8F8F8]">
            <span className="text-[13px] font-bold text-gray-500 italic">SN-SHIP-2024-00{i}</span>
            <span className="text-[13px] font-medium text-[#00aeff]">To Ship</span>
          </div>
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-[#F8F8F8] rounded-md overflow-hidden flex-shrink-0">
              <img src={`https://picsum.photos/seed/toship${i}/200/200`} className="w-full h-full object-cover" alt="product" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-[#111111] line-clamp-1 uppercase">Ready to Ship Item {i}</h4>
              <div className="flex justify-between items-end">
                <span className="text-[12px] text-[#888888]">Quantity: 1</span>
                <span className="text-[14px] font-bold">฿2,450.00</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#F8F8F8]">
            <button className="px-5 py-1.5 border border-[#DDDDDD] rounded-full text-[13px] font-medium active:bg-gray-50">
              Print Label
            </button>
            <button className="px-5 py-1.5 bg-[#00aeff] text-white rounded-full text-[13px] font-medium active:opacity-80">
              Ship Product
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}