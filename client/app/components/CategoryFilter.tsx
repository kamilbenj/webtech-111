'use client'

type CategoryFilterProps = {
  selected: string
  onChange: (category: string) => void
}

// 💡 Tu peux ajuster ces valeurs selon ta table Supabase (ex: genre, année, etc.)
const categories = [
  'All',
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Sci-Fi',
  'Romance',
]

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center sm:justify-end gap-3">
      {categories.map((cat) => {
        const isActive = selected === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isActive
                ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white border-transparent shadow-md scale-105'
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-500'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
