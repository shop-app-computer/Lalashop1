import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, ShieldCheck } from 'lucide-react';

const InviteAdminPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setInfo(
      'Admin invite system is not yet implemented in the backend. To create an admin manually, ' +
        'use the User edit page to set isAdmin=true on an existing account, or register the user ' +
        'and update their isAdmin flag via Mongo for now.'
    );
  };

  return (
    <div className="space-y-4 text-sm">
      <Link
        href="/admins"
        className="inline-flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to admins
      </Link>

      <p className="text-[12px] text-gray-500">
        Plan: send an email invitation. The invitee will set their own password and 2FA upon accepting.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form
          onSubmit={handleSend}
          className="lg:col-span-2 rounded-lg border border-gray-100 p-5 space-y-4"
        >
          <div>
            <label className="text-[11px] font-semibold text-gray-500 tracking-wide">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@lala.shop"
                className="w-full pl-8 pr-3 py-2 rounded-md text-[12px] bg-gray-50 border border-gray-100 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 tracking-wide">
              Full Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="e.g. Mali Thongdy"
              className="w-full mt-1 px-3 py-2 rounded-md text-[12px] bg-gray-50 border border-gray-100 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 tracking-wide">
              Personal Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Add a note that will be included in the invite email..."
              className="w-full mt-1 px-3 py-2 rounded-md text-[12px] bg-gray-50 border border-gray-100 focus:border-primary outline-none resize-none"
            />
          </div>

          {info && (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
              {info}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Link
              href="/admins"
              className="px-4 py-2 rounded-md text-[12px] font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!email}
              className="bg-black text-white px-4 py-2 rounded-md text-[12px] font-semibold inline-flex items-center hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send Invitation
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-gray-100 p-5 space-y-3 h-fit">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-[12px] font-bold text-black">How invites will work</h3>
          </div>
          <p className="text-[11px] text-gray-500">
            When the backend invite endpoint is implemented, an email will be sent with a one-time link.
            The invitee creates their own password and enables 2FA on first login. Until then, manage admins
            directly via the user edit page.
          </p>
          <Link href="/admins/roles" className="text-[11px] text-primary hover:underline">
            View role matrix →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InviteAdminPage;
