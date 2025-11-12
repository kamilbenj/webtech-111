"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddReviewPage() {
  // États du formulaire
  const [title, setTitle] = useState("");
  const [opinion, setOpinion] = useState("");
  const [scenario, setScenario] = useState(5);
  const [music, setMusic] = useState(5);
  const [specialEffects, setSpecialEffects] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  //Formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    
    if (!title.trim()) {
      setMessage("❌ Merci d’indiquer le nom du film !");
      setLoading(false);
      return;
    }

    //Récupération de l’utilisateur connecté
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("❌ Tu dois être connecté pour publier une critique !");
      setLoading(false);
      return;
    }

    console.log("👤 Utilisateur connecté :", user);

    //Recherche du film dans la table
    const { data: existingFilms, error: filmError } = await supabase
      .from("films")
      .select("*")
      .ilike("title", title.trim());

    if (filmError) {
      console.error("Erreur recherche film :", filmError);
      setMessage("❌ Erreur lors de la vérification du film.");
      setLoading(false);
      return;
    }

    let filmId;

    if (existingFilms && existingFilms.length > 0) {
      
      filmId = existingFilms[0].id;
      console.log("🎬 Film déjà existant :", existingFilms[0].title);
    } else {
      
      console.log("🎬 Film non trouvé, création...");
      const { data: newFilm, error: newFilmError } = await supabase
        .from("films")
        .insert([
          {
            title: title.trim(),
            year: new Date().getFullYear(), 
            poster_url: "https://via.placeholder.com/300x450?text=" + title.trim(), 
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (newFilmError || !newFilm) {
        console.error("Erreur création film :", newFilmError);
        setMessage("❌ Erreur lors de la création du film.");
        setLoading(false);
        return;
      }

      filmId = newFilm.id;
      console.log(" Film créé avec succès :", newFilm.title);
    }

    //Insertion de la critique
    const { error } = await supabase.from("reviews").insert([
      {
        film_id: filmId,
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
      setMessage("Critique publiée avec succès !");
      setTitle("");
      setOpinion("");
      setScenario(5);
      setMusic(5);
      setSpecialEffects(5);
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
        className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <div>
          <label className="block font-semibold mb-1">Titre du film</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Ex : Interstellar"
            required
          />
        </div>

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
          {loading ? "Publication..." : "Publier "}
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
