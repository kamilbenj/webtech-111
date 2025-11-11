'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '../components/AuthGate'
import FilmCard, { Review } from '../components/FilmCard'

export default function FeedPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 🔗 Récupération des reviews avec les films et les profils
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          film_id,
          scenario,
          music,
          special_effects,
          opinion,
          created_at,
          profiles:author_id (
            display_name,
            avatar_url
          ),
          films:film_id (
            title,
            year,
            poster_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement reviews :', error.message)
        setReviews([])
      } else if (data) {
        setReviews(data as Review[])
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
            <h1 className="text-3xl font-extrabold text-gray-800">🎬 Les Dernières Critiques</h1>
          </header>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Chargement des critiques...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Aucune critique trouvée.</div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {reviews.map((review) => (
                <FilmCard key={review.id} review={review} />
              ))}
            </div>
          )}

          <footer className="text-sm text-neutral-500 text-center pt-10 border-t border-gray-200">
            À venir : likes, commentaires et pages de détails 🎥
          </footer>
        </div>
      </section>
    </AuthGate>
  )
}
