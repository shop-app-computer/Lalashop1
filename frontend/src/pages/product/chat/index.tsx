import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ChevronLeft,
  MessageCircle,
  ShieldCheck,
  User,
} from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { sellerId } = router.query;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>Chat with Seller - Soshop</title>
      </Head>

      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200 overflow-hidden">
                <User className="text-sky-600" size={20} />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                {typeof sellerId === "string" && sellerId.length > 0
                  ? `Seller ${sellerId.slice(-6).toUpperCase()}`
                  : "Seller"}
              </h1>
              <div className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-sky-500" />
                <span className="text-[10px] text-gray-500 font-medium">
                  Direct messaging coming soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-sky-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">
            Buyer ↔ Seller chat coming soon
          </h2>
          <p className="text-sm text-slate-500">
            The chat backend is not yet implemented. Once the message and conversation models are
            added on the server, you'll be able to message sellers about a product right here.
          </p>
        </div>
      </main>
    </div>
  );
}
