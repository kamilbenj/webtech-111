'use client'

import Image from 'next/image'

export type Film = {
  id: number
  title: string
  year: string
  poster_url: string
  created_by: string
  created_at: string
  profiles?: {
    display_name?: string
    avatar_url?: string
  }
}

type Props = {
  film: Film
}

export default function FilmCard({ film }: Props) {
  return (
    <article className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden w-full max-w-5xl mx-auto">
      {/* 🧑‍🎬 En-tête utilisateur */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          {film.profiles?.avatar_url ? (
            <Image
              src={film.profiles.avatar_url}
              alt={film.profiles.display_name || 'Utilisateur'}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              🎬
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {film.profiles?.display_name || 'Utilisateur'}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(film.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Boutons d’action */}
        <div className="flex items-center space-x-4 text-gray-500">
          <button className="hover:text-gray-700 transition" title="Commenter">💬</button>
          <button className="hover:text-gray-700 transition" title="Enregistrer">💾</button>
          <button className="hover:text-gray-700 transition" title="Partager">🔁</button>
        </div>
      </div>

      {/* 🖼️ Image + contenu */}
      <div className="flex flex-col md:flex-row">
        {film.poster_url && (
          <div className="relative w-full md:w-1/3 h-[500px] border-r border-gray-100">
            <Image
              src={film.poster_url}
              alt={film.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 px-6 py-5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{film.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{film.year}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
