"use client";

import { useEffect, useState, use } from "react";
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
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);

      //  Récupération du profil de l’ami
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url, is_private")
        .eq("id", friendId)
        .single();

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setIsPrivate(profileData.is_private);

      //  Si le profil est privé : on s’arrête là
      if (profileData.is_private) {
        setReviews([]);
        setLoading(false);
        return;
      }

      //  Récupérer les reviews de l'ami au même format que FilmCard
      const { data: reviewsData } = await supabase
        .from("reviews")
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
        .eq("author_id", friendId)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);
      setLoading(false);
    })();
  }, [friendId]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!profile) return <div className="p-6 text-red-500">Profil introuvable.</div>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      {/* ---------------- PROFIL HEADER ---------------- */}
      <div className="flex flex-col items-center text-center mb-10">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-orange-300 shadow-md"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400 border-4 border-dashed border-gray-300">
            🎬
          </div>
        )}

        <h1 className="text-3xl font-bold mt-4">{profile.display_name}</h1>
        <p className="text-gray-600 mt-2">{profile.bio ?? "Aucune bio."}</p>

        {isPrivate && (
          <p className="mt-4 text-red-500 font-semibold">
            🔒 Ce profil est privé.
          </p>
        )}
      </div>

      {/* ---------------- CRITIQUES ---------------- */}
      {!isPrivate && (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Ses critiques
          </h2>

          {reviews.length === 0 ? (
            <div className="text-gray-500 text-center">
              Il n’a publié aucune critique.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {reviews.map((review) => (
                <FilmCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
