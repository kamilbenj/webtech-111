import sql from '@supabase/db'

interface Film {
  id: number
  name: string
  date: string
}


export default async function FilmPage() {
  // Récupération des films depuis la base Supabase
  const films: Film[] = await sql`
  SELECT id, name, date FROM "Film" ORDER BY id;
`

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">🎬 Liste des films</h1>

      {films.length === 0 ? (
        <p>Aucun film trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {films.map((film) => (
            <li
              key={film.id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">{film.name}</div>
              <div className="text-gray-500">
                Sortie : {new Date(film.date).toLocaleDateString('fr-FR')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
