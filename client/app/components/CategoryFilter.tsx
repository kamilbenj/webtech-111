"use client";
export default function CategoryFilter({
  selected,
  onChange,
}: { selected: string; onChange: (v: string)=>void }) {
  const cats = ["All","Action","Drama","Comedy","Sci-Fi","Documentary"];
  return (
    <div className="flex gap-2 flex-wrap">
      {cats.map(c => (
        <button
          key={c}
          onClick={()=>onChange(c)}
          className={`px-3 py-1 rounded border ${selected===c ? "bg-black text-white" : ""}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}