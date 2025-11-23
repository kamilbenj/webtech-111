'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.replace('/feed')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-black px-4">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-black/70">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] shadow-lg shadow-black/40">
            <LogIn className="h-5 w-5 text-slate-950" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-50">Log in</h1>
          <p className="mt-1 text-xs text-slate-400">
            Find your friends&apos; reviews and your favorite movies.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-center text-xs font-medium text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-black/40 transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          No account yet?{' '}
          <Link
            href="/signup"
            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-soft)]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}