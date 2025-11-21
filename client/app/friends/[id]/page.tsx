"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FilmCard from "@/app/components/FilmCard";

export default function FriendProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: friendId } = use(params);

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [commonFriends, setCommonFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      /* PROFILE */
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url")
        .eq("id", friendId)
        .single();

      setProfile(profileData);

      /* REVIEWS */
      const { data: reviewsData } = await supabase
        .from("reviews")
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
        .eq("author_id", friendId)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);

      // Amis du user
      const { data: userFriends } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq("status", "accepted");

      const userFriendIds = [
        ...new Set(
          (userFriends || []).map((f) =>
            f.requester_id === user.id ? f.addressee_id : f.requester_id
          )
        ),
      ];

      // Amis du friend
      const { data: friendFriends } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${friendId},addressee_id.eq.${friendId}`)
        .eq("status", "accepted");

      const friendFriendIds = [
        ...new Set(
          (friendFriends || []).map((f) =>
            f.requester_id === friendId ? f.addressee_id : f.requester_id
          )
        ),
      ];

      // amis en commun
      const sharedIds = userFriendIds.filter((id) =>
        friendFriendIds.includes(id)
      );

      if (sharedIds.length > 0) {
        const { data: sharedProfiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", sharedIds);

        setCommonFriends(sharedProfiles || []);
      }

      setLoading(false);
    })();
  }, [friendId]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!profile) return <div>Profil introuvable.</div>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          className="w-28 h-28 rounded-full object-cover border shadow"
        />
        <h1 className="text-3xl font-bold mt-3">{profile.display_name}</h1>
        <p className="text-gray-600">{profile.bio ?? "Aucune bio."}</p>
      </div>

      {/* --- AMIS EN COMMUN --- */}
      <h2 className="text-2xl font-semibold mb-3">Amis en commun</h2>

      {commonFriends.length === 0 ? (
        <p className="text-gray-500 mb-6">Aucun ami en commun.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {commonFriends.map((f) => (
            <li
  key={f.id}
  className="
    relative flex items-center gap-4 p-4 rounded-xl 
    bg-[rgba(255,252,245,0.9)]
    border border-[#d6c7a1]
    shadow-[0_4px_12px_rgba(80,60,40,0.25)]
    backdrop-blur-[1px]
    overflow-hidden
  "
>
  {/* texture papier */}
  <div
    className="
      absolute inset-0 
      bg-[url('/paper-texture.jpg')] 
      opacity-90
      pointer-events-none
    "
  />

  <a href={`/friends/${f.id}`} className="flex items-center gap-4 relative z-10">
    <img
      src={f.avatar_url || '/default-avatar.png'}
      className="w-12 h-12 rounded-full border border-[#bda887] object-cover"
    />
    <span className="font-medium text-[#3a2f1a]">{f.display_name}</span>
  </a>
</li>



          ))}
        </ul>
      )}

      {/* --- REVIEWS --- */}
      <h2 className="text-2xl font-semibold mb-4">Ses critiques</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500">Aucune critique publiée.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {reviews.map((r) => (
            <FilmCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </main>
  );
}
