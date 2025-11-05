import { createServerSupabase } from '@/lib/supabaseServer';

export default async function FeedPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-6 text-red-500">Please log in.</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.email} 👋</h1>
      <p className="mt-2 text-gray-600">You are successfully logged in.</p>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Logout
        </button>
      </form>
    </div>
  );
}