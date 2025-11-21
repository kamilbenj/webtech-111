'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Camera, Lock, Globe2, User as UserIcon } from 'lucide-react'

type Review = {
  id: number
  film_id: number | null
  opinion: string | null
  scenario: number | null
  music: number | null
  special_effects: number | null
  created_at: string | null
  film_title?: string | null
  poster_url?: string | null
}

type Profile = {
  id: string
  username: string | null
  display_name: string | null
  bio?: string | null
  avatar_url?: string | null
  is_private: boolean
}

type User = {
  id: string
  email: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [pseudo, setPseudo] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !currentUser) {
        setError('Tu dois être connecté pour voir ton profil.')
        setLoading(false)
        return
      }

      setUser({ id: currentUser.id, email: currentUser.email ?? '' })
      setEmail(currentUser.email ?? '')

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, is_private')
        .eq('id', currentUser.id)
        .single()

      if (profilesData) {
        setProfile(profilesData)
        setPseudo(profilesData.display_name || '')
        setBio(profilesData.bio || '')
        setAvatarPreview(profilesData.avatar_url || null)
        setIsPrivate(profilesData.is_private ?? false)
      }

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(
          `
          id,
          film_id,
          opinion,
          scenario,
          music,
          special_effects,
          created_at,
          films ( title, poster_url )
        `
        )
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (reviewsData) {
        const mapped: Review[] = reviewsData.map((r: any) => ({
          id: r.id,
          film_id: r.film_id,
          opinion: r.opinion,
          scenario: r.scenario,
          music: r.music,
          special_effects: r.special_effects,
          created_at: r.created_at,
          film_title: r.films?.title || null,
          poster_url: r.films?.poster_url || null,
        }))
        setReviews(mapped)
      }

      setLoading(false)
    })()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '0',
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

      setAvatarPreview(publicUrl)
      setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : null))

      setMessage('✅ Photo de profil mise à jour !')
    } catch (err) {
      console.error(err)
      setError("Erreur lors du téléchargement de l'image.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)
    setError(null)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: pseudo, bio, is_private: isPrivate })
      .eq('id', user.id)

    if (updateError) {
      setError('Impossible de mettre à jour le profil.')
      console.error(updateError)
    } else {
      setMessage('Profil mis à jour !')
      setProfile((p) =>
        p ? { ...p, display_name: pseudo, bio, is_private: isPrivate } : null
      )
    }

    setSaving(false)
  }

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const updates: { email?: string; password?: string } = {}
    if (email) updates.email = email
    if (newPassword) updates.password = newPassword

    const { error: authError } = await supabase.auth.updateUser(updates)
    if (authError) {
      setError('Erreur lors de la mise à jour des identifiants.')
    } else {
      setMessage('Compte mis à jour !')
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser()
      setUser(
        updatedUser
          ? { id: updatedUser.id, email: updatedUser.email ?? '' }
          : null
      )
    }

    setNewPassword('')
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Chargement…
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-red-400">
        {error}
      </div>
    )

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
        {/* Colonne gauche : profil */}
        <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-xl shadow-black/70 lg:w-1/2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-50">
                Mon profil
              </h1>
              <p className="text-[11px] text-slate-400">
                Modifie ton identité et ta visibilité.
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
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

            <button
              onClick={handleAvatarUpload}
              disabled={saving}
              className="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-100 shadow-sm shadow-black/30 hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Envoi...' : 'Mettre à jour la photo'}
            </button>
          </div>

          {/* Pseudo / bio / visibilité */}
          <form
            onSubmit={handleUpdateProfile}
            className="space-y-4 text-sm text-slate-200"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                placeholder="Ton pseudo"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                placeholder="Ta bio..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Visibilité du profil
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                    !isPrivate
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40'
                      : 'border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <Globe2 className="h-3 w-3" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                    isPrivate
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/40'
                      : 'border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <Lock className="h-3 w-3" />
                  Privé
                </button>
              </div>
            </div>

            <button
              disabled={saving}
              className="mt-1 w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm shadow-black/40 hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Sauvegarde...' : 'Mettre à jour le profil'}
            </button>
          </form>

          {/* Auth infos */}
          <form
            onSubmit={handleUpdateAuth}
            className="mt-6 space-y-3 text-sm text-slate-200"
          >
            <p className="text-xs font-medium text-slate-300">
              Email & mot de passe
            </p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                placeholder="Email"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                placeholder="Nouveau mot de passe"
              />
            </div>
            <button
              disabled={saving}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm shadow-black/40 hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Mise à jour...' : 'Mettre à jour le compte'}
            </button>
          </form>

          {message && (
            <div className="mt-3 text-xs text-emerald-400">{message}</div>
          )}
          {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
        </section>

        {/* Colonne droite : critiques */}
        <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-xl shadow-black/70 lg:w-1/2">
          <h2 className="mb-4 text-sm font-semibold text-slate-100">
            Mes critiques
          </h2>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">
              Aucune critique publiée pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
                >
                  <div className="flex h-24 w-16 items-center justify-center overflow-hidden rounded-xl bg-slate-950">
                    {r.poster_url ? (
                      <img
                        src={r.poster_url}
                        alt={r.film_title ?? 'poster'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Pas d’affiche
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-xs text-slate-200">
                    <h3 className="text-sm font-semibold text-slate-50">
                      {r.film_title ?? `Film #${r.film_id ?? '?'}`}{' '}
                      <span className="text-[11px] text-slate-400">
                        (
                        {r.created_at
                          ? new Date(r.created_at).getFullYear()
                          : '?'}
                        )
                      </span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-300">{r.opinion}</p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Scénario : {r.scenario ?? '-'} · Musique :{' '}
                      {r.music ?? '-'} · Effets spéciaux :{' '}
                      {r.special_effects ?? '-'}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}