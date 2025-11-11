'use client'

import Image from 'next/image'

export type Review = {
  id: number
  scenario: number
  music: number
  special_effects: number
  opinion: string
  created_at: string
  films?: {
    title?: string
    year?: string
    poster_url?: string
  }
  profiles?: {
    display_name?: string
    avatar_url?: string
  }
}

type Props = {
  review: Review
}

export default function FilmCard({ review }: Props) {
  const film = review.films

  return (
    <article className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden w-full max-w-5xl mx-auto">
      {/* 🧑‍🎬 En-tête utilisateur */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          {review.profiles?.avatar_url ? (
            <Image
              src={review.profiles.avatar_url}
              alt={review.profiles.display_name || 'Utilisateur'}
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
              {review.profiles?.display_name || 'Utilisateur'}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-gray-500">
          <button className="hover:text-gray-700 transition" title="Commenter">💬</button>
          <button className="hover:text-gray-700 transition" title="Enregistrer">💾</button>
          <button className="hover:text-gray-700 transition" title="Partager">🔁</button>
        </div>
      </div>

      {/* 🖼️ Image + contenu */}
      <div className="flex flex-col md:flex-row">
        {film?.poster_url && (
          <div className="relative w-full md:w-1/3 h-[500px] border-r border-gray-100">
            <Image
              src={film.poster_url}
              alt={film.title || 'Affiche du film'}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 px-6 py-5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{film?.title || 'Titre inconnu'}</h2>
            <p className="text-sm text-gray-500 mb-2">{film?.year || 'Année inconnue'}</p>

            {/* Étoiles */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <p className="w-28 font-semibold text-sm text-gray-700">🎬 Scénario :</p>
                <StarRating rating={review.scenario || 0} />
              </div>
              <div className="flex items-center space-x-2">
                <p className="w-28 font-semibold text-sm text-gray-700">🎵 Musique :</p>
                <StarRating rating={review.music || 0} />
              </div>
              <div className="flex items-center space-x-2">
                <p className="w-28 font-semibold text-sm text-gray-700">💥 Effets spéciaux :</p>
                <StarRating rating={review.special_effects || 0} />
              </div>
            </div>

            {/* Avis */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Avis :</h3>
              {review.opinion ? (
                <p className="text-sm text-gray-700 leading-relaxed">{review.opinion}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Aucun avis pour ce film.</p>
              )}
            </div>

            {/* Commentaires (à implémenter) */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Commentaires :</h4>
              <p className="text-sm text-gray-500 italic">À implémenter</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function StarRating({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating)
  return (
    <div className="flex space-x-1">
      {stars.map((filled, i) => (
        <span key={i} className={filled ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}
