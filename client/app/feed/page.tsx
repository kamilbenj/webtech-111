import { createServerSupabase } from '@/lib/supabaseServer';

export default async function FeedPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-6">Please log in.</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.email} 👋</h1>
      <p className="mt-2 text-gray-600">You are successfully logged in.</p>
    </div>
  );
}