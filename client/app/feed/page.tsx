'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '../components/AuthGate'
import FilmCard, { Review } from '../components/FilmCard'

export default function FeedPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Recuperation Supabase
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
            poster_url,
            film_categories (
              categories (
                id,
                name
              )
            )
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

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const r of reviews as any[]) {
      const film = (r as any).films
      const fcs: any[] | undefined = film?.film_categories
      if (!Array.isArray(fcs)) continue
      for (const fc of fcs) {
        const name: string | undefined = fc?.categories?.name
        if (typeof name === 'string' && name.trim()) set.add(name.trim())
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [reviews])

  const filteredReviews = useMemo(() => {
    if (selectedCategory === 'all') return reviews
    return (reviews as any[]).filter((r: any) => {
      const film = r?.films
      const fcs: any[] | undefined = film?.film_categories
      if (!Array.isArray(fcs)) return false
      return fcs.some((fc) => fc?.categories?.name === selectedCategory)
    })
  }, [reviews, selectedCategory])

  return (
    <AuthGate>
      <section className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800">Les Dernières Critiques</h1>
            <div className="w-full sm:w-auto">
              <label htmlFor="cat" className="sr-only">Filtrer par catégorie</label>
              <select
                id="cat"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </header>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Chargement des critiques...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Aucune critique trouvée.</div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {filteredReviews.map((review) => (
                <FilmCard key={review.id} review={review as any} />
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
