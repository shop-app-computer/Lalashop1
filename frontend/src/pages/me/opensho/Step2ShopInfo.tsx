"use client";
import React, { useState } from "react";
import { ShieldCheck, ChevronDown, Info, Plus, X } from "lucide-react";
import { countries, productCategories } from "./constants";

interface Props {
    businessType: string | null;
    shopCategory: string;
    setShopCategory: (val: string) => void;
    selectedCountry: typeof countries[0];
    setSelectedCountry: (val: typeof countries[0]) => void;
    shopAccount: string;
    setShopAccount: (val: string) => void;
    shopName: string;
    setShopName: (val: string) => void;
    shopEmail: string;
    setShopEmail: (val: string) => void;
    accountEmail?: string;
    phoneNumber: string;
    setPhoneNumber: (val: string) => void;
    verificationCode: string;
    setVerificationCode: (val: string) => void;
    errors: Record<string, boolean>;
}

export default function Step2ShopInfo({
    businessType,
    shopCategory, setShopCategory,
    selectedCountry, setSelectedCountry,
    shopAccount, setShopAccount,
    shopName, setShopName,
    shopEmail, setShopEmail,
    accountEmail,
    phoneNumber, setPhoneNumber,
    verificationCode, setVerificationCode,
    errors,
}: Props) {
    const isIndividual = businessType === 'individual';
    const [entityName, setEntityName] = useState("");
    const [emailOption, setEmailOption] = useState<"current" | "other">("current");
    const [otherEmailInput, setOtherEmailInput] = useState("");
    const [otherEmailError, setOtherEmailError] = useState<string | null>(null);

    const fallbackEmail = accountEmail || "";

    const selectCurrentEmail = () => {
        setEmailOption("current");
        setOtherEmailError(null);
        setShopEmail(fallbackEmail);
    };

    const selectOtherEmail = () => {
        setEmailOption("other");
        if (otherEmailInput.trim()) setShopEmail(otherEmailInput.trim());
        else setShopEmail("");
    };

    const applyOtherEmail = () => {
        const value = otherEmailInput.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) {
            setOtherEmailError("Please enter a valid email address.");
            return;
        }
        setOtherEmailError(null);
        setShopEmail(value);
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 font-sans text-dark bg-gray-light p-1 md:p-4">

            {/* --- SECTION 1: Entity & Store Name --- */}
            <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-8">

                {/* Dynamic Business Entity Section */}
                {!isIndividual && (
                    <div className="space-y-6 pb-6 border-b border-gray-50">
                        <div className="flex items-center gap-2 text-primary">
                            <Info size={20} />
                            <h2 className="text-[18px] font-bold uppercase tracking-tight">Business Entity Details</h2>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[14px] font-bold text-gray-700">
                                {businessType === 'partnership' ? 'Partnership Name' : 'Registered Company Name'}
                            </label>
                            <input
                                type="text"
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                placeholder="Enter exactly as shown on license"
                                className="w-full border border-gray-border rounded-lg px-4 py-3 text-[15px] focus:border-primary outline-none bg-white transition-all font-bold"
                            />
                            <p className="text-[12px] text-gray-400 font-medium italic">
                                * This must match your official registration documents.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-[20px] font-bold">Store Name</h2>
                        <div className="space-y-3">
                            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                                You can change the name after starting.<br />
                                Name Requirements:<br />
                                1 Avoid using "Flagship" or "Official".<br />
                                2 Avoid store names consisting only of alphanumeric characters or special characters.
                            </p>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Enter Store Name"
                                className={`w-full border rounded-lg px-4 py-3 text-[15px] focus:border-primary outline-none bg-white transition-all ${errors.shopName ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`}
                            />
                            <input
                                type="text"
                                value={shopAccount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d+$/.test(val)) {
                                        setShopAccount(val);
                                    }
                                }}
                                placeholder="Store Account"
                                className={`w-full border rounded-lg px-4 py-3 text-[15px] focus:border-primary outline-none bg-white transition-all ${errors.shopAccount ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: Main Products --- */}
            <section className="bg-white border border-gray-100 rounded-xl p-8 space-y-6 shadow-sm">
                <h2 className="text-[20px] font-bold">Main Products</h2>
                <div className="space-y-4">
                    <p className="text-[13px] text-gray-500 font-medium">
                        Choose the category that best describes the products you sell. This will not affect your future business and will be used for registration purposes only.
                    </p>
                    <div className="relative">
                        <select
                            value={shopCategory}
                            onChange={(e) => setShopCategory(e.target.value)}
                            className={`w-full border rounded-lg px-4 py-3 text-[15px] focus:border-primary outline-none appearance-none bg-white font-medium cursor-pointer ${errors.shopCategory ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`}
                        >
                            <option value="">Select main product/service category</option>
                            {productCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: Secure Registration (Verification) --- */}
            <section className="bg-white border border-gray-100 rounded-xl p-8 space-y-8 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck size={24} />
                    <h2 className="text-[18px] font-bold">Secure Registration</h2>
                </div>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    To secure your account, we need your email and phone number for verification. This information will be used for screening. We recommend using a business email for better authentication.
                </p>

                {/* Email Address */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-[15px] font-bold">Email Address</h3>
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div onClick={selectCurrentEmail} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${emailOption === "current" ? "border-primary" : "border-gray-300"}`}>
                                {emailOption === "current" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            </div>
                            <span className="text-[14px] font-medium">Use current</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div onClick={selectOtherEmail} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${emailOption === "other" ? "border-primary" : "border-gray-300"}`}>
                                {emailOption === "other" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            </div>
                            <span className="text-[14px] font-medium text-gray-500">Use other</span>
                        </label>
                    </div>

                    {emailOption === "current" ? (
                        <div className="max-w-md">
                            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] bg-gray-50 font-bold text-gray-700 flex items-center justify-between">
                                <span className="truncate">
                                    {fallbackEmail || (
                                        <span className="text-gray-400 italic font-medium">No email on account</span>
                                    )}
                                </span>
                            </div>
                            <p className="mt-2 text-[12px] text-gray-400">
                                This is the email currently linked to your account.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-md space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-[12px] font-bold text-gray-500 tracking-wide">
                                NEW EMAIL ADDRESS
                            </label>
                            <div className={`flex items-stretch border rounded-lg overflow-hidden focus-within:border-primary transition-all ${otherEmailError ? 'border-red-500' : 'border-gray-border'}`}>
                                <input
                                    type="email"
                                    value={otherEmailInput}
                                    onChange={(e) => setOtherEmailInput(e.target.value)}
                                    placeholder="business@yourdomain.com"
                                    className="flex-1 px-4 py-3 outline-none text-[15px] font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={applyOtherEmail}
                                    className="px-4 bg-primary text-white text-[12px] font-bold tracking-widest uppercase flex items-center gap-1 hover:bg-primary-hover transition-colors"
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                            {otherEmailError && (
                                <p className="text-[12px] text-red-600 font-medium">{otherEmailError}</p>
                            )}
                            {shopEmail && shopEmail !== fallbackEmail && !otherEmailError && (
                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md text-[13px]">
                                    <span className="text-gray-700 font-medium truncate">{shopEmail}</span>
                                    <button
                                        type="button"
                                        onClick={() => { setShopEmail(""); setOtherEmailInput(""); }}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Phone Number & OTP */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-[15px] font-bold">Phone Number</h3>
                    <div className="max-w-xl space-y-3">
                        <div className={`flex border rounded-lg overflow-hidden focus-within:border-primary transition-all relative ${errors.phoneNumber ? 'border-red-500' : 'border-gray-border'}`}>
                            <div className="relative flex bg-gray-50 border-r border-gray-200">
                                <select
                                    value={countries.indexOf(selectedCountry)}
                                    onChange={(e) => {
                                        setSelectedCountry(countries[Number(e.target.value)]);
                                    }}
                                    className="px-4 py-3 bg-transparent text-[14px] font-medium text-gray-600 outline-none appearance-none cursor-pointer pr-8"
                                >
                                    {countries.map((c, index) => (
                                        <option key={c.code + c.name} value={index}>
                                            {c.flag} {c.code}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d+$/.test(val)) {
                                        setPhoneNumber(val);
                                    }
                                }}
                                placeholder="Please enter phone number"
                                className={`flex-1 px-4 py-3 outline-none text-[15px] font-medium ${errors.phoneNumber ? 'bg-red-50/30' : ''}`}
                            />
                            <button className="px-6 py-3 text-[14px] font-bold text-gray-400 hover:text-primary transition-colors border-l border-gray-100">
                                Send Code
                            </button>
                        </div>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d+$/.test(val)) {
                                    setVerificationCode(val);
                                }
                            }}
                            placeholder="Enter verification code"
                            className={`w-full border rounded-lg px-4 py-3 text-[15px] focus:border-primary outline-none ${errors.verificationCode ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
