'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

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
    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      {/* Fond orange transparent couvrant tout l'écran */}
      <div className="fixed inset-0 bg-orange-200/90 z-0"></div>

      {/* Formulaire centré */}
      <div className="relative z-10 w-full max-w-md bg-white border border-orange-300 shadow-2xl rounded-2xl p-8 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text">
          Se connecter
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 transition-all disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Connexion'}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Pas de compte ?{' '}
          <Link
            href="/signup"
            className="font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent hover:from-orange-600 hover:to-yellow-500 transition"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
