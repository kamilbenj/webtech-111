"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGate from "../components/AuthGate";
import CategoryFilter from "../components/CategoryFilter";
import FilmCard, { Film } from "../components/FilmCard";

export default function FeedPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des films :", error.message);
      } else {
        setFilms(data || []);
      }

      setLoading(false);
    };

    fetchFilms();
  }, []);

  // Filtrage si tu veux plus tard catégoriser (par ex. par année ou type)
  const filteredFilms = useMemo(() => {
    if (cat === "All") return films;
    return films.filter((f) => f.year === cat);
  }, [cat, films]);

  return (
    <AuthGate>
      <section className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-gray-800">
              🎥 Ton Feed
            </h1>
            <CategoryFilter selected={cat} onChange={setCat} />
          </header>

          {loading ? (
            <div className="text-center text-gray-500 py-10">
              Chargement des films...
            </div>
          ) : filteredFilms.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Aucun film trouvé pour cette catégorie.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {filteredFilms.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          )}

          <footer className="text-sm text-neutral-500 text-center pt-10 border-t border-gray-200">
            À venir : système d’amis, likes, commentaires et pages de détails 🎬
          </footer>
        </div>
      </section>
    </AuthGate>
  );
}
