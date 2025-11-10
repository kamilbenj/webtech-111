'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '../components/AuthGate'
import CategoryFilter from '../components/CategoryFilter'
import FilmCard, { Film } from '../components/FilmCard'

export default function FeedPage() {
  const [films, setFilms] = useState<Film[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 🔗 Récupération des films avec profils et catégories
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
          ),
          film_categories!inner (
            category_id,
            categories!inner (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement films :', error.message)
        setFilms([])
      } else if (data) {
        const filmsWithCats = data.map((f: any) => ({
          ...f,
          categories: f.film_categories?.map((fc: any) => ({
            category_id: fc.category_id,
            category_name: fc.categories.name
          }))
        }))
        setFilms(filmsWithCats)

        // Liste unique des catégories pour le dropdown
        const allCats: { id: number; name: string }[] = []
        const seen = new Set<string>()
        filmsWithCats.forEach((f: Film) => {
          f.categories?.forEach((cat) => {
            if (!seen.has(cat.category_name)) {
              seen.add(cat.category_name)
              allCats.push({ id: cat.category_id, name: cat.category_name })
            }
          })
        })
        setCategories(allCats)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Filtrage par catégorie
  const filteredFilms = useMemo(() => {
    if (selectedCategory === 'All') return films
    return films.filter((f) =>
      f.categories?.some((c) => c.category_name === selectedCategory)
    )
  }, [selectedCategory, films])

  return (
    <AuthGate>
      <section className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800">🎥 Ton Feed</h1>
            <CategoryFilter
              selected={selectedCategory}
              onChange={setSelectedCategory}
              categories={categories}
            />
          </header>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Chargement des films...</div>
          ) : filteredFilms.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Aucun film trouvé pour cette catégorie.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {filteredFilms.map((film) => (
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
