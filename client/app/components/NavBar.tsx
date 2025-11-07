"use client";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const router = useRouter();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogged(Boolean(data.user)));
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-4xl mx-auto p-3 flex items-center justify-between">
        <Link href="/feed" className="font-semibold">🎬 FilmFeed</Link>
        <nav className="flex gap-4">
          {logged ? (
            <>
              <Link href="/feed">Feed</Link>
              <button onClick={logout} className="border rounded px-3 py-1">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Créer un compte</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}