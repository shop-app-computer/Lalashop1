import React, { useState } from "react";
import { Search, Send, Camera, Info, Smile, Image as ImageIcon, Phone, Video, ChevronLeft } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

interface Chat {
  id: number;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  online?: boolean;
}

const mockChats: Chat[] = [
  { id: 1, username: "shiyue_opto", avatar: "https://i.pravatar.cc/150?u=shiyue", lastMessage: "Yes, the LED panels are in stock.", time: "2m", unread: true, online: true },
  { id: 2, username: "jomaa_tech", avatar: "https://i.pravatar.cc/150?u=jomaa", lastMessage: "Sent you the tracking number.", time: "1h" },
  { id: 3, username: "eco_pack", avatar: "https://i.pravatar.cc/150?u=eco", lastMessage: "Thanks for the order!", time: "3h", online: true },
];

const mockMessages: Message[] = [
  { id: 1, text: "Hi, do you have the 48W LED panels available?", sender: "me", timestamp: "10:30 AM" },
  { id: 2, text: "Hello! Yes, the LED panels are in stock and ready to ship.", sender: "them", timestamp: "10:32 AM" },
  { id: 3, text: "What's the shipping time to Vientiane?", sender: "me", timestamp: "10:33 AM" },
  { id: 4, text: "Usually 3-5 business days via land transport.", sender: "them", timestamp: "10:35 AM" },
];

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white border border-gray-border rounded-lg overflow-hidden max-w-6xl mx-auto my-4">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r border-gray-border flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-border flex items-center justify-between">
          <h2 className="font-bold text-lg text-dark">Direct</h2>
          <ChevronLeft className="md:hidden cursor-pointer text-dark" />
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-gray-border rounded-lg py-1.5 pl-10 pr-4 text-sm outline-none text-dark"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto text-dark">
          {mockChats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-light transition-colors ${selectedChat?.id === chat.id ? 'bg-primary-soft/50' : ''}`}
            >
              <div className="relative">
                <img src={chat.avatar} className="w-14 h-14 rounded-full border border-gray-border" />
                {chat.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${chat.unread ? 'font-bold' : 'font-medium'}`}>{chat.username}</p>
                <p className={`text-xs truncate ${chat.unread ? 'text-dark font-bold' : 'text-gray-500'}`}>{chat.lastMessage} • {chat.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronLeft className="md:hidden cursor-pointer text-dark" onClick={() => setSelectedChat(null)} />
                <img src={selectedChat.avatar} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-dark">{selectedChat.username}</p>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-dark">
                <Phone size={20} className="cursor-pointer" />
                <Video size={22} className="cursor-pointer" />
                <Info size={20} className="cursor-pointer" />
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "me" ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender === "me" ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-light text-dark rounded-tl-none'}`}>
                    {msg.text}
                    <p className={`text-[9px] mt-1 ${msg.sender === "me" ? 'text-primary-soft text-right' : 'text-gray-400'}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-border">
              <div className="flex items-center gap-3 bg-white border border-gray-border rounded-full px-4 py-2 focus-within:border-gray-400 transition-colors">
                <Smile size={22} className="text-gray-500 cursor-pointer" />
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Message..." 
                  className="flex-1 text-sm outline-none text-dark"
                />
                {!inputText.trim() ? (
                  <div className="flex items-center gap-3 text-dark">
                    <ImageIcon size={22} className="cursor-pointer" />
                    <Camera size={22} className="cursor-pointer" />
                  </div>
                ) : (
                  <button type="submit" className="text-primary font-bold text-sm">Send</button>
                )}
              </div>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gray-light rounded-full flex items-center justify-center mx-auto border-2 border-gray-border">
              <Send size={40} className="text-gray-400 -rotate-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark">Your Messages</h2>
              <p className="text-sm text-gray-500 max-w-xs mt-2">Send private photos and messages to a friend or group.</p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors">
              Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
