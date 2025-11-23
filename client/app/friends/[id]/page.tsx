'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import FilmCard from '@/app/components/FilmCard'
import { Users } from 'lucide-react'

export default function FriendProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: friendId } = use(params)

  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [commonFriends, setCommonFriends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url')
        .eq('id', friendId)
        .single()

      setProfile(profileData)

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          film_id,
          opinion,
          scenario,
          music,
          special_effects,
          created_at,
          films (*),
          profiles:author_id (display_name, avatar_url)
        `)
        .eq('author_id', friendId)
        .order('created_at', { ascending: false })

      setReviews(reviewsData || [])

      const { data: userFriends } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const userFriendIds = [
        ...new Set(
          (userFriends || []).map((f) =>
            f.requester_id === user.id ? f.addressee_id : f.requester_id
          )
        ),
      ]

      const { data: friendFriends } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${friendId},addressee_id.eq.${friendId}`)
        .eq('status', 'accepted')

      const friendFriendIds = [
        ...new Set(
          (friendFriends || []).map((f) =>
            f.requester_id === friendId ? f.addressee_id : f.requester_id
          )
        ),
      ]

      const sharedIds = userFriendIds.filter((id) =>
        friendFriendIds.includes(id)
      )

      if (sharedIds.length > 0) {
        const { data: sharedProfiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', sharedIds)

        setCommonFriends(sharedProfiles || [])
      }

      setLoading(false)
    })()
  }, [friendId])

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading…
      </div>
    )
  if (!profile)
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
        Profile not found.
      </div>
    )

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/60">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
            <img
              src={profile.avatar_url || '/default-avatar.png'}
              className="h-24 w-24 rounded-full border-4 border-slate-800 object-cover shadow-lg"
            />
            <div className="text-center md:text-left">
              <h1 className="text-xl font-semibold text-slate-50">
                {profile.display_name}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                {profile.bio ?? 'No bio yet.'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/60">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Mutual friends
            </h2>
          </div>

          {commonFriends.length === 0 ? (
            <p className="text-xs text-slate-400">No mutual friends.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {commonFriends.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                >
                  <a
                    href={`/friends/${f.id}`}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={f.avatar_url || '/default-avatar.png'}
                      className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                    />
                    <span className="text-sm font-medium text-slate-100 hover:text-[var(--accent)]">
                      {f.display_name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Their reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No review published yet.</p>
          ) : (
            <div className="flex flex-col items-center gap-5">
              {reviews.map((r) => (
                <FilmCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}