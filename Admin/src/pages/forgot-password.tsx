import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
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
          <span className="text-sm font-bold tracking-tight">Password Reset</span>
        </div>

        {!submitted ? (
          <>
            <h2 className="text-2xl font-bold text-black">Forgot Password</h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter your admin email and we'll send a reset link
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-[11px] font-semibold text-gray-500 tracking-wide">EMAIL</span>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl mt-1.5 px-4 focus-within:border-primary transition-colors">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lala.shop"
                    className="w-full py-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                    autoComplete="email"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
          </>
        ) : (
          <div className="rounded-xl bg-green-50 px-6 py-8 text-center">
            <Mail className="w-8 h-8 text-green-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-black">Check your inbox</h3>
            <p className="text-[12px] text-gray-600 mt-2">
              If an account exists for <span className="font-semibold">{email}</span>,
              a reset link has been sent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
