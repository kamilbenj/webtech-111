import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { categoryNames = [] } = await req.json();

  if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const { data: cats } = await supabase
    .from('categories')
    .select('id,name')
    .in('name', categoryNames);

  const catIds = (cats ?? []).map(c => c.id);
  if (catIds.length === 0) return NextResponse.json([], { status: 200 });

  const { data: links } = await supabase
    .from('film_categories')
    .select('films(id,title,poster_url), category_id')
    .in('category_id', catIds);

  const filmsMap = new Map<number, { id:number; title:string; poster_url:string|null }>();
  (links ?? []).forEach((row: any) => {
    if (row.films) filmsMap.set(row.films.id, row.films);
  });

  return NextResponse.json(Array.from(filmsMap.values()), { status: 200 });
}