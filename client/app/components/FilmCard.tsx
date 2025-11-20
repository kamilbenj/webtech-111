"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export type Review = {
  id: number;
  film_id: number;
  scenario: number;
  music: number;
  special_effects: number;
  opinion: string;
  created_at: string;
  films?: {
    title?: string;
    year?: string;
    poster_url?: string;
  };
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
  review_comments?: {
    id: number;
    content: string;
    created_at: string;
    profiles: {
      display_name?: string;
      avatar_url?: string;
    } | null;
  }[];
};

type Props = {
  review: Review;
};

export default function FilmCard({ review }: Props) {
  const film = review.films;
  const initialComments = review.review_comments || [];

  const COMMENTS_SHOWN = 2;
  const [comments, setComments] = useState(initialComments);
  const [showAll, setShowAll] = useState(false);
  const visibleComments = showAll ? comments : comments.slice(0, COMMENTS_SHOWN);

  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newComment } = await supabase
      .from("review_comments")
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
      .single();

    if (newComment) {
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    }

    setSending(false);
  };

  return (
    <article
      className="
      w-full max-w-4xl mx-auto
      bg-[rgba(255,252,245,0.9)]
      border border-[#d6c7a1]
      rounded-xl
      shadow-[0_4px_12px_rgba(80,60,40,0.25)]
      backdrop-blur-[1px]
      overflow-hidden
      relative
      filmcard-texture
    "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#ccbfa0] bg-[rgba(255,249,235,0.7)]">
        <div className="flex items-center space-x-3">
          {review.profiles?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#bda887] shadow-sm">
  <Image
    src={review.profiles.avatar_url}
    alt={review.profiles.display_name || 'Utilisateur'}
    width={40}
    height={40}
    className="object-center object-cover w-full h-full"
  />
</div>

          ) : (
            <div className="w-10 h-10 bg-[#d5c7a1] rounded-full flex items-center justify-center">
              🎬
            </div>
          )}

          <div>
            <p className="font-semibold text-[#3a2f1a] text-sm">
              {review.profiles?.display_name || "Utilisateur"}
            </p>
            <p className="text-xs text-[#7a6a53]">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* FILM + AVIS */}
      <div className="flex flex-col md:flex-row">

  {film?.poster_url && (
    <div className="relative w-full md:w-1/3 aspect-[500/700] border-r border-[#d6c7a1] bg-transparent">
      <Image
        src={film.poster_url}
        alt={film.title || 'Affiche du film'}
        fill
        className="object-contain p-3"
      />
    </div>
  )}

  <div className="flex-1 px-6 py-5 relative
    before:content-[''] before:absolute before:inset-0
    before:bg-[url('/paper-texture.png')] before:bg-cover
    before:opacity-50 before:pointer-events-none"
  >
    <h2 className="text-2xl font-bold text-[#3a2f1a]">{film?.title}</h2>
    <p className="text-sm text-[#7a6a53] mb-3">{film?.year}</p>

    <RatingLine label="Scénario" value={review.scenario} />
    <RatingLine label="Musique" value={review.music} />
    <RatingLine label="Effets spéciaux" value={review.special_effects} />

    <div className="mt-4">
      <h3 className="font-semibold text-[#3a2f1a]">Avis :</h3>
      <p className="text-sm text-[#4a3d29]">{review.opinion}</p>
    </div>
  </div>
</div>


      {/* COMMENTAIRES */}
      <div className="px-6 py-4 border-t border-[#ccbfa0] bg-[rgba(255,249,235,0.7)] space-y-4">
        <h3 className="text-sm font-semibold text-[#6a5840]">Commentaires</h3>

        {comments.length === 0 && (
          <p className="text-[#7a6a53] text-xs italic">
            Aucun commentaire pour l’instant.
          </p>
        )}

        <div className="space-y-2">
          {visibleComments.map((c) => (
            <div key={c.id} className="flex items-start space-x-2">
              {c.profiles?.avatar_url ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#bda887] shadow-sm">
                  <Image
                    src={c.profiles.avatar_url}
                    alt="avatar"
                    width={28}
                    height={28}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 bg-[#d5c7a1] rounded-full" />
              )}

              <div className="flex flex-col">
                <p className="text-sm text-[#4a3d29] break-words whitespace-pre-wrap">
                  <span className="font-semibold mr-1">
                    {c.profiles?.display_name}
                  </span>
                  {c.content}
                </p>
                <p className="text-xs text-[#7a6a53] mt-1">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {comments.length > COMMENTS_SHOWN && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#6a5840] text-xs font-medium hover:underline"
          >
            {showAll ? "Voir moins de commentaires" : "Voir plus de commentaires"}
          </button>
        )}

        {/* Ajout commentaire */}
        <div className="flex items-center space-x-2 pt-2">
          <UserAvatarMini />

          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 text-xs py-1 bg-transparent focus:outline-none text-[#4a3d29]"
          />

          <button
            onClick={handleSendComment}
            disabled={sending}
            className="text-[var(--accent)] text-xs font-semibold disabled:opacity-50"
          >
            Publier
          </button>
        </div>
      </div>
    </article>
  );
}

function RatingLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <p className="w-28 font-semibold">{label} :</p>
      <StarRating rating={value} />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function UserAvatarMini() {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      setAvatar(data?.avatar_url ?? null);
    });
  }, []);

  if (!avatar) return <div className="w-7 h-7 rounded-full bg-gray-300" />;

  return (
    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
      <Image
        src={avatar}
        alt="me"
        width={28}
        height={28}
        className="object-cover object-center w-full h-full"
      />
    </div>
  );
}
