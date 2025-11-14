'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '../components/AuthGate'
import FilmCard, { Review } from '../components/FilmCard'

type Category = { id: number; name: string }
type FilmCategory = { film_id: number; category_id: number }

export default function FeedPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [filmCategories, setFilmCategories] = useState<FilmCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  // filtres par notes
  const [scenarioFilter, setScenarioFilter] = useState<number | null>(null)
  const [musicFilter, setMusicFilter] = useState<number | null>(null)
  const [specialEffectsFilter, setSpecialEffectsFilter] = useState<number | null>(null)

  // 1) Charger les catégories pour le select
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Erreur chargement catégories :', error.message)
      } else if (data) {
        setCategories(data as Category[])
      }
    }

    loadCategories()
  }, [])

  // 2) Charger les relations film <-> catégorie
  useEffect(() => {
    const loadFilmCategories = async () => {
      const { data, error } = await supabase
        .from('film_categories')
        .select('film_id, category_id')

      if (error) {
        console.error('Erreur chargement film_categories :', error.message)
      } else if (data) {
        setFilmCategories(data as FilmCategory[])
      }
    }

    loadFilmCategories()
  }, [])

  // 3) Charger les reviews + infos film / auteur
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

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

  // 4) Appliquer les filtres (catégorie + notes) côté client
  const filteredReviews = useMemo(() => {
    let result = reviews

    // filtre par catégorie
    if (selectedCategoryId) {
      const matchingFilmIds = new Set(
        filmCategories
          .filter((fc) => fc.category_id === selectedCategoryId)
          .map((fc) => fc.film_id)
      )

      result = result.filter((r) => matchingFilmIds.has(r.film_id))
    }

    // filtre par notes
    result = result.filter((r) => {
      const scenarioOk =
        scenarioFilter === null || r.scenario === scenarioFilter
      const musicOk =
        musicFilter === null || r.music === musicFilter
      const specialOk =
        specialEffectsFilter === null || r.special_effects === specialEffectsFilter

      return scenarioOk && musicOk && specialOk
    })

    return result
  }, [
    reviews,
    filmCategories,
    selectedCategoryId,
    scenarioFilter,
    musicFilter,
    specialEffectsFilter,
  ])

  const headerTitle = useMemo(() => {
    if (!selectedCategoryId) return 'Les Dernières Critiques'
    const cat = categories.find((c) => c.id === selectedCategoryId)
    return cat ? `Critiques — ${cat.name}` : 'Les Dernières Critiques'
  }, [selectedCategoryId, categories])

  // helper pour les options de notes
  const renderRatingSelect = (
    label: string,
    value: number | null,
    onChange: (v: number | null) => void,
    id: string
  ) => (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-gray-600">
        {label}
      </label>
      <select
        id={id}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      >
        <option value="">Toutes</option>
        <option value={1}>1 ★</option>
        <option value={2}>2 ★</option>
        <option value={3}>3 ★</option>
        <option value={4}>4 ★</option>
        <option value={5}>5 ★</option>
      </select>
    </div>
  )

  return (
    <AuthGate>
      <section className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h1 className="text-3xl font-extrabold text-gray-800">
                {headerTitle}
              </h1>

              {/* Filtre catégorie */}
              <div className="flex items-center gap-2">
                <label htmlFor="category" className="text-sm text-gray-600">
                  Filtrer par catégorie
                </label>
                <select
                  id="category"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={selectedCategoryId ?? ''}
                  onChange={(e) =>
                    setSelectedCategoryId(
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Toutes</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtres par notes */}
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-semibold text-gray-700">
                Filtrer par notes :
              </span>
              {renderRatingSelect(
                'Scénario',
                scenarioFilter,
                setScenarioFilter,
                'scenario-rating'
              )}
              {renderRatingSelect(
                'Musique',
                musicFilter,
                setMusicFilter,
                'music-rating'
              )}
              {renderRatingSelect(
                'Effets spéciaux',
                specialEffectsFilter,
                setSpecialEffectsFilter,
                'fx-rating'
              )}
            </div>
          </header>

          {loading ? (
            <div className="text-center text-gray-500 py-10">
              Chargement des critiques...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Aucune critique trouvée.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {filteredReviews.map((review) => (
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