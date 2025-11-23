'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import FilmCard, { Review } from '../components/FilmCard'

type Category = { id: number; name: string }
type FilmCategory = { film_id: number; category_id: number }

export default function FeedPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [filmCategories, setFilmCategories] = useState<FilmCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  )

  const [scenarioFilter, setScenarioFilter] = useState<number | null>(null)
  const [musicFilter, setMusicFilter] = useState<number | null>(null)
  const [specialEffectsFilter, setSpecialEffectsFilter] =
    useState<number | null>(null)

  const [minYear, setMinYear] = useState<number | null>(null)
  const [maxYear, setMaxYear] = useState<number | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (!error && data) setCategories(data as Category[])
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadFilmCategories = async () => {
      const { data, error } = await supabase
        .from('film_categories')
        .select('film_id, category_id')

      if (!error && data) setFilmCategories(data as FilmCategory[])
    }

    loadFilmCategories()
  }, [])

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
          ),

          review_comments (
            id,
            content,
            created_at,
            profiles:author_id (
              display_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data) setReviews(data as Review[])
      else setReviews([])

      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredReviews = useMemo(() => {
    let result = reviews

    if (selectedCategoryId) {
      const matchingFilmIds = new Set(
        filmCategories
          .filter((fc) => fc.category_id === selectedCategoryId)
          .map((fc) => fc.film_id)
      )
      result = result.filter((r) => matchingFilmIds.has(r.film_id))
    }

    result = result.filter((r) => {
      const scenarioOk =
        scenarioFilter === null || r.scenario === scenarioFilter
      const musicOk = musicFilter === null || r.music === musicFilter
      const specialOk =
        specialEffectsFilter === null ||
        r.special_effects === specialEffectsFilter
      return scenarioOk && musicOk && specialOk
    })

    result = result.filter((r) => {
      const rawYear = r.films?.year
      const filmYear = rawYear ? Number(rawYear) : null

      if (filmYear === null && (minYear !== null || maxYear !== null)) {
        return false
      }

      const minOk = minYear === null || (filmYear && filmYear >= minYear)
      const maxOk = maxYear === null || (filmYear && filmYear <= maxYear)

      return minOk && maxOk
    })

    return result
  }, [
    reviews,
    filmCategories,
    selectedCategoryId,
    scenarioFilter,
    musicFilter,
    specialEffectsFilter,
    minYear,
    maxYear,
  ])

  const headerTitle = useMemo(() => {
    if (!selectedCategoryId) return 'Last reviews'
    const cat = categories.find((c) => c.id === selectedCategoryId)
    return cat ? `Reviews — ${cat.name}` : 'Last reviews'
  }, [selectedCategoryId, categories])

  const renderRatingSelect = (
    label: string,
    value: number | null,
    onChange: (v: number | null) => void,
    id: string
  ) => (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs text-slate-400">
        {label}
      </label>
      <select
        id={id}
        className="rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      >
        <option value="">All</option>
        <option value={1}>1 ★</option>
        <option value={2}>2 ★</option>
        <option value={3}>3 ★</option>
        <option value={4}>4 ★</option>
        <option value={5}>5 ★</option>
      </select>
    </div>
  )

  return (
    <main className="main-shell px-4 py-6 md:px-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row">
        
        {/* Colonne gauche : filtres */}
        <aside className="order-2 w-full space-y-4 md:order-1 md:w-64">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Filters
            </h2>

            {/* Catégorie */}
            <div className="mb-4 space-y-1">
              <label
                htmlFor="category"
                className="text-xs font-medium text-slate-300"
              >
                Category
              </label>
              <select
                id="category"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
                value={selectedCategoryId ?? ''}
                onChange={(e) =>
                  setSelectedCategoryId(
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                By rating
              </p>
              <div className="flex flex-wrap gap-3">
                {renderRatingSelect(
                  'Scenario',
                  scenarioFilter,
                  setScenarioFilter,
                  'scenario-rating'
                )}
                {renderRatingSelect(
                  'Music',
                  musicFilter,
                  setMusicFilter,
                  'music-rating'
                )}
                {renderRatingSelect(
                  'VFX',
                  specialEffectsFilter,
                  setSpecialEffectsFilter,
                  'fx-rating'
                )}
              </div>
            </div>

            {/* Années */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                By year
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">From</span>
                  <input
                    id="min-year"
                    type="number"
                    className="w-20 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100"
                    placeholder="1990"
                    value={minYear ?? ''}
                    onChange={(e) =>
                      setMinYear(
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">To</span>
                  <input
                    id="max-year"
                    type="number"
                    className="w-20 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100"
                    placeholder="2024"
                    value={maxYear ?? ''}
                    onChange={(e) =>
                      setMaxYear(
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Colonne feed */}
        <section className="order-1 flex-1 space-y-5 md:order-2">
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-slate-50">
              {headerTitle}
            </h1>
            <p className="text-xs text-slate-400">
              Les critiques des films que la communauté vient de poster.
            </p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              Chargement des critiques…
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              Aucune critique ne correspond à ces filtres.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              {filteredReviews.map((review) => (
                <FilmCard key={review.id} review={review} />
              ))}
            </div>
          )}

          <footer className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            À venir : likes, partages, et profils détaillés.
          </footer>
        </section>
      </div>
    </main>
  )
}
