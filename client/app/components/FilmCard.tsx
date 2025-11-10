"use client";

import Image from "next/image";

export type Film = {
  id: string;
  title: string;
  year: string;
  poster_url: string;
  created_by: string;
  created_at: string;
};

export default function FilmCard({ film }: { film: Film }) {
  return (
    <article
      key={film.id}
      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden w-full max-w-5xl mx-auto transition hover:shadow-lg"
    >
      {/* 🧑‍🎬 En-tête utilisateur */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        {/* Partie gauche : avatar + nom */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            🎬
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {film.created_by || "Utilisateur inconnu"}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(film.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Partie droite : actions */}
        <div className="flex items-center space-x-4 text-gray-500">
          <button
            className="hover:text-gray-700 transition"
            title="Commenter"
          >
            💬
          </button>
          <button
            className="hover:text-gray-700 transition"
            title="Enregistrer"
          >
            💾
          </button>
          <button
            className="hover:text-gray-700 transition"
            title="Partager"
          >
            🔁
          </button>
        </div>
      </div>

      {/* 🖼️ Image + contenu */}
      <div className="flex flex-col md:flex-row">
        {/* Image du film à gauche */}
        {film.poster_url ? (
          <div className="relative w-full md:w-1/3 h-[400px] border-r border-gray-100">
            <Image
              src={film.poster_url}
              alt={film.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full md:w-1/3 h-[400px] bg-gray-100 flex items-center justify-center text-gray-400 border-r border-gray-100">
            Pas d’image
          </div>
        )}

        {/* Contenu à droite */}
        <div className="flex-1 px-6 py-5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{film.title}</h2>
            <p className="text-sm text-gray-500 mb-2">Sorti en {film.year}</p>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Aucune description disponible pour ce film.
            </p>
          </div>

          {/* Bas de carte : placeholder pour interactions futures */}
          <div className="mt-4 border-t pt-3 flex justify-between items-center text-sm text-gray-500">
            <p>👍 0 Like</p>
            <p>💬 0 Commentaire</p>
          </div>
        </div>
      </div>
    </article>
  );
}
