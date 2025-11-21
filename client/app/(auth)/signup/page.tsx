'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import type { AuthError, AuthResponse } from '@supabase/supabase-js'
import { UserPlus, Camera } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: signUpData, error: signUpError }: AuthResponse =
        await supabase.auth.signUp({
          email,
          password,
        })

      if (signUpError) throw signUpError
      const user = signUpData?.user
      if (!user) throw new Error("Impossible de récupérer l'utilisateur créé.")

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username: email.split('@')[0],
          display_name: displayName,
          bio: bio || null,
          avatar_url: null,
          is_private: isPrivate,
        },
      ])
      if (profileError) throw profileError

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${user.id}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)

        if (updateError) throw updateError
      }

      router.replace('/feed')
    } catch (err) {
      console.log('Signup error:', err)
      const message =
        (err as AuthError)?.message ||
        (err instanceof Error ? err.message : 'Erreur inconnue')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-black px-4">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-black/70">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/40">
            <UserPlus className="h-5 w-5 text-slate-950" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-50">
            Créer ton compte
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Rejoins la communauté et partage tes critiques de films.
          </p>
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-4 border-slate-800 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-slate-700 bg-slate-900 text-slate-500">
                <Camera className="h-7 w-7" />
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40 transition hover:from-amber-300 hover:to-orange-400"
              title="Choisir une image"
            >
              +
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Photo de profil</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              * Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              * Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              * Nom d’affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nom visible publiquement"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parle un peu de toi..."
              rows={3}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>

          {/* Visibilité du profil */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Visibilité du profil
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                  !isPrivate
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40'
                    : 'border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                  isPrivate
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40'
                    : 'border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                }`}
              >
                Privé
              </button>
            </div>
          </div>

          {error && (
            <p className="text-center text-xs font-medium text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/40 transition hover:from-amber-300 hover:to-orange-400 disabled:opacity-60"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Déjà inscrit ?{' '}
          <Link
            href="/login"
            className="font-semibold text-amber-400 hover:text-amber-300"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}