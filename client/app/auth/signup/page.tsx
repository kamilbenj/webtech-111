"use client";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.replace("/feed");
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Email" type="email"
          value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" placeholder="Mot de passe" type="password"
          value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full border rounded p-2" disabled={loading}>
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      <p className="text-sm mt-3">
        Déjà inscrit ? <Link className="underline" href="/login">Se connecter</Link>
      </p>
    </div>
  );
}