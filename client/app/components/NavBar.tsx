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
    { href: '/contact', label: 'Contact' },
    { href: '/about', label: 'About' },
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
    <header className="sticky top-0 z-50 bg-white backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text"
        >
          CineVerse<span className="text-gray-800">.</span>
        </Link>

        {/* Navigation */}
        {logged ? (
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-8">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative text-base text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 bg-clip-text font-medium transition"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Bouton utilisateur + menu déroulant */}
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 bg-clip-text transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-full text-white bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
