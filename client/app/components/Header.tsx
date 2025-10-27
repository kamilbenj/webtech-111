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
    <header className="sticky top-0 z-50 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          MyBlog<span className="text-black-200">.</span>
        </Link>

        {/* Nav + Search */}
        <div className="flex items-center space-x-6">
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition-all duration-200 py-2 ${
                  pathname === href
                    ? 'text-black font-bold border-b-2 border-black pb-1'
                    : 'text-black-100 hover:text-black hover:font-semibold'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div
            className={`flex items-center rounded-full overflow-hidden w-56 transition-all duration-300 border ${
              isFocused ? 'bg-white border-black' : 'bg-gray-200 border-gray-300'
            }`}
          >
            
            {/* Champ de saisie */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search..."
              className="flex-grow px-3 py-2 bg-transparent text-gray-700 text-sm outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="hidden md:flex space-x-3">
          <button className="text-sm font-medium px-4 py-2 bg-white text-purple-700 rounded-full hover:bg-black-100">
            Sign up
          </button>
        </div>
      </div>
    </header>
  )
}
