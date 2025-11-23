'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { PenSquare } from 'lucide-react'

interface Film {
  id: number
  title: string
  year?: number | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddReviewPage() {
  const [title, setTitle] = useState('')
  const [opinion, setOpinion] = useState('')
  const [scenario, setScenario] = useState(5)
  const [music, setMusic] = useState(5)
  const [specialEffects, setSpecialEffects] = useState(5)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Film[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)

  useEffect(() => {
    const fetchFilms = async () => {
      if (search.trim().length < 2) {
        setResults([])
        return
      }

      const { data, error } = await supabase
        .from('films')
        .select('id, title, year')
        .ilike('title', `%${search}%`)

      if (!error && data) {
        setResults(data as Film[])
      }
    }

    fetchFilms()
  }, [search])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!selectedFilm) {
      setMessage('Please select an existing movie from the database.')
      setLoading(false)
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('You must be logged in to publish a review.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('reviews').insert([
      {
        film_id: selectedFilm.id,
        author_id: user.id,
        opinion,
        scenario,
        music,
        special_effects: specialEffects,
        created_at: new Date(),
      },
    ])

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2))
      setMessage('Error while creating the review.')
    } else {
      setMessage('Review published successfully!')
      setTitle('')
      setOpinion('')
      setScenario(5)
      setMusic(5)
      setSpecialEffects(5)
      setSelectedFilm(null)
      setSearch('')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-2xl shadow-black/70">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] text-slate-950 shadow-md shadow-black/40">
            <PenSquare className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-50">
              Add a review
            </h1>
            <p className="text-xs text-slate-400">
              Pick an existing movie and share your thoughts.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-sm text-slate-200"
        >
          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Movie title
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setTitle(e.target.value)
                setSelectedFilm(null)
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Search an existing movie…"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              required
            />

            {isFocused && results.length > 0 && (
              <div className="absolute top-full z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 text-xs shadow-xl shadow-black/70">
                {results.map((film) => (
                  <button
                    type="button"
                    key={film.id}
                    className="flex w-full justify-start px-4 py-2 text-left text-slate-100 hover:bg-slate-900"
                    onClick={() => {
                      setTitle(film.title)
                      setSearch(film.title)
                      setSelectedFilm(film)
                      setResults([])
                    }}
                  >
                    {film.title}{' '}
                    {film.year ? (
                      <span className="ml-1 text-slate-400">({film.year})</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Review
            </label>
            <textarea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              rows={4}
              placeholder="Share your opinion about the movie..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Story
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100 outline-none focus:border-[var(--accent)]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Music
              </label>
              <select
                value={music}
                onChange={(e) => setMusic(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100 outline-none focus:border-[var(--accent)]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                VFX
              </label>
              <select
                value={specialEffects}
                onChange={(e) => setSpecialEffects(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100 outline-none focus:border-[var(--accent)]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-black/40 transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? 'Publishing…' : 'Publish review'}
          </button>

          {message && (
            <p className="mt-3 text-center text-xs font-medium text-slate-200">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}