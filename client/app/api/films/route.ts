import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { title, year, poster_url, categories = [] } = await req.json();

  const { data: film, error } = await supabase
    .from('films')
    .insert({ title, year, poster_url, created_by: user.id })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (categories.length) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id,name')
      .in('name', categories);
    if (cats?.length) {
      const links = cats.map(c => ({ film_id: film.id, category_id: c.id }));
      await supabase.from('film_categories').insert(links);
    }
  }

  return NextResponse.json(film, { status: 201 });
}