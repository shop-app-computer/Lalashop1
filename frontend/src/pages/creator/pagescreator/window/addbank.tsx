import React, { useState } from "react";
import {
  ChevronLeft, Info, ChevronDown, Check,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { laoBanks } from "@/pages/me/opensho/constants";

// 1. เพิ่ม onSuccess ใน Interface
interface AddAccountProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddBankAccount({ onBack, onSuccess }: AddAccountProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // 2. เพิ่ม State สำหรับเก็บข้อมูลฟอร์ม
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Same canonical Lao bank list used by the shop opening Step 2 form so
  // creator and seller flows produce consistent bankName values across the
  // platform.
  const banks = laoBanks;

  const handleSubmit = async () => {
    if (!selectedBank || !accountName || !accountNumber) {
      alert("Please fill in all information");
      return;
    }

    setLoading(true);
    try {
      await apiClient("/bank/add", {
        method: "POST",
        body: JSON.stringify({
          bankName: selectedBank,
          accountNumber: accountNumber,
          accountName: accountName,
        }),
      });

      onSuccess(); // เมื่อสำเร็จ เรียกฟังก์ชันนี้เพื่อให้หน้าแม่โหลดข้อมูลใหม่
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#121212] antialiased">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#EEEEEE] flex items-center h-[52px] px-4">
        <button onClick={onBack} className="active:opacity-50 transition-opacity -ml-1">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="ml-3 text-[17px] font-bold tracking-tight">add bank account</h1>
      </nav>

      <main className="w-full">
        <div className="px-5 py-3 bg-[#FFFBE6] border-b border-[#FFE58F] flex gap-2">
          <Info size={16} className="text-[#FAAD14] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#856404] leading-relaxed">
            bank account name must match registered name to prevent transfer errors
          </p>
        </div>

        <div className="mt-2 bg-white border-y border-[#EEEEEE]">
          {/* Full Name Input */}
          <div className="px-5 py-4 border-b border-[#F8F8F8]">
            <label className="text-[12px] font-bold text-[#86878B] tracking-wider block mb-2 ">
              full name (english)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="bank account name"
                className="w-full py-1 text-[15px] font-medium outline-none placeholder:text-[#C8C9CC]"
              />
            </div>
          </div>

          {/* Bank Selection */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-5 py-5 flex items-center justify-between active:bg-[#FAFAFA] border-b border-[#F8F8F8]"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start text-left">
                <span className="text-[12px] font-bold text-[#86878B] tracking-wider ">bank</span>
                <span className={`text-[15px] font-medium text-left ${selectedBank ? "text-[#121212]" : "text-[#C8C9CC]"}`}>
                  {selectedBank || "select bank"}
                </span>
              </div>
            </div>
            <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Bank List — scrollable since the canonical list has 25 entries */}
          {isOpen && (
            <div className="bg-[#FBFBFB] border-b border-[#F8F8F8] animate-in slide-in-from-top-2 duration-200 max-h-[320px] overflow-y-auto">
              {banks.map((bank) => (
                <div
                  key={bank}
                  onClick={() => {
                    setSelectedBank(bank);
                    setIsOpen(false);
                  }}
                  className="px-14 py-4 flex items-center justify-between active:bg-[#F0F7FF] cursor-pointer border-b border-[#F5F5F5] last:border-none"
                >
                  <span className={`text-[14px] font-medium ${selectedBank === bank ? "text-[#0077b6]" : "text-[#555555]"}`}>
                    {bank}
                  </span>
                  {selectedBank === bank && <Check size={18} className="text-[#0077b6]" />}
                </div>
              ))}
            </div>
          )}

          {/* Account Number Input */}
          <div className="px-5 py-4">
            <label className="text-[12px] font-bold text-[#86878B] tracking-wider block mb-2 ">
              bank account number
            </label>
            <div className="flex items-center gap-3">
              
              <input
                type="text" // เปลี่ยนเป็น text เพื่อรักษาเลข 0 ตัวหน้า
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter 12-digit account number"
                className="w-full py-1 text-[16px] font-bold outline-none placeholder:font-normal placeholder:text-[#C8C9CC]"
              />
            </div>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="px-5 mt-10 pb-10">
          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`w-full ${loading ? "bg-gray-400" : "bg-[#0077b6]"} text-white font-bold py-3.5 text-[15px] active:opacity-90 transition-all shadow-lg shadow-blue-100`}
          >
            {loading ? "Saving..." : "submit and save"}
          </button>
          <p className="mt-4 text-[11px] text-[#86878B] text-center leading-relaxed px-4">
            by confirming, you agree to the <span className="text-[#121212] font-bold">transfer terms</span> and allow the system to store bank info for payments
          </p>
        </div>
      </main>
    </div>
  );
}