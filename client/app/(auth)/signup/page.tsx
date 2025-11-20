'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import type { AuthError, AuthResponse } from '@supabase/supabase-js'

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
  const [isPrivate, setIsPrivate] = useState(false) //public par défaut



  // Gérer l’image de profil et la preview
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // Formulaire
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Création du compte utilisateur
      const { data: signUpData, error: signUpError }: AuthResponse = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError
      const user = signUpData?.user
      if (!user) throw new Error("Impossible de récupérer l'utilisateur créé.")

      // Insertion du profil utilisateur de base (sans image)
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

      // Upload de l’avatar
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

        //Récupération de l’URL 
        const { 
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)

        // Mise à jour du profil avec l’URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)

        if (updateError) throw updateError
      }

      // Redirection
      router.replace('/feed')
    } catch (err) {
      console.log("Signup error:", err);
      const message =
        (err as AuthError)?.message ||
        (err instanceof Error ? err.message : 'Erreur inconnue')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      {/* Fond orangé */}
      <div className="fixed inset-0 bg-orange-200/90 z-0"></div>

      <div className="relative z-10 w-full max-w-md bg-white border border-orange-300 shadow-2xl rounded-2xl p-8 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text">
          Créer ton compte 🎬
        </h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                width={100}
                height={100}
                className="rounded-full object-cover border-4 border-orange-300 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400 border-4 border-dashed border-gray-300">
                📸
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow cursor-pointer transition"
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
          <p className="text-sm text-gray-500 mt-2">Photo de profil</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              * Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              * Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>

          {/* Nom d’affichage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              * Nom d’affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ton nom visible publiquement"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parle un peu de toi..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition resize-none"
            />
          </div>

          {/* Visibilité du profil */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Visibilité du profil
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 py-2 rounded-xl font-semibold transition ${
                  !isPrivate
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 py-2 rounded-xl font-semibold transition ${
                  isPrivate
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Privé
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 transition-all disabled:opacity-60"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Déjà inscrit ?{' '}
          <Link
            href="/login"
            className="font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent hover:from-orange-600 hover:to-yellow-500 transition"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
