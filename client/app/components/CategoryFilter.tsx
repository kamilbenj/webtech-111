'use client'

type CategoryFilterProps = {
  selected: string
  onChange: (category: string) => void
  categories: { id: number; name: string }[]
}

export default function CategoryFilter({ selected, onChange, categories }: CategoryFilterProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
    >
      <option value="All">Toutes les catégories</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.name}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
