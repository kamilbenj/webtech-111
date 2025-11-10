'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '../components/AuthGate'
import FilmCard, { Film } from '../components/FilmCard'

export default function FeedPage() {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Récupération des films avec les profils
      const { data, error } = await supabase
        .from('films')
        .select(`
          id,
          title,
          year,
          poster_url,
          created_by,
          created_at,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement films :', error.message)
        setFilms([])
      } else if (data) {
        setFilms(data as Film[])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <AuthGate>
      <section className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800">🎥 Ton Feed</h1>
          </header>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Chargement des films...</div>
          ) : films.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Aucun film trouvé.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {films.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          )}

          <footer className="text-sm text-neutral-500 text-center pt-10 border-t border-gray-200">
            À venir : système d’amis, likes, commentaires et pages de détails 🎬
          </footer>
        </div>
      </section>
    </AuthGate>
  )
}
