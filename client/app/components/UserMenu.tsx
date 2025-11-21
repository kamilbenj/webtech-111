'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    router.replace('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40 transition hover:from-amber-300 hover:to-orange-400"
      >
        <User className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-xl shadow-black/60">
          <button
            onClick={() => {
              router.push('/profile')
              setOpen(false)
            }}
            className="flex w-full items-center px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            <User className="mr-2 h-4 w-4 text-slate-400" /> Mon compte
          </button>

          <button
            onClick={() => {
              router.push('/settings')
              setOpen(false)
            }}
            className="flex w-full items-center px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            <Settings className="mr-2 h-4 w-4 text-slate-400" /> Paramètres
          </button>

          <hr className="border-slate-800" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm text-red-400 transition hover:bg-red-950/40"
          >
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}