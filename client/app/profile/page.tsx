"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ✅ Types précis
type Review = {
  id: number;
  film_id: number | null;
  opinion: string | null;
  scenario: number | null;
  music: number | null;
  special_effects: number | null;
  created_at: string | null;
  film_title?: string | null;
  poster_url?: string | null;
};

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio?: string | null;
};

type User = {
  id: string;
  email: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for editing
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setError("Tu dois être connecté pour voir ton profil.");
        setLoading(false);
        return;
      }

      setUser({
        id: currentUser.id,
        email: currentUser.email ?? "",
      });
      setEmail(currentUser.email ?? "");

      // 🔹 Récupération du profil utilisateur
      const { data: profilesData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio")
        .eq("id", currentUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Erreur lors du chargement du profil :", profileError);
      } else {
        setProfile(profilesData || null);
        setPseudo(profilesData?.display_name || "");
      }

      // 🔹 Récupération des critiques de l'utilisateur
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          film_id,
          opinion,
          scenario,
          music,
          special_effects,
          created_at,
          films ( title, poster_url )
        `)
        .eq("author_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("Erreur lors du chargement des critiques :", reviewsError);
      } else {
        const mapped: Review[] = (reviewsData || []).map((r: any) => ({
          id: r.id,
          film_id: r.film_id,
          opinion: r.opinion,
          scenario: r.scenario,
          music: r.music,
          special_effects: r.special_effects,
          created_at: r.created_at,
          film_title: r.films?.title || null,
          poster_url: r.films?.poster_url || null,
        }));
        setReviews(mapped);
      }

      setLoading(false);
    })();
  }, []);

  // 🔹 Mettre à jour le pseudo
  const handleUpdatePseudo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const {
      data: { user: currentUser },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !currentUser) {
      setError("Utilisateur non connecté.");
      setSaving(false);
      return;
    }

    if (profile) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: pseudo })
        .eq("id", currentUser.id);

      if (updateError) {
        setError("Impossible de mettre à jour le pseudo.");
        console.error(updateError);
      } else {
        setProfile({ ...profile, display_name: pseudo });
        setMessage("Pseudo mis à jour.");
      }
    } else {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: currentUser.id, display_name: pseudo })
        .select();

      if (insertError) {
        setError("Impossible de créer le profil.");
        console.error(insertError);
      } else {
        setProfile({ id: currentUser.id, username: null, display_name: pseudo });
        setMessage("Profil créé et pseudo enregistré.");
      }
    }

    setSaving(false);
  };

  // 🔹 Mettre à jour email / mot de passe
  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const updates: { email?: string; password?: string } = {};
    if (email) updates.email = email;
    if (newPassword) updates.password = newPassword;

    if (!updates.email && !updates.password) {
      setError("Rien à mettre à jour.");
      setSaving(false);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser(updates);

    if (authError) {
      setError("Erreur lors de la mise à jour des identifiants.");
      console.error(authError);
    } else {
      setMessage(
        "Compte mis à jour. Un email de confirmation peut être envoyé si l’adresse email a changé."
      );
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      setUser(
        updatedUser
          ? { id: updatedUser.id, email: updatedUser.email ?? "" }
          : null
      );
      setEmail(updatedUser?.email ?? "");
    }

    setNewPassword("");
    setSaving(false);
  };

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Mon profil</h1>

        {/* Infos de profil */}
        <div className="text-sm text-gray-600 mb-6">
          {profile ? (
            <>
              <div>
                <strong>Pseudo :</strong> {profile.display_name || "—"}
              </div>
              <div>
                <strong>Email :</strong> {user?.email || "—"}
              </div>
            </>
          ) : (
            <>Aucune information de profil.</>
          )}
        </div>

        {/* Modifier pseudo */}
        <form onSubmit={handleUpdatePseudo} className="mb-6">
          <label className="block font-medium">Modifier le pseudo</label>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Nouveau pseudo"
            />
            <button
              disabled={saving}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>

        {/* Modifier email / mot de passe */}
        <form onSubmit={handleUpdateAuth} className="mb-6">
          <label className="block font-medium">
            Modifier email / mot de passe
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Email"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Nouveau mot de passe (laisser vide si pas de changement)"
            />
          </div>
          <div className="mt-2">
            <button
              disabled={saving}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
              {saving ? "Mise à jour..." : "Mettre à jour le compte"}
            </button>
          </div>
        </form>

        {message && <div className="text-green-600 mb-4">{message}</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <hr className="my-6" />

        {/* Mes critiques */}
        <h2 className="text-2xl font-semibold mb-4">Mes critiques</h2>

        {reviews.length === 0 ? (
          <div className="text-gray-500">Aucune critique publiée.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <article key={r.id} className="border rounded p-4 flex gap-4">
                <div className="w-24 h-32 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {r.poster_url ? (
                    <img
                      src={r.poster_url}
                      alt={r.film_title ?? "poster"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="text-xs text-gray-400">Pas d&apos;affiche</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {r.film_title ?? `Film #${r.film_id ?? "?"}`}{" "}
                    <span className="text-gray-500 text-sm">
                      (
                      {r.created_at
                        ? new Date(r.created_at).getFullYear()
                        : "?"}
                      )
                    </span>
                  </h3>
                  <p className="text-gray-700 mt-2">{r.opinion}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    Scénario : {r.scenario ?? "-"} / Musique :{" "}
                    {r.music ?? "-"} / Effets spéciaux :{" "}
                    {r.special_effects ?? "-"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Publié le{" "}
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString()
                      : "?"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
