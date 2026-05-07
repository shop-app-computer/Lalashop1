import React, { useEffect, useState } from 'react';
import { ShieldCheck, Key, Smartphone, Mail, Save, User, Activity } from 'lucide-react';
import { adminMe, type MeResponse } from '@/services/authApi';
import { updateUser as updateAdminUser } from '@/services/adminApi';

type Tab = 'profile' | 'security' | 'sessions';

const formatDate = (s?: string): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const ProfilePage = () => {
  const [tab, setTab] = useState<Tab>('profile');
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminMe()
      .then((res) => {
        if (cancelled) return;
        setMe(res);
        setEditName(res.name || '');
        setEditEmail(res.email || '');
        setEditPhone(res.phone || '');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!me?._id) return;
    setSaving(true);
    setSavedMessage(null);
    try {
      await updateAdminUser(me._id, { name: editName, email: editEmail, phone: editPhone });
      setSavedMessage('Saved');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-[13px] text-gray-400 py-12 text-center">Loading profile...</div>;
  }

  if (error || !me) {
    return <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error || 'Profile not available'}</div>;
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex border-b border-gray-100 text-[12px]">
        {([
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security', icon: ShieldCheck },
          { id: 'sessions', label: 'Sessions', icon: Activity },
        ] as { id: Tab; label: string; icon: typeof User }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 inline-flex items-center gap-2 -mb-px font-medium transition-colors ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="max-w-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Admin ID" value={me.customId || me._id || ''} readOnly />
            <Field label="Role" value={me.isAdmin ? 'Admin' : 'User'} readOnly />
            <Field label="Full Name" value={editName} onChange={setEditName} />
            <Field label="Email" value={editEmail} onChange={setEditEmail} />
            <Field label="Phone" value={editPhone} onChange={setEditPhone} />
            <Field label="Username" value={me.username || ''} readOnly />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center hover:bg-gray-900 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {savedMessage && (
              <span className="text-[12px] text-green-700 font-medium">{savedMessage}</span>
            )}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="max-w-2xl space-y-3">
          <SecurityRow icon={Key} title="Password" description="Change your admin password" actionLabel="Change" />
          <SecurityRow
            icon={Smartphone}
            title="Two-Factor Authentication"
            description="Manage 2FA via /2fa page after login"
            actionLabel="Manage"
          />
          <SecurityRow icon={Mail} title="Email" description={me.email || '—'} actionLabel="Update" />
          <SecurityRow icon={ShieldCheck} title="Backup Codes" description="Available after enabling TOTP" actionLabel="Setup" />
        </div>
      )}

      {tab === 'sessions' && (
        <div className="rounded-lg py-12 text-center text-gray-400 text-[12px]">
          Session tracking model not implemented yet — last known IP: <span className="font-mono">{(me as any).lastKnownIp || '—'}</span>
        </div>
      )}
    </div>
  );
};

const Field = ({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (v: string) => void;
}) => (
  <label className="block">
    <span className="text-[11px] font-semibold text-gray-500 tracking-wide">{label}</span>
    <input
      value={value}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={`w-full mt-1 py-2 px-3 rounded-md outline-none text-[12px] ${
        readOnly
          ? 'bg-gray-100 text-gray-500'
          : 'bg-gray-50 border border-gray-100 focus:border-primary text-gray-900'
      } transition-colors`}
    />
  </label>
);

const SecurityRow = ({
  icon: Icon,
  title,
  description,
  actionLabel,
}: {
  icon: typeof Key;
  title: string;
  description: string;
  actionLabel: string;
}) => (
  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-5 py-4">
    <div className="flex items-center gap-4">
      <Icon className="w-4 h-4 text-gray-400" />
      <div>
        <div className="font-semibold text-gray-900 text-[13px]">{title}</div>
        <div className="text-gray-500 text-[12px] mt-0.5">{description}</div>
      </div>
    </div>
    <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-100">
      {actionLabel}
    </button>
  </div>
);

export default ProfilePage;
