'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Film, User } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const [isFocused, setIsFocused] = useState(false)
  const [search, setSearch] = useState('')

  const links = [
    { href: '/feed', label: 'Feed' },
    { href: '/discover', label: 'Discover' },
    { href: '/friends', label: 'Friends' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">

        <Link href="/feed" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/40">
            <Film className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-50">
            CineVerse
            <span className="text-amber-400">.</span>
          </span>
        </Link>


        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`relative transition-colors ${
                  isActive
                    ? 'text-amber-400'
                    : 'hover:text-amber-300/90 text-slate-300'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                )}
              </Link>
            )
          })}
        </nav>


        <div className="flex items-center gap-3 md:gap-4">

          <div
            className={`hidden items-center gap-2 rounded-full border bg-slate-900/80 px-3 py-1.5 text-sm text-slate-200 shadow-sm transition-all md:flex ${
              isFocused
                ? 'border-amber-400/70 shadow-amber-500/20'
                : 'border-slate-700/80'
            }`}
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search a movie…"
              className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-500 md:w-48"
            />
          </div>


          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg shadow-orange-500/40 hover:from-amber-300 hover:to-orange-400 md:px-4 md:text-sm"
          >
            <User className="h-4 w-4" />
            <span>Sign in</span>
          </Link>
        </div>
      </div>
    </header>
  )
}