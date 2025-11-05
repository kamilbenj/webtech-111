'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send magic link');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in</h1>

        {sent ? (
          <p className="text-green-600 text-center">
            Check your email — magic link sent ✅
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="w-full bg-black text-white rounded py-2 font-semibold"
            >
              Send magic link
            </button>
          </form>
        )}

        {err && <p className="text-red-600 mt-4 text-center">{err}</p>}
      </div>
    </div>
  );
}