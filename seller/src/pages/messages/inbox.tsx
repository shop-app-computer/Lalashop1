import React, { useState } from 'react';
import {
  Search, Send, Paperclip, Check, MoreHorizontal, Archive, UserPlus, Plus,
} from 'lucide-react';

type FilterKey = 'all' | 'unread' | 'mentions' | 'archived';

interface Chat {
  id: number;
  name: string;
  initial: string;
  lastMsg: string;
  time: string;
  unread: number;
  channel: string;
  status: 'open' | 'awaiting' | 'resolved';
  email: string;
  phone: string;
  joined: string;
  tags: string[];
}

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

interface OrderRow {
  id: string;
  product: string;
  total: string;
  status: 'Delivered' | 'Pending' | 'Shipped';
}

const chats: Chat[] = [
  { id: 1, name: 'John Doe',         initial: 'J', lastMsg: 'Is the MOQ negotiable for large orders?',         time: '2m',   unread: 2, channel: 'TikTok',    status: 'awaiting', email: 'john.doe@example.com',  phone: '+1 555 0182', joined: 'Jan 14, 2024', tags: ['VIP', 'Wholesale'] },
  { id: 2, name: 'Sarah Smith',      initial: 'S', lastMsg: 'Thank you for the fast shipping!',                 time: '1h',   unread: 0, channel: 'Instagram', status: 'resolved', email: 'sarah.s@example.com',   phone: '+1 555 0144', joined: 'Mar 02, 2024', tags: ['Repeat'] },
  { id: 3, name: 'Lala Shop Fan',    initial: 'L', lastMsg: 'Do you have this in blue?',                        time: '1d',   unread: 0, channel: 'WhatsApp',  status: 'open',     email: 'fan@example.com',       phone: '+1 555 0119', joined: 'Aug 21, 2024', tags: ['New'] },
  { id: 4, name: 'Business Buyer',   initial: 'B', lastMsg: 'Need a quote for 1000 units.',                     time: '2d',   unread: 0, channel: 'Facebook',  status: 'awaiting', email: 'buyer@bizcorp.com',     phone: '+1 555 0177', joined: 'Feb 10, 2024', tags: ['B2B', 'High value'] },
  { id: 5, name: 'Maria Lopez',      initial: 'M', lastMsg: 'Can I cancel order ORD-0915?',                     time: '3d',   unread: 1, channel: 'TikTok',    status: 'open',     email: 'maria.l@example.com',   phone: '+1 555 0102', joined: 'Jun 04, 2024', tags: ['Refund'] },
];

const messagesByChat: Record<number, Message[]> = {
  1: [
    { id: 1, text: 'Hello! I saw your Premium Leather Bag on TikTok.',                       sent: false, time: '10:00' },
    { id: 2, text: 'Hi John! Yes, it is one of our best sellers. How can I help you?',       sent: true,  time: '10:02' },
    { id: 3, text: 'Is the MOQ negotiable for large orders? I am looking for 500 units.',    sent: false, time: '10:05' },
  ],
};

const recentOrders: OrderRow[] = [
  { id: 'ORD-0921', product: 'Premium Leather Bag x10', total: '$450.00', status: 'Delivered' },
  { id: 'ORD-0918', product: 'Cotton Tote — Ivory x4',  total: '$60.00',  status: 'Shipped'   },
  { id: 'ORD-0902', product: 'Linen Shirt x2',          total: '$48.00',  status: 'Delivered' },
];

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Delivered':
    case 'resolved':
      return 'bg-green-50 text-green-700';
    case 'awaiting':
    case 'Pending':
      return 'bg-orange-50 text-orange-700';
    case 'open':
    case 'Shipped':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

interface KPIProps {
  label: string;
  value: string;
}

const KPI = ({ label, value }: KPIProps) => (
  <div className="rounded-lg px-4 py-3">
    <p className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</p>
    <p className="text-xl font-bold text-black tabular-nums mt-1">{value}</p>
  </div>
);

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'archived', label: 'Archived' },
];

const Inbox = () => {
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState<string>('');
  const [draft, setDraft] = useState<string>('');

  const activeChat = chats.find((c) => c.id === selectedChat) ?? chats[0];
  const messages = messagesByChat[activeChat.id] ?? [];

  const visibleChats = chats.filter((c) => {
    if (filter === 'unread' && c.unread === 0) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
          <Check className="w-3.5 h-3.5 mr-1.5" /> Mark all read
        </button>
        <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New message
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Unread"             value="3" />
        <KPI label="Awaiting Reply"     value="7" />
        <KPI label="Avg Response Time"  value="14m" />
        <KPI label="Resolved Today"     value="12" />
      </div>

      {/* 3-column workspace */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Left: conversation list */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 rounded-lg flex flex-col overflow-hidden">
          {/* Filter tabs */}
          <div className="px-3 py-2.5">
            <div className="inline-flex items-center bg-gray-100 rounded-md p-0.5 w-full">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    filter === f.key ? 'text-black' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-7 pr-3 py-1 rounded text-[11px]"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {visibleChats.map((c) => {
              const isSelected = c.id === selectedChat;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChat(c.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 ${
                    isSelected ? '' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {c.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-900 truncate">{c.name}</span>
                      <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 truncate">{c.lastMsg}</span>
                      {c.unread > 0 && (
                        <span className="text-[10px] font-semibold bg-black text-white rounded-full px-1.5 py-px tabular-nums flex-shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-gray-400">{c.channel}</span>
                      <span className="text-gray-300">·</span>
                      <span className={`text-[10px] font-medium px-1.5 py-px rounded ${statusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: thread */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 rounded-lg flex flex-col overflow-hidden">
          {/* Thread header */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {activeChat.initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-black truncate">{activeChat.name}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadgeClass(activeChat.status)}`}>
                    {activeChat.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">{activeChat.email} · {activeChat.channel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Assign
              </button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
                <Archive className="w-3.5 h-3.5 mr-1.5" /> Archive
              </button>
              <button className="px-2 py-1.5 rounded-md text-xs font-medium text-gray-700 inline-flex items-center">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-[11px] text-gray-400 py-8">No messages in this thread.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sent ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded p-2 text-xs ${
                    m.sent ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="leading-snug">{m.text}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] tabular-nums ${m.sent ? 'text-white/60' : 'text-gray-500'}`}>
                    <span>{m.time}</span>
                    {m.sent && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="px-3 py-2 flex items-center gap-2">
            <button className="p-1.5 text-gray-500 hover:text-black rounded">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Reply to customer…"
              className="flex-1 px-2 py-1.5 rounded text-xs"
            />
            <button className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send
            </button>
          </div>
        </div>

        {/* Right: customer detail */}
        <div className="hidden lg:flex col-span-3 rounded-lg flex-col overflow-hidden">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-black">Customer</h3>
            <button className="text-[11px] font-semibold text-gray-700 hover:underline">View profile</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Customer info */}
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Customer info</h4>
              <dl className="space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="text-gray-900 font-medium truncate">{activeChat.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 truncate">{activeChat.email}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="text-gray-900 tabular-nums">{activeChat.phone}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Joined</dt>
                  <dd className="text-gray-900">{activeChat.joined}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Channel</dt>
                  <dd className="text-gray-900">{activeChat.channel}</dd>
                </div>
              </dl>
            </div>

            {/* Recent orders */}
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Recent orders</h4>
              <div className="rounded overflow-hidden">
                <table className="w-full text-[11px] tabular-nums">
                  <thead className="text-[10px] text-gray-500 tracking-wide">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold">Order</th>
                      <th className="px-2 py-1.5 text-right font-semibold">Total</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="">
                        <td className="px-2 py-1.5">
                          <div className="font-mono text-gray-900">{o.id}</div>
                          <div className="text-[10px] text-gray-500 truncate">{o.product}</div>
                        </td>
                        <td className="px-2 py-1.5 text-right text-gray-900 font-medium">{o.total}</td>
                        <td className="px-2 py-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBadgeClass(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeChat.tags.map((t) => (
                  <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {t}
                  </span>
                ))}
                <button className="text-[11px] font-medium px-2 py-0.5 rounded text-gray-500">
                  + Add
                </button>
              </div>
            </div>

            {/* Internal notes */}
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Internal notes</h4>
              <textarea
                placeholder="Add a private note…"
                className="w-full px-2 py-1.5 rounded text-[11px] min-h-[72px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
