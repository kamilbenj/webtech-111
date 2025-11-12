'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fermer le menu si clic en dehors
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
      {/* Bouton utilisateur */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 shadow-md transition"
      >
        <User className="w-5 h-5 text-white" />
      </button>

      {/* Menu déroulant */}
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
          <button
            onClick={() => {
              router.push('/profile')
              setOpen(false)
            }}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
          >
            <User className="w-4 h-4 mr-2 text-gray-500" /> Mon compte
          </button>

          <button
            onClick={() => {
              router.push('/settings')
              setOpen(false)
            }}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
          >
            <Settings className="w-4 h-4 mr-2 text-gray-500" /> Paramètres
          </button>

          <hr className="border-gray-200" />

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
