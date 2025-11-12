"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddReviewPage() {
  const [title, setTitle] = useState("");
  const [opinion, setOpinion] = useState("");
  const [scenario, setScenario] = useState(5);
  const [music, setMusic] = useState(5);
  const [specialEffects, setSpecialEffects] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<any>(null);

  // Recherche automatique dans la table "films"
  useEffect(() => {
    const fetchFilms = async () => {
      if (search.trim().length < 2) {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("films")
        .select("id, title, year")
        .ilike("title", `%${search}%`);

      if (!error && data) setResults(data);
    };

    fetchFilms();
  }, [search]);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!selectedFilm) {
      setMessage("Veuillez sélectionner un film existant dans la base.");
      setLoading(false);
      return;
    }

    // Récupération de l’utilisateur connecté
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Tu dois être connecté pour publier une critique.");
      setLoading(false);
      return;
    }

    // Insertion de la critique
    const { error } = await supabase.from("reviews").insert([
      {
        film_id: selectedFilm.id,
        author_id: user.id,
        opinion,
        scenario,
        music,
        special_effects: specialEffects,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.error("Supabase error:", JSON.stringify(error, null, 2));
      setMessage("Erreur lors de la création de la critique.");
    } else {
      setMessage("Critique publiée avec succès.");
      setTitle("");
      setOpinion("");
      setScenario(5);
      setMusic(5);
      setSpecialEffects(5);
      setSelectedFilm(null);
      setSearch("");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Ajouter une nouvelle critique
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-6"
      >
        {/* Recherche de film existant */}
        <div className="relative">
          <label className="block font-semibold mb-1">Titre du film</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTitle(e.target.value);
              setSelectedFilm(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Rechercher un film existant..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />

          {/* Résultats de recherche */}
          {isFocused && results.length > 0 && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg w-full z-50 max-h-60 overflow-y-auto">
              {results.map((film) => (
                <div
                  key={film.id}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => {
                    setTitle(film.title);
                    setSearch(film.title);
                    setSelectedFilm(film);
                    setResults([]);
                  }}
                >
                  {film.title} {film.year ? `(${film.year})` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Champ Avis */}
        <div>
          <label className="block font-semibold mb-1">Avis</label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={4}
            placeholder="Ton avis sur le film..."
            required
          />
        </div>

        {/* Notes */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold mb-1">Scénario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Musique</label>
            <select
              value={music}
              onChange={(e) => setMusic(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Effets spéciaux</label>
            <select
              value={specialEffects}
              onChange={(e) => setSpecialEffects(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          {loading ? "Publication en cours..." : "Publier"}
        </button>

        {message && (
          <p className="text-center mt-4 text-gray-700 font-medium">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
