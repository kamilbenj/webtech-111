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
  categories?: { category_id: number; category_name: string }[]
}

type FilmCardProps = {
  film: Film
}

export default function FilmCard({ film }: FilmCardProps) {
  return (
    <article className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden w-full max-w-5xl mx-auto">
      {/* En-tête : profil utilisateur */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          {film.profiles?.avatar_url ? (
            <img
              src={film.profiles.avatar_url}
              alt={film.profiles.display_name || 'Avatar'}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              🎬
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {film.profiles?.display_name || 'Utilisateur inconnu'}
            </p>
          </div>
        </div>
      </div>

      {/* Image + contenu */}
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

            {/* Catégories */}
            {film.categories && film.categories.length > 0 && (
              <p className="text-sm text-gray-500 mb-2">
                {film.categories.map((c) => c.category_name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
