'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Search, UserPlus, Users } from 'lucide-react'

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const loadFriends = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) return

    setUserId(user.id)

    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendIds =
      friendships?.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      ) || []

    if (friendIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', friendIds)

      setFriends(profiles || [])
    }

    const { data: pending } = await supabase
      .from('friendships')
      .select('addressee_id')
      .eq('requester_id', user.id)
      .eq('status', 'pending')

    setPendingRequests(pending?.map((p) => p.addressee_id) || [])

    setLoading(false)
  }

  const handleSearch = async (value: string) => {
    setSearch(value)

    if (value.trim() === '') {
      setResults([])
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${value}%`)
      .limit(10)

    setResults(data || [])
  }

  const sendFriendRequest = async (targetId: string) => {
    if (!userId) return

    const { error } = await supabase.from('friendships').insert({
      requester_id: userId,
      addressee_id: targetId,
      status: 'pending',
    })

    if (!error) {
      setPendingRequests((prev) => [...prev, targetId])
    }
  }

  useEffect(() => {
    loadFriends()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Friends</h1>
            <p className="text-xs text-slate-400">
              Manage your friends and discover new movie lovers.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 sm:flex">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{friends.length} friends</span>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/50">
          <div className="relative">
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search a user…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>

            {results.length > 0 && (
              <ul className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 text-sm shadow-xl shadow-black/60">
                {results.map((user) => {
                  const alreadyFriend = friends.some((f) => f.id === user.id)
                  const pending = pendingRequests.includes(user.id)
                  const isSelf = user.id === userId

                  return (
                    <li
                      key={user.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-900"
                    >
                      <Link
                        href={`/friends/${user.id}`}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={user.avatar_url || '/default-avatar.png'}
                          className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                        />
                        <span className="text-xs font-medium text-slate-100">
                          {user.display_name}
                        </span>
                      </Link>

                      {!isSelf && !alreadyFriend && !pending && (
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold text-slate-950 shadow-sm shadow-black/40"
                        >
                          <UserPlus className="h-3 w-3" />
                          Add
                        </button>
                      )}

                      {pending && (
                        <span className="text-[11px] italic text-slate-400">
                          Pending…
                        </span>
                      )}

                      {alreadyFriend && (
                        <span className="text-[11px] font-semibold text-emerald-400">
                          Friend ✓
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/50">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Users className="h-4 w-4 text-slate-400" />
            My friends
          </h2>

          {loading ? (
            <p className="text-xs text-slate-400">Loading…</p>
          ) : friends.length === 0 ? (
            <p className="text-xs text-slate-400">
              You don&apos;t have any friends yet. Invite people to follow you 😄
            </p>
          ) : (
            <ul className="space-y-3">
              {friends.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={f.avatar_url || '/default-avatar.png'}
                      className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                    />
                    <Link
                      href={`/friends/${f.id}`}
                      className="text-sm font-medium text-slate-100 hover:text-[var(--accent)]"
                    >
                      {f.display_name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}