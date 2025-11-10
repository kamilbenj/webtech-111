'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const router = useRouter()
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogged(Boolean(data.user)))
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* --- Logo / Titre --- */}
        <Link
          href="/feed"
          className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text"
        >
          FilmFeed<span className="text-gray-800">.</span>
        </Link>

        {/* --- Navigation --- */}
        <nav className="flex items-center gap-5">
          {logged ? (
            <>
              <Link
                href="/feed"
                className="text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 bg-clip-text transition font-medium"
              >
                Feed
              </Link>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 bg-clip-text font-medium transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 transition"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
