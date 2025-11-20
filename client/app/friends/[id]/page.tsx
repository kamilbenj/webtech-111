"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FriendProfile({ params }: { params: Promise<{ id: string }> }) {
  // ⬅️ Déballage obligatoire de params avec use()
  const { id: friendId } = use(params);

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Profil de l'ami
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, bio")
        .eq("id", friendId)
        .single();

      setProfile(profileData);

      // Reviews de l'ami
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id, opinion, scenario, music, special_effects, created_at,
          films (title, poster_url)
        `)
        .eq("author_id", friendId);

      setReviews(reviewsData || []);

      setLoading(false);
    })();
  }, [friendId]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!profile) return <div>Profil introuvable.</div>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-3">{profile.display_name}</h1>
      <p className="text-gray-600 mb-6">{profile.bio ?? "Aucune bio."}</p>

      <h2 className="text-2xl font-semibold mb-4">Ses critiques</h2>

      {reviews.length === 0 ? (
        <div className="text-gray-500">Il n’a publié aucune critique.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{r.films?.title}</h3>
              <p className="text-gray-700">{r.opinion}</p>
              <span className="text-xs text-gray-400">
                Publié le {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
