'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Star, MessageCircle, Send, MoreHorizontal } from 'lucide-react'

export type Review = {
  id: number
  film_id: number
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
  review_comments?: {
    id: number
    content: string
    created_at: string
    profiles: {
      display_name?: string
      avatar_url?: string
    } | null
  }[]
}

type Props = {
  review: Review
}

export default function FilmCard({ review }: Props) {
  const film = review.films
  const initialComments = review.review_comments || []

  const COMMENTS_SHOWN = 2
  const [comments, setComments] = useState(initialComments)
  const [showAll, setShowAll] = useState(false)
  const visibleComments = showAll ? comments : comments.slice(0, COMMENTS_SHOWN)

  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendComment = async () => {
    if (!commentText.trim()) return

    setSending(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSending(false)
      return
    }

    const { data: newComment } = await supabase
      .from('review_comments')
      .insert({
        review_id: review.id,
        author_id: user.id,
        content: commentText.trim(),
      })
      .select(
        `
        *,
        profiles:author_id (
          display_name,
          avatar_url
        )
      `
      )
      .single()

    if (newComment) {
      setComments((prev) => [newComment, ...prev])
      setCommentText('')
    }

    setSending(false)
  }

  const formattedDate = new Date(review.created_at).toLocaleDateString()

  return (
    <article className="card w-full max-w-3xl overflow-hidden">

      <div className="flex items-center justify-between border-b border-slate-800/70 px-5 py-4">
        <div className="flex items-center gap-3">
          {review.profiles?.avatar_url ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-700">
              <Image
                src={review.profiles.avatar_url}
                alt={review.profiles.display_name || 'User'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg">
              🎬
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-50">
              {review.profiles?.display_name || 'User'}
            </span>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-slate-400 hover:text-slate-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>


      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row">

        {film?.poster_url && (
          <div className="relative mx-auto h-60 w-40 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900 md:mx-0">
            <Image
              src={film.poster_url}
              alt={film.title || 'Movie poster'}
              fill
              className="object-cover"
            />
          </div>
        )}


        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              {film?.title || 'Unknown title'}
            </h2>
            {film?.year && (
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {film.year}
              </p>
            )}
          </div>


          <div className="space-y-2 text-sm">
            <RatingLine label="Story" value={review.scenario} />
            <RatingLine label="Music" value={review.music} />
            <RatingLine label="VFX" value={review.special_effects} />
          </div>


          <div className="mt-2 rounded-xl bg-slate-900/70 px-4 py-3 text-sm text-slate-100">
            <p className="leading-relaxed">{review.opinion}</p>
          </div>
        </div>
      </div>


      <div className="flex items-center gap-4 border-t border-slate-800/70 px-5 py-3 text-xs text-slate-400">
        <div className="inline-flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length} comments</span>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-800/70 bg-slate-950/40 px-5 py-4">
        {comments.length === 0 && (
          <p className="text-xs italic text-slate-500">
            No comments yet. Be the first to comment!
          </p>
        )}

        <div className="space-y-3">
          {visibleComments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              {c.profiles?.avatar_url ? (
                <div className="relative h-7 w-7 overflow-hidden rounded-full border border-slate-700">
                  <Image
                    src={c.profiles.avatar_url}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-full bg-slate-800" />
              )}

              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-100">
                  {c.profiles?.display_name || 'User'}
                </p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {c.content}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {comments.length > COMMENTS_SHOWN && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            {showAll ? 'Show fewer comments' : 'Show more comments'}
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <UserAvatarMini />

          <div className="flex flex-1 items-center rounded-full bg-slate-900/80 px-3 py-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <button
              onClick={handleSendComment}
              disabled={sending}
              className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function RatingLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <p className="w-28 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <StarRating rating={value} />
      <span className="text-xs text-slate-400">{value}/5</span>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
          }`}
        />
      ))}
    </div>
  )
}

function UserAvatarMini() {
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
      setAvatar(data?.avatar_url ?? null)
    })
  }, [])

  if (!avatar)
    return <div className="h-7 w-7 rounded-full bg-slate-700" />

  return (
    <div className="relative h-7 w-7 overflow-hidden rounded-full border border-slate-700">
      <Image
        src={avatar}
        alt="me"
        fill
        className="object-cover object-center"
      />
    </div>
  )
}