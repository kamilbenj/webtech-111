'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const [isFocused, setIsFocused] = useState(false)
  const [search, setSearch] = useState('')

  const links = [
    { href: '/', label: 'Discover' },
    { href: '/posts', label: 'Posts' },
    { href: '/contact', label: 'Contact' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"> {/* Main container*/}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center px-6 md:px-8 py-4">
        {/* Left Column */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text"
          >
            CineVerse<span className="text-gray-800">.</span>
          </Link>
        </div>

        {/* Main column - Nav*/}
        <nav className="hidden md:flex justify-center space-x-8">
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`relative text-base transition-all duration-200 ${
                  isActive
                    ? 'font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent'
                    : 'text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 bg-clip-text'
                }`}
              >
                {label}

              </Link>
            )
          })}
        </nav>

        {/* Right column */}
        <div className="flex justify-end items-center space-x-4 md:space-x-6">
          {/* Search bar */}
          <div
            className={`hidden sm:flex items-center rounded-full overflow-hidden w-40 md:w-56 transition-all duration-300 border ${
              isFocused ? 'bg-white border-orange-400' : 'bg-gray-100 border-gray-300'
            }`}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search a movie..."
              className="flex-grow px-3 py-2 bg-transparent text-gray-700 text-sm outline-none placeholder-gray-400"
            />
          </div>

          {/* Sign in */}
          <button className="text-sm font-semibold px-4 py-2 rounded-full text-white bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 transition">
            Sign in
          </button>
        </div>
      </div>
    </header>
  )
}
