'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import UserMenu from './UserMenu'

export default function NavBar() {
  const router = useRouter()
  const [logged, setLogged] = useState(false)

  const links = [
    { href: '/', label: 'Discover' },
    { href: '/posts', label: 'Posts' },
    { href: '/friends', label: 'Friends' },
  ]

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setLogged(Boolean(data.user))
    }
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogged(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <header
      className="
      sticky top-0 z-50
      bg-[var(--card-bg)]
      border-b border-[var(--border-vintage)]
      shadow-[0_3px_10px_rgba(60,50,40,0.15)]
      backdrop-blur-sm
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* --- LOGO Vintage --- */}
        <Link
          href="/"
          className="
            text-3xl font-bold tracking-wider 
            title-vintage
            text-[var(--foreground)]
            hover:text-[var(--accent)]
            transition
          "
        >
          CineVerse<span className="opacity-70">.</span>
        </Link>

        {/* --- NAVIGATION --- */}
        {logged ? (
          <div className="flex items-center space-x-6">

            {/* LINKS */}
            <nav className="hidden md:flex space-x-8">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="
                    relative text-base font-medium
                    text-[var(--foreground)]
                    hover:text-[var(--accent)]
                    transition
                    after:absolute after:-bottom-1 after:left-0 
                    after:w-full after:h-[2px]
                    after:bg-[var(--accent)]
                    after:scale-x-0 hover:after:scale-x-100
                    after:transition-transform after:duration-300
                    after:origin-left
                  "
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* --- USER MENU --- */}
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center space-x-4">

            {/* LOGIN */}
            <Link
              href="/login"
              className="
                text-sm font-semibold 
                text-[var(--foreground)]
                hover:text-[var(--accent)]
                transition
              "
            >
              Login
            </Link>

            {/* SIGNUP */}
            <Link
              href="/signup"
              className="
                text-sm font-semibold px-4 py-2 rounded-full
                bg-[var(--accent)]
                text-white
                border border-black/10
                hover:bg-[var(--accent-light)]
                transition
                shadow-sm
              "
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
