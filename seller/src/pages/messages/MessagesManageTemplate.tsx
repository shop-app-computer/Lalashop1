import React, { useState } from 'react';
import {
  Search, Filter, Calendar, ChevronDown, Download, MoreHorizontal,
  Phone, User, Zap, Send, ArrowUp,
} from 'lucide-react';

type RangeKey = '7d' | '30d' | '90d' | 'custom';

const MessagesManagePage = ({ title }: { title: string }) => {
  const [range, setRange] = useState<RangeKey>('7d');

  const contacts = [
    { id: 'CON-001', name: 'Somsak J.', lastMsg: 'How much is the shipping fee?', time: '5m ago', type: 'Facebook', unread: 2, status: 'Open' },
    { id: 'CON-002', name: 'Viphone S.', lastMsg: 'I have paid for the order.', time: '20m ago', type: 'WhatsApp', unread: 0, status: 'Resolved' },
    { id: 'CON-003', name: 'Keo P.', lastMsg: 'Do you have this in blue?', time: '1h ago', type: 'Messenger', unread: 5, status: 'Open' },
    { id: 'CON-004', name: 'Anousone K.', lastMsg: 'Thanks for the fast delivery!', time: 'Yesterday', type: 'TikTok', unread: 0, status: 'Resolved' },
    { id: 'CON-005', name: 'Boualay T.', lastMsg: 'Can I change the address?', time: 'Yesterday', type: 'Messenger', unread: 1, status: 'Open' },
    { id: 'CON-006', name: 'Ladda B.', lastMsg: 'Is there a bulk discount?', time: '2d ago', type: 'WhatsApp', unread: 0, status: 'Pending' },
  ];

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'open': return 'bg-blue-50 text-blue-700';
      case 'pending': return 'bg-orange-50 text-orange-700';
      case 'resolved': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'custom', label: 'Custom' },
  ];

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);
  const openCount = contacts.filter((c) => c.status === 'Open').length;
  const resolvedCount = contacts.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          New Conversation
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                range === r.key ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          Apr 24 – Apr 30, 2026
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          Channel: <span className="font-semibold text-gray-900 ml-1">All</span>
          <ChevronDown className="w-3 h-3 ml-1.5 text-gray-400" />
        </button>

        <button className="inline-flex items-center text-[11px] font-medium text-gray-700 px-2 py-1 rounded">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Add filter
        </button>

        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations…"
            className="pl-7 pr-3 py-1 rounded text-[11px] w-56"
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Total Threads</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{contacts.length}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Across 4 channels</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Unread</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{totalUnread}</p>
          <span className="inline-flex items-center text-[11px] font-semibold text-orange-600 mt-1">
            <ArrowUp className="w-3 h-3" />2 new since last hour
          </span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Open</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{openCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Needs response</span>
        </div>
        <div className="rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Resolved Today</p>
          <p className="text-xl font-bold text-black tabular-nums mt-1">{resolvedCount}</p>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Avg response 1.5h</span>
        </div>
      </div>

      {/* Inbox grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contacts list */}
        <div className="rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold text-black">Conversations</h3>
            <span className="text-[11px] text-gray-500">{contacts.length} total</span>
          </div>
          <div className="">
            {contacts.map((contact, i) => (
              <div
                key={contact.id}
                className={`px-4 py-3 cursor-pointer ${i === 0 ? '' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-[11px] font-semibold text-gray-700 shrink-0">
                    {contact.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-gray-900 truncate">{contact.name}</span>
                      <span className="text-[10px] text-gray-400 tabular-nums shrink-0">{contact.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{contact.lastMsg}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-gray-500">{contact.type}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </div>
                  </div>
                  {contact.unread > 0 && (
                    <span className="bg-primary text-white text-[10px] font-semibold rounded px-1.5 py-0.5 tabular-nums">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active thread */}
        <div className="lg:col-span-2 rounded-lg overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-[11px] font-semibold text-gray-700">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Somsak J.</p>
                <p className="text-[11px] text-gray-500">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                  Online · Facebook
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1.5">
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1.5">
                <User className="w-3.5 h-3.5" />
              </button>
              <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1.5">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-md max-w-[70%]">
                <p className="text-[12px] text-gray-700">Hello, is this product still available?</p>
                <p className="text-[10px] text-gray-400 mt-1 tabular-nums">10:24 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-black text-white px-3 py-2 rounded-md max-w-[70%]">
                <p className="text-[12px]">Yes, it is available in stock. How many do you need?</p>
                <p className="text-[10px] text-gray-300 mt-1 tabular-nums">10:25 AM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-md max-w-[70%]">
                <p className="text-[12px] text-gray-700">How much is the shipping fee to Vientiane?</p>
                <p className="text-[10px] text-gray-400 mt-1 tabular-nums">10:27 AM</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 flex items-center gap-2">
            <button className="text-gray-500 hover:text-black hover:bg-gray-100 rounded p-1.5">
              <Zap className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              placeholder="Type a message…"
              className="flex-1 px-3 py-1.5 rounded text-[12px]"
            />
            <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesManagePage;
