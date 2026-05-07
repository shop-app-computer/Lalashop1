import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  User,
  ShieldCheck,
  Clock,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { productId, sellerId } = router.query;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "seller-123",
      text: "สวัสดีครับ สนใจสินค้าชิ้นไหนสอบถามได้เลยครับ",
      timestamp: new Date(Date.now() - 3600000),
      isMe: false,
    },
    {
      id: "2",
      senderId: "me",
      text: "สอบถามเรื่องสินค้าครับ ยังมีของอยู่ไหมครับ?",
      timestamp: new Date(Date.now() - 1800000),
      isMe: true,
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: message,
      timestamp: new Date(),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate seller response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: "seller-123",
        text: "มีสินค้าพร้อมส่งครับ สามารถกดสั่งซื้อได้เลย",
        timestamp: new Date(),
        isMe: false,
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>Chat with Seller - Soshop</title>
      </Head>

      {/* Header */}
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
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight">Official Store</h1>
              <div className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-sky-500" />
                <span className="text-[10px] text-gray-500 font-medium">Verified Seller</span>
                <span className="mx-1 text-gray-300">•</span>
                <span className="text-[10px] text-green-500 font-bold tracking-wider">Online</span>
              </div>
            </div>
          </div>
        </div>


      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {/* Date Divider */}
        <div className="flex justify-center my-6">
          <span className="bg-gray-200 text-gray-500 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${msg.isMe ? "items-end" : "items-start"}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${msg.isMe
                  ? "bg-sky-600 text-white rounded-tr-none font-medium"
                  : "bg-white text-slate-800 rounded-tl-none border border-gray-100"
                  }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 font-medium px-1 flex items-center gap-1">
                <Clock size={10} />
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-100 p-3 md:p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3 max-w-[1200px] mx-auto">
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
          >
            <Paperclip size={20} />
          </button>

          <div className="relative flex-1 group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
            >
              <Smile size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${message.trim()
              ? "bg-sky-600 text-white shadow-sky-200 hover:bg-sky-700 hover:shadow-sky-300"
              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              }`}
          >
            <Send size={20} fill={message.trim() ? "currentColor" : "none"} />
          </button>
        </form>
      </footer>

      {/* Styles for animation */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeSlideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
