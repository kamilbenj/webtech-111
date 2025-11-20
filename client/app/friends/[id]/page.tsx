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

      /* COMMON FRIENDS */

      // 1. Amis du user
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

      // 2. Amis du friend
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

      // 3. Intersection
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
      {/* HEADER */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          className="w-28 h-28 rounded-full object-cover border shadow"
        />
        <h1 className="text-3xl font-bold mt-3">{profile.display_name}</h1>
        <p className="text-gray-600">{profile.bio ?? "Aucune bio."}</p>
      </div>

      {/* COMMON FRIENDS */}
      <h2 className="text-2xl font-semibold mb-3">Amis en commun</h2>

      {commonFriends.length === 0 ? (
        <p className="text-gray-500 mb-6">Aucun ami en commun.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {commonFriends.map((f) => (
            <li
  key={f.id}
  className="flex items-center gap-4 border p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
>
  <a href={`/friends/${f.id}`} className="flex items-center gap-4">
    <img
      src={f.avatar_url || "/default-avatar.png"}
      className="w-12 h-12 rounded-full object-cover"
    />
    <span className="font-medium">{f.display_name}</span>
  </a>
</li>

          ))}
        </ul>
      )}

      {/* REVIEWS */}
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
