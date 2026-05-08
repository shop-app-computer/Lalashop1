import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Clock,
  Info,
  ChevronRight,
  HelpCircle,
  CheckCircle,
  Plus,
  Landmark,
  History,
  Shield,
  X,
  Scan,
} from "lucide-react";
import AddBankAccount from "@/pages/creator/pagescreator/window/addbank";
import { apiClient } from "@/services/apiClient";

interface WithdrawProps {
  onBack: () => void;
}

interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
}

interface Transaction {
  _id: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "pending" | "approved" | "completed" | "rejected" | "failed";
  bankAccount: BankAccount;
  createdAt: string;
}

interface WithdrawRules {
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  flatFee: number;
  processingDays: number;
  currency: string;
}

// Subset of the KYC submission we actually render — shop name + shop account
// (a.k.a. the shop's public handle) come from the seller's onboarding form.
interface KycShopInfo {
  shopName?: string;
  shopAccount?: string;
  shopCategory?: string;
  shopEmail?: string;
}

const PENDING_STATUSES = new Set(["pending", "approved"]);

export default function ShopWithdraw({ onBack }: WithdrawProps) {
  const [view, setView] = useState<"main" | "addAccount" | "selectBank" | "history">("main");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [posRevenue, setPosRevenue] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasWithdrawPin, setHasWithdrawPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [rules, setRules] = useState<WithdrawRules | null>(null);
  const [historyTab, setHistoryTab] = useState<"pending" | "history">("pending");
  const [shopInfo, setShopInfo] = useState<KycShopInfo | null>(null);

  const fetchBankData = async () => {
    try {
      const data = await apiClient("/bank/me");
      if (data.success) {
        setBankAccounts(data.data);
        if (data.data.length > 0 && !selectedBank) {
          setSelectedBank(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bank data:", error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const data = await apiClient("/withdraw/me");
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await apiClient("/auth/me");
      // /auth/me returns a flat envelope: { success, _id, name, balance, ... }
      // The previous resolver chain (`data?.data || data?.user || ...`) returned
      // undefined because none of those keys exist at the top level, so balance
      // stayed at 0. Pick the user fields directly from `data` if present.
      const profileData = data?.data || data?.user || data;
      if (profileData && (profileData._id || profileData.email)) {
        setBalance(Number(profileData.balance) || 0);
        setPosRevenue(Number(profileData.posRevenue) || 0);
        setHasWithdrawPin(!!profileData.hasWithdrawPin);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const data = await apiClient("/withdraw/rules");
      if (data.success) setRules(data.data);
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  const fetchKyc = async () => {
    // Pull the seller's KYC submission so we can show the registered shop
    // name + shop account on the withdrawal screens. If the user hasn't
    // completed KYC yet, the response is `{ data: null }` and we leave
    // shopInfo unset (the UI hides the shop card in that case).
    try {
      const data = await apiClient("/kyc/me");
      if (data?.success && data.data?.shopInfo) {
        setShopInfo(data.data.shopInfo);
      }
    } catch (error) {
      console.error("Failed to fetch KYC:", error);
    }
  };

  useEffect(() => {
    fetchBankData();
    fetchWithdrawals();
    fetchProfile();
    fetchRules();
    fetchKyc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingTxs = useMemo(
    () => transactions.filter((t) => PENDING_STATUSES.has(t.status)),
    [transactions]
  );
  const historyTxs = useMemo(
    () => transactions.filter((t) => !PENDING_STATUSES.has(t.status)),
    [transactions]
  );

  const initiateWithdrawal = () => {
    if (!hasWithdrawPin) {
      alert("Please set your 6-digit withdrawal PIN in Security Settings before withdrawing.");
      return;
    }
    if (!selectedBank) {
      alert("Please select a payment method");
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (rules && amount < rules.minAmount) {
      alert(`Minimum withdrawal is ${rules.minAmount} ${rules.currency}`);
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance");
      return;
    }
    setShowPinModal(true);
  };

  const handleWithdraw = async () => {
    if (pinInput.length !== 6) {
      alert("Please enter 6-digit PIN");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient("/withdraw/create", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          bankId: selectedBank?._id,
          pin: pinInput,
        }),
      });

      if (response.success) {
        alert("Withdrawal request submitted successfully!");
        setWithdrawAmount("");
        setPinInput("");
        setShowPinModal(false);
        await Promise.all([fetchWithdrawals(), fetchProfile()]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to withdraw. Please check your PIN.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchBankData();
    setView("main");
  };

  const cancelTransaction = async (id: string) => {
    if (!confirm("Cancel this withdrawal? Funds will be returned to your balance.")) return;
    try {
      await apiClient(`/withdraw/${id}/cancel`, { method: "PUT" });
      await Promise.all([fetchWithdrawals(), fetchProfile()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to cancel withdrawal";
      alert(message);
    }
  };

  if (view === "addAccount") {
    return <AddBankAccount onBack={() => setView("selectBank")} onSuccess={handleAddSuccess} />;
  }

  if (view === "selectBank") {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <div className="sticky top-0 z-50 bg-white flex items-center h-[56px] px-5 border-b border-[#EEEEEE]">
          <button onClick={() => setView("main")} className="active:opacity-50 transition-opacity -ml-1">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="ml-3 text-[16px] font-bold tracking-tight">select payment method</h1>
        </div>
        <div className="p-5 space-y-4">
          <button
            onClick={() => setView("addAccount")}
            className="w-full bg-white p-5 border-2 border-dashed border-[#EEEEEE] rounded-2xl flex items-center justify-center gap-2 text-[#00aeff] font-bold hover:bg-white/50 transition-colors"
          >
            <Plus size={20} /> Add New Bank Account
          </button>

          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <button
                key={account._id}
                onClick={() => {
                  setSelectedBank(account);
                  setView("main");
                }}
                className={`w-full p-5 bg-white border rounded-2xl flex flex-col items-start transition-all ${
                  selectedBank?._id === account._id
                    ? "border-[#00aeff] ring-1 ring-[#00aeff]"
                    : "border-[#EEEEEE]"
                }`}
              >
                <div className="flex justify-between w-full mb-2">
                  <span className="text-[11px] font-black text-[#00aeff] tracking-widest">{account.bankName}</span>
                  {selectedBank?._id === account._id && <CheckCircle size={18} className="text-[#00aeff]" />}
                </div>
                <p className="text-lg font-black tracking-widest font-mono">**** {account.accountNumber.slice(-4)}</p>
                <p className="text-[10px] font-bold text-[#86878B]">{account.accountName}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "history") {
    const list = historyTab === "pending" ? pendingTxs : historyTxs;
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <div className="sticky top-0 z-50 bg-white flex items-center h-[56px] px-5 border-b border-[#EEEEEE]">
          <button onClick={() => setView("main")} className="active:opacity-50 transition-opacity -ml-1">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="ml-3 text-[16px] font-bold tracking-tight">withdrawals</h1>
        </div>

        <div className="bg-white border-b border-[#EEEEEE] flex">
          {(["pending", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setHistoryTab(tab)}
              className={`flex-1 py-3 text-[13px] font-bold tracking-wide transition-colors relative ${
                historyTab === tab ? "text-[#121212]" : "text-[#86878B]"
              }`}
            >
              {tab === "pending" ? `Pending (${pendingTxs.length})` : `History (${historyTxs.length})`}
              {historyTab === tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#121212] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[#EEEEEE] bg-white">
          {list.length > 0 ? (
            list.map((tx) => (
              <div key={tx._id} className="p-5 flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold">฿{tx.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-[#86878B]">
                    {new Date(tx.createdAt).toLocaleString()} • {tx.bankAccount?.bankName}
                  </p>
                  {tx.fee > 0 && (
                    <p className="text-[10px] text-[#86878B] mt-0.5">
                      Fee ฿{tx.fee.toFixed(2)} → Net ฿{tx.netAmount.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full tracking-wider ${
                      tx.status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : tx.status === "pending" || tx.status === "approved"
                        ? "text-green-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {tx.status}
                  </span>
                  {tx.status === "pending" && (
                    <button
                      onClick={() => cancelTransaction(tx._id)}
                      className="text-[10px] font-bold text-[#FE2C55] active:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-[#86878B]">
              <History size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-[13px] font-bold tracking-widest">
                {historyTab === "pending" ? "No pending withdrawals" : "No history yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#121212] antialiased font-sans">
      <div className="sticky top-0 z-50 bg-white flex items-center justify-between h-[56px] px-5 border-b border-[#EEEEEE]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="active:opacity-50 transition-opacity -ml-1">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[16px] font-bold tracking-tight">shop withdraw</h1>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="text-[#121212] active:opacity-50"
          aria-label="Help"
        >
          <HelpCircle size={20} strokeWidth={2} />
        </button>
      </div>

      <main className="w-full">
        <div className="bg-white px-6 py-10 border-b border-[#EEEEEE]">
          <div className="flex justify-between items-baseline mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">฿</span>
              <h2 className="text-[48px] font-bold leading-none tracking-tighter">{balance.toFixed(2)}</h2>
            </div>
          </div>

          {posRevenue > 0 && (
            <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <Scan size={12} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider">
                POS revenue ฿{posRevenue.toLocaleString()} · in-store, not withdrawable
              </span>
            </div>
          )}
          {posRevenue === 0 && <div className="mb-8" />}

          <div className="mb-6">
            <label className="text-[10px] font-bold text-[#86878B] tracking-widest block mb-2">Withdraw Amount</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold">฿</span>
              <input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-6 py-3 text-3xl font-bold border-b-2 border-[#EEEEEE] focus:border-[#00aeff] outline-none transition-colors placeholder:text-[#EEEEEE]"
              />
              <button
                onClick={() => setWithdrawAmount(balance.toString())}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#00aeff]"
              >
                Max
              </button>
            </div>
            {rules && (
              <p className="mt-2 text-[10px] text-[#86878B] font-medium">
                Min ฿{rules.minAmount.toLocaleString()} • Max ฿{rules.maxAmount.toLocaleString()} • Fee {rules.feePercent}%
              </p>
            )}
          </div>

          <button
            onClick={initiateWithdrawal}
            disabled={loading || !selectedBank || !withdrawAmount}
            className={`w-full rounded-2xl px-12 font-bold py-4 text-[13px] tracking-[0.1em] transition-all ${
              loading || !selectedBank || !withdrawAmount
                ? "bg-[#EEEEEE] text-[#C8C9CC] cursor-not-allowed"
                : "bg-[#00aeff] text-white active:opacity-80"
            }`}
          >
            {loading ? "Processing..." : "withdraw now"}
          </button>
        </div>

        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-[#00aeff] rounded-full flex items-center justify-center mx-auto">
                  <Shield size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800">Verify Withdrawal</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Please enter your 6-digit PIN to confirm withdrawal of ฿
                    {parseFloat(withdrawAmount || "0").toLocaleString()}
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    className="w-full text-3xl font-black text-center tracking-[0.6em] py-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-[#00aeff] focus:bg-white transition-all outline-none"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPinModal(false);
                      setPinInput("");
                    }}
                    className="flex-1 py-4 text-xs font-black tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={loading || pinInput.length !== 6}
                    className="flex-[2] py-4 bg-[#00aeff] text-white rounded-2xl text-xs font-black tracking-widest shadow-lg shadow-[#00aeff]/20 active:scale-95 transition-all disabled:opacity-30"
                  >
                    {loading ? "Verifying..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHelp && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Withdrawal Rules</h3>
                <button onClick={() => setShowHelp(false)} className="p-1 active:opacity-50">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5 text-[13px] text-slate-700 leading-relaxed">
                {rules ? (
                  <>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="font-medium text-slate-500">Minimum</span>
                      <span className="font-bold">฿{rules.minAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="font-medium text-slate-500">Maximum per request</span>
                      <span className="font-bold">฿{rules.maxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="font-medium text-slate-500">Fee</span>
                      <span className="font-bold">
                        {rules.feePercent}% {rules.flatFee > 0 ? `+ ฿${rules.flatFee}` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="font-medium text-slate-500">Processing time</span>
                      <span className="font-bold">{rules.processingDays} business days</span>
                    </div>
                    <ul className="text-[12px] text-slate-500 list-disc pl-4 space-y-2 pt-2">
                      <li>This balance is from <strong>web sales only</strong> — POS revenue stays in-store and is not withdrawable.</li>
                      <li>Buyer must confirm receipt before web sales credit your balance.</li>
                      <li>Verify your bank account to avoid delays.</li>
                      <li>Pending requests can be canceled before approval — funds are returned instantly.</li>
                      <li>You must set a 6-digit PIN before your first withdrawal.</li>
                    </ul>
                  </>
                ) : (
                  <p className="text-slate-400">Loading rules…</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 bg-white border-y border-[#EEEEEE]">
          <div className="px-6 py-4 border-b border-[#F8F8F8]">
            <h3 className="text-[11px] font-bold text-[#121212] tracking-[0.15em]">withdrawal destination</h3>
          </div>

          <div className="divide-y divide-[#F8F8F8]">
            <button
              onClick={() => setView("selectBank")}
              className="w-full px-6 py-6 flex items-center justify-between active:bg-[#F9F9F9] transition-colors"
            >
              <div className="flex items-center gap-5">
                <Landmark size={20} strokeWidth={1.5} className="text-[#121212]" />
                <div className="text-left">
                  <span className="text-[14px] font-bold tracking-tight block">payment methods</span>
                  {selectedBank && (
                    <span className="text-[11px] font-bold text-[#00aeff] tracking-wider">
                      {selectedBank.bankName} (****{selectedBank.accountNumber.slice(-4)})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#86878B]">
                <ChevronRight size={18} strokeWidth={1.5} />
              </div>
            </button>

            <button
              onClick={() => {
                setHistoryTab("pending");
                setView("history");
              }}
              className="w-full px-6 py-6 flex items-center justify-between active:bg-[#F9F9F9]"
            >
              <div className="flex items-center gap-5">
                <Clock size={20} strokeWidth={1.5} className="text-[#121212]" />
                <span className="text-[14px] font-bold tracking-tight">
                  pending & history
                  {pendingTxs.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center text-[10px] bg-[#FE2C55] text-white px-1.5 rounded-full font-black">
                      {pendingTxs.length}
                    </span>
                  )}
                </span>
              </div>
              <ChevronRight size={18} strokeWidth={1.5} className="text-[#C8C9CC]" />
            </button>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="flex gap-3">
            <Info size={14} className="text-[#C8C9CC] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[#86878B] leading-[1.8] font-medium">
              after buyer confirms receipt, web sales will be transferred within{" "}
              <span className="text-[#121212]">{rules?.processingDays ?? 7} business days</span>
              <br />
              please verify bank info to avoid delays.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
