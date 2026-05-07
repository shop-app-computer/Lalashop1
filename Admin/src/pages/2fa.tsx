import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const TwoFactorPage = () => {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 1);
    const next = [...code];
    next[idx] = cleaned;
    setCode(next);
    if (cleaned && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white text-black font-sans p-8">
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-black font-medium transition-colors mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </button>

        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold tracking-tight">Two-Factor Authentication</span>
        </div>

        <h2 className="text-2xl font-bold text-black">Verify identity</h2>
        <p className="text-gray-500 text-sm mt-1">Enter the 6-digit code from your authenticator app</p>

        {error && (
          <div className="mt-6 px-4 py-3 rounded-md bg-red-50 text-red-700 text-[12px] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="flex gap-2 justify-between">
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-bold tabular-nums bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify →'}
          </button>

          <div className="flex items-center justify-between text-[12px] mt-6 text-gray-500">
            <button type="button" className="hover:text-black font-medium">Use backup code</button>
            <button type="button" className="hover:text-black font-medium">Resend</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorPage;
