import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { broadcastNotification, type BroadcastPayload } from '@/services/adminApi';

interface SendTabProps {
  audience: BroadcastPayload['audience'];
}

const SendTab: React.FC<SendTabProps> = ({ audience }) => {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<NonNullable<BroadcastPayload['type']>>('system');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSend = async () => {
    if (!title.trim()) {
      setError(t('pages.notifications.form.titleRequired'));
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await broadcastNotification({
        title: title.trim(),
        body: body.trim(),
        link: link.trim() || undefined,
        type,
        audience,
      });
      setSuccess(t('pages.notifications.sentSuccess', { count: res.data?.sent ?? 0, audience: res.data?.audience ?? audience ?? 'all' }));
      setTitle('');
      setBody('');
      setLink('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pages.notifications.sendFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl py-6 px-1">
      <div className="space-y-5">
        <label className="block">
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">{t('table.title')}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('pages.notifications.form.titlePlaceholder')}
            className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">{t('pages.notifications.form.messageLabel')}</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={t('pages.notifications.form.messagePlaceholder')}
            className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">URL ({t('common.optional')})</span>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://app.lalashop.com/..."
            className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">{t('table.type')}</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as NonNullable<BroadcastPayload['type']>)}
            className="w-full mt-1.5 py-2.5 px-3 bg-gray-50 border border-gray-100 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="system">{t('pages.notifications.types.system')}</option>
            <option value="security">{t('pages.notifications.types.security')}</option>
            <option value="payout">{t('pages.notifications.types.payout')}</option>
            <option value="info">{t('pages.notifications.types.info')}</option>
          </select>
        </label>

        {success && (
          <div className="rounded-md bg-green-50 px-3 py-2 text-[12px] text-green-700">{success}</div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            disabled={busy}
            onClick={onSend}
            className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {busy ? t('pages.notifications.sending') : t('pages.notifications.sendButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendTab;
