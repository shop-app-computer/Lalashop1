"use client";
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { ChevronLeft, Check, Languages, Coins, Globe } from "lucide-react";

export default function LanguagePage() {
    // Simulated selected language state (Default is Thai)
    const [selectedLang, setSelectedLang] = useState("th");

    const languages = [
        { id: "th", name: "ไทย", sub: "Thai", flag: "🇹🇭" },
        { id: "en", name: "English", sub: "English", flag: "🇺🇸" },
        { id: "zh", name: "中文", sub: "Chinese", flag: "🇨🇳" },
        { id: "lao", name: "ພາສາລາວ", sub: "Lao", flag: "🇱🇦" },
        { id: "vi", name: "Tiếng Việt", sub: "Vietnamese", flag: "🇻🇳" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Header />

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 md:py-20">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00a699] transition-all mb-8 group font-bold">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm tracking-widest">Back to Shopping</span>
                </Link>

                <div className="space-y-8">
                    {/* Title Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#00a699]">
                            <Languages size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#111111] tracking-tight">Display Settings</h1>
                            <p className="text-sm text-slate-400 font-bold tracking-widest">Language & Region</p>
                        </div>
                    </div>

                    {/* Language Selection Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                            <h2 className="text-[10px] font-black text-slate-400 tracking-[0.3em]">Choose Language</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => setSelectedLang(lang.id)}
                                    className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <span className="text-3xl md:text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                                            {lang.flag}
                                        </span>
                                        <div className="text-left">
                                            <p className={`text-lg font-black ${selectedLang === lang.id ? 'text-[#00a699]' : 'text-[#111111]'}`}>
                                                {lang.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-widest">
                                                {lang.sub}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {selectedLang === lang.id ? (
                                        <div className="w-8 h-8 bg-[#00a699] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#00a699]/30 animate-in zoom-in duration-300">
                                            <Check size={18} strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-100 group-hover:border-[#00a699]/20 transition-colors" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Currency Section (Matching the EN/THB label) */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex items-center justify-between group cursor-pointer hover:border-[#00a699]/20 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#111111] tracking-tight">Default Currency</h3>
                                <p className="text-xs text-slate-400 font-bold tracking-widest">THB - Thai Baht (฿)</p>
                            </div>
                        </div>
                        <div className="text-slate-200 group-hover:text-[#00a699] transition-colors">
                            <Globe size={20} />
                        </div>
                    </div>

                    {/* Save Button */}
                    <button 
                        onClick={() => alert('Settings Saved!')}
                        className="w-full bg-[#111111] text-white font-black py-6 rounded-[1.5rem] shadow-2xl shadow-[#111111]/20 hover:bg-slate-800 transition-all tracking-[0.2em] text-xs active:scale-[0.98]"
                    >
                        Save and Apply
                    </button>
                </div>
            </main>
        </div>
    );
}