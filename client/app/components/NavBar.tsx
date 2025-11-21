'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import UserMenu from './UserMenu'
import { Film } from 'lucide-react'

export default function NavBar() {
  const router = useRouter()
  const [logged, setLogged] = useState(false)

  const links = [
    { href: '/feed', label: 'Feed' },
    { href: '/posts', label: 'Post' },
    { href: '/friends', label: 'Friends' },
  ]

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setLogged(Boolean(data.user))
    }
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLogged(!!session)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => router.push('/feed')}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/40">
            <Film className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-50">
            CineVerse<span className="text-amber-400">.</span>
          </span>
        </button>

        {logged ? (
          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-slate-300 transition hover:text-amber-300"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-amber-300"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-orange-500/40 hover:from-amber-300 hover:to-orange-400"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}