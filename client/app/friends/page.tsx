"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const loadFriends = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    setUserId(user.id);

    // --- Amis acceptés ---
    const { data: friendships } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const friendIds =
      friendships?.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      ) || [];

    if (friendIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", friendIds);

      setFriends(profiles || []);
    }

    // --- Demandes en attente envoyées ---
    const { data: pending } = await supabase
      .from("friendships")
      .select("addressee_id")
      .eq("requester_id", user.id)
      .eq("status", "pending");

    setPendingRequests(pending?.map((p) => p.addressee_id) || []);

    setLoading(false);
  };

  // --- Recherche utilisateurs ---
  const handleSearch = async (value: string) => {
    setSearch(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .ilike("display_name", `%${value}%`)
      .limit(10);

    setResults(data || []);
  };

  // --- Ajouter un ami ---
  const sendFriendRequest = async (targetId: string) => {
    if (!userId) return;

    const { error } = await supabase.from("friendships").insert({
      requester_id: userId,
      addressee_id: targetId,
      status: "pending",
    });

    if (!error) {
      setPendingRequests((prev) => [...prev, targetId]);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <div
      className="
        min-h-screen w-full
        bg-[url('/paper-texture.jpg')]
        bg-center bg-fixed bg-[length:550px]
        py-12 rounded-3xl overflow-hidden mx-4
      "
    >
      <main
        className="
          p-8 max-w-2xl mx-auto space-y-6
          bg-[rgba(255,252,245,0.85)]
          rounded-xl shadow-lg
          border border-[#d6c7a1]
          backdrop-blur-sm
        "
      >
        <h1 className="text-3xl font-bold text-[#3a2f1a]">Mes amis</h1>

        {/* Recherche */}
        <div className="relative p-4 rounded-lg border border-[#d6c7a1] bg-[rgba(255,249,235,0.7)] shadow-sm">
          <input
            type="text"
            placeholder="Rechercher un utilisateur…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white/70 border border-[#ccbfa0] text-[#3a2f1a]"
          />

          {/* Résultats recherche */}
          {results.length > 0 && (
            <ul
              className="
                absolute left-4 right-4 mt-2
                bg-[rgba(255,252,245,0.95)]
                border border-[#ccbfa0]
                rounded-lg shadow-md
                max-h-60 overflow-y-auto z-50
              "
            >
              {results.map((user) => {
                const alreadyFriend = friends.some((f) => f.id === user.id);
                const pending = pendingRequests.includes(user.id);
                const isSelf = user.id === userId;

                return (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-3"
                  >
                    <Link
                      href={`/friends/${user.id}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={user.avatar_url || "/default-avatar.png"}
                        className="w-10 h-10 rounded-full border border-[#bda887] object-cover"
                      />
                      <span className="text-[#3a2f1a]">
                        {user.display_name}
                      </span>
                    </Link>

                    {!isSelf && !alreadyFriend && !pending && (
                      <button
                        onClick={() => sendFriendRequest(user.id)}
                        className="px-3 py-1 text-xs bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg shadow"
                      >
                        Ajouter
                      </button>
                    )}

                    {pending && (
                      <span className="text-sm text-gray-500 italic">
                        En attente…
                      </span>
                    )}

                    {alreadyFriend && (
                      <span className="text-sm text-green-700 font-semibold">
                        Ami ✓
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Liste amis */}
        <div className="p-4 rounded-lg border border-[#d6c7a1] bg-[rgba(255,249,235,0.7)] shadow-sm">
          <h2 className="text-xl font-semibold text-[#3a2f1a] mb-3">
            Liste de mes amis
          </h2>

          {friends.length === 0 ? (
            <p className="text-gray-600">Tu n’as pas encore d’amis 😢</p>
          ) : (
            <ul className="space-y-3">
              {friends.map((f) => (
                <li
                  key={f.id}
                  className="
                    relative flex items-center gap-4 p-4
                    rounded-xl border border-[#d6c7a1]
                    shadow-[0_2px_6px_rgba(60,50,40,0.15)]
                    overflow-hidden
                    bg-[rgba(255,252,245,0.85)]
                    before:content-['']
                    before:absolute before:inset-0
                    before:bg-[url('/paper-texture.jpg')]
                    before:bg-cover before:bg-center
                    before:opacity-10
                    hover:before:opacity-20
                    before:transition-opacity
                  "
                >
                  <img
                    src={f.avatar_url || "/default-avatar.png"}
                    className="
                      w-12 h-12 rounded-full border border-[#bda887]
                      object-cover relative z-10
                    "
                  />

                  <Link href={`/friends/${f.id}`} className="relative z-10">
                    <span className="font-medium text-[#3a2f1a] hover:underline">
                      {f.display_name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
