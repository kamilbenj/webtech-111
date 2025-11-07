"use client";
import AuthGate from "../components/AuthGate";
import CategoryFilter from "../components/CategoryFilter";
import FilmCard, { Film } from "../components/FilmCard";
import { useMemo, useState } from "react";

/** TODO
 * - Remplacer MOCK_FEED par un fetch Supabase (table: posts/reviews + films + friendships)
 * - Filtrer par "amis" côté SQL (via table friendships) ou côté client après SELECT
 */
const MOCK_FEED: Film[] = [
  { id:"1", title:"Inception", category:"Sci-Fi", rating:5, author:"Alice", reviewSnippet:"Mindblowing visuals." },
  { id:"2", title:"Whiplash", category:"Drama", rating:4, author:"Bob", reviewSnippet:"Intense and precise." },
  { id:"3", title:"Superbad", category:"Comedy", rating:3, author:"Claire", reviewSnippet:"Goofy, fun." },
];

export default function FeedPage() {
  const [cat, setCat] = useState("All");
  const films = useMemo(
    () => cat==="All" ? MOCK_FEED : MOCK_FEED.filter(f=>f.category===cat),
    [cat]
  );

  return (
    <AuthGate>
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Ton feed</h1>
        </header>

        <CategoryFilter selected={cat} onChange={setCat} />

        <div className="grid gap-3">
          {films.map(f => <FilmCard key={f.id} film={f} />)}
        </div>

        {/* Placeholders d’évolution */}
        <div className="text-sm text-neutral-500">
          À faire : “amis”, ajout de film, page détail /film/[id], likes/commentaires, upload poster.
        </div>
      </section>
    </AuthGate>
  );
}