import { createServerSupabase } from '@/lib/supabaseServer';

type ReviewRow = {
  id: number;
  rating: number;
  content: string | null;
  created_at: string;
  author_id: string;
  films: { id: number; title: string; poster_url: string | null } | null;
  profiles: { username: string | null; avatar_url: string | null } | null;
};

export default async function FeedPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-6">Please log in.</div>;

  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const friendIds = new Set<string>([user.id]);
  (friendships ?? []).forEach(f => {
    if (f.requester_id === user.id) friendIds.add(f.addressee_id);
    else friendIds.add(f.requester_id);
  });

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id,rating,content,created_at,author_id, films(id,title,poster_url), profiles:author_id(username,avatar_url)')
    .in('author_id', Array.from(friendIds))
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {(reviews as ReviewRow[] | null ?? []).map(r => (
        <div key={r.id} className="rounded-2xl shadow p-4 flex gap-3 bg-white">
          <img src={r.films?.poster_url ?? ''} alt="" className="w-16 h-24 object-cover rounded" />
          <div className="flex-1">
            <div className="font-semibold">{r.films?.title}</div>
            <div className="text-sm opacity-70">Note: {r.rating}/5</div>
            {r.content && <div className="mt-2">{r.content}</div>}
            <div className="mt-2 text-xs opacity-60">
              par {r.profiles?.username ?? '—'} • {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}