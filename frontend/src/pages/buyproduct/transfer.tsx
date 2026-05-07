"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft, Copy, Clock, CheckCircle2,
  Download, Upload, Info, X, FileText
} from "lucide-react";
import { useRouter } from "next/router";
import { apiClient } from "@/services/apiClient";

export default function TransferPage() {
  const router = useRouter();
  const { query } = router;
  const [mounted, setMounted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // 1. Create a pending order as soon as the user reaches this page
  useEffect(() => {
    if (!mounted || orderId || (query && query.orderId)) {
      if (query && query.orderId) setOrderId(query.orderId as string);
      return;
    }

    const createPendingOrder = async () => {
      if (isCreating) return;
      setIsCreating(true);
      try {
        let orderItems = [];
        if (query.name) {
          orderItems = [{
            name: String(query.name),
            qty: parseInt(String(query.qty || "1")),
            image: String(query.image),
            description: String(query.description || ""), // Pass description
            price: parseFloat(String(query.price || "0")),
            product: String(query.id || query._id),
            seller: String(query.seller || "65604fc8b05535681de3093b")
          }];
        } else {
          try {
            const cartData = await apiClient("/cart");
            if (cartData.success) {
              orderItems = cartData.cart.items.map((item: any) => ({
                name: item.product.name,
                qty: item.qty,
                image: item.product.image,
                description: item.product.description || "", // Pass description
                price: item.unitPrice,
                product: item.productId,
                seller: item.seller || "65604fc8b05535681de3093b"
              }));
            }
          } catch (err) {
            console.error("Cart fetch failed:", err);
          }
        }

        if (orderItems.length === 0) return;

        let shippingAddress = { fullName: "Guest", phone: "000", address: "Unknown" };
        try {
          const addrData = await apiClient("/address/me");
          if (addrData) {
            shippingAddress = {
              fullName: addrData.recipientName,
              phone: addrData.phoneNumber,
              address: `${addrData.village}, ${addrData.district}, ${addrData.province}`
            };
          }
        } catch (err) { console.warn("Using guest address"); }

        const response = await apiClient("/orders", {
          method: "POST",
          body: JSON.stringify({
            orderItems,
            shippingAddress,
            paymentMethod: String(query.method || "Bank Transfer"),
            totalPrice: orderDetails.total,
          })
        });

        if (response.success) {
          setOrderId(response.order._id);
          if (!query.name) {
             await apiClient("/cart", { method: "DELETE" }).catch(() => {});
          }
        }
      } catch (error) {
        console.error("Auto Order Creation Error:", error);
      } finally {
        setIsCreating(false);
      }
    };

    createPendingOrder();
  }, [mounted, query, orderId, isCreating]);

  const orderDetails = useMemo(() => {
    if (query.total) return { total: parseFloat(query.total as string) };
    const price = parseFloat((query.price as string) || "0");
    const qty = parseInt((query.qty as string) || "1");
    return { total: price * qty };
  }, [query]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!mounted) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirmOrder = async () => {
    if (!orderId) {
       alert("Order not yet initialized. Please wait a moment.");
       return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient(`/orders/${orderId}/pay`, {
        method: "PUT"
      });

      if (response.success) {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => { if (v) params.append(k, v as string); });
        if (previewUrl) params.set("slip", previewUrl);
        params.set("orderId", orderId);
        router.push(`/buyproduct/receipt?${params.toString()}`);
      }
    } catch (error) {
      console.error("Order Payment Error:", error);
      alert("Failed to confirm payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    const qrUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "LalaShop_QR_Payment.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      window.open(qrUrl, "_blank");
    }
  };

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft <= 120 && timeLeft > 0;

  const paymentMethodData: Record<string, any> = {
    bcel_one: {
      name: "BCEL One Pay",
      account: "160-12-00-123456-001",
      bank: "Banque Pour Le Commerce Exterieur Lao",
      image: "/assets/BCELone.png",
      short: "BCEL"
    },
    LDB: {
      name: "LDB Trust",
      account: "010-21-00-987654-001",
      bank: "Lao Development Bank",
      image: "/assets/LDB.png",
      short: "LDB"
    },
    JDB: {
      name: "JDB Pay",
      account: "050-31-00-112233-001",
      bank: "Joint Development Bank",
      image: "/assets/JDB.png",
      short: "JDB"
    },
    card: {
      name: "Credit / Debit Card",
      account: "Pay via Gateway",
      bank: "Stripe / 2C2P",
      image: "/assets/Mastercard.png",
      short: "CARD"
    },
    cod: {
      name: "Cash on Delivery",
      account: "Pay at Doorstep",
      bank: "COD Service",
      image: "/assets/cod.png",
      short: "COD"
    }
  };

  const selectedMethod = paymentMethodData[query.method as string] || {
    name: "Kasikornbank (K-Bank)",
    account: "092-1-XXX88-0",
    bank: "Kasikornbank",
    image: "/assets/cod.png",
    short: "KBNK"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="ml-2 text-base font-bold text-gray-900">Confirm Bank Transfer</h1>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:px-6 pb-32 lg:pb-10 space-y-5">
        <div className={`rounded-2xl p-4 flex items-center justify-between border transition-colors ${isExpired ? "bg-red-50 border-red-200" : isUrgent ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-100"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm ${isExpired ? "text-red-500" : isUrgent ? "text-orange-500" : "text-blue-500"}`}>
              <Clock size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium truncate">{isExpired ? "Session expired" : "Please pay within"}</p>
              <p className={`text-base font-bold ${isExpired ? "text-red-500" : isUrgent ? "text-orange-500" : "text-blue-600"}`}>
                {isExpired ? "—" : `${formatTime(timeLeft)} minutes`}
              </p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="p-2 border-4 border-gray-100 rounded-2xl shadow-sm inline-block">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 block" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold tracking-widest mb-1">Amount to transfer</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">฿{orderDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          </div>
          <button onClick={downloadQRCode} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 active:scale-95 rounded-full text-xs font-bold text-gray-700 transition-all border border-gray-200">
            <Download size={14} /> Save QR Code
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Bank Account Details</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md tracking-wide">Recommended</span>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100 overflow-hidden">
                <img src={selectedMethod.image} alt={selectedMethod.short} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">{selectedMethod.bank}</p>
                <p className="text-base font-bold tracking-widest text-gray-900 mt-0.5">{selectedMethod.account}</p>
              </div>
              <button onClick={() => copyToClipboard(selectedMethod.account.replace(/-/g, ""))} className={`p-2.5 rounded-xl transition-all shrink-0 ${copied ? "bg-emerald-50 text-emerald-500" : "hover:bg-blue-50 text-blue-500"}`}>
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-4">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Account Name</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">lalashop International Co., Ltd.</p>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Upload Transfer Proof</h3>
          {!previewUrl ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 hover:bg-blue-50/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Upload size={22} /></div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Click to upload slip</p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, JPEG</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={previewUrl} alt="Slip Preview" className="w-full h-auto max-h-72 sm:max-h-96 object-contain bg-gray-50" />
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><X size={16} /></button>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </section>

        <button 
          disabled={!selectedFile || isExpired} 
          onClick={handleConfirmOrder} 
          className={`w-full font-bold py-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98] ${selectedFile && !isExpired ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          <CheckCircle2 size={18} /> Confirm and Submit Proof
        </button>
      </main>
    </div>
  );
}