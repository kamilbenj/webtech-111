export type Film = {
  id: string;
  title: string;
  category: string;
  posterUrl?: string;
  rating?: number; // 0..5
  author?: string; // ami qui a posté
  reviewSnippet?: string;
};

export default function FilmCard({ film }: { film: Film }) {
  return (
    <article className="border rounded-xl p-3 bg-white">
      <div className="flex gap-3">
        <div className="w-16 h-24 bg-neutral-200 rounded overflow-hidden">
          {/* poster placeholder */}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{film.title}</h3>
          <p className="text-sm text-neutral-600">{film.category}</p>
          {film.reviewSnippet && <p className="mt-1 text-sm">{film.reviewSnippet}</p>}
          {film.author && <p className="text-xs text-neutral-500 mt-1">par {film.author}</p>}
        </div>
        {typeof film.rating === "number" && (
          <div className="text-sm">{film.rating}★</div>
        )}
      </div>
    </article>
  );
}