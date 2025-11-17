"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  avatar_url?: string | null;
  is_private: boolean;
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

  const [pseudo, setPseudo] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔸 Image states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

      setUser({ id: currentUser.id, email: currentUser.email ?? "" });
      setEmail(currentUser.email ?? "");

      // Profil
      const { data: profilesData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, is_private")
        .eq("id", currentUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Erreur lors du chargement du profil :", profileError);
      } else {
        setProfile(profilesData || null);
        setPseudo(profilesData?.display_name || "");
        setBio(profilesData?.bio || "");
        setAvatarPreview(profilesData?.avatar_url || null);
        setIsPrivate(profilesData?.is_private ?? false); // 🔹 initialisation
      }

      // Critiques
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

      if (!reviewsError && reviewsData) {
        const mapped: Review[] = reviewsData.map((r: any) => ({
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: avatarFile.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : null));
      setMessage("✅ Photo de profil mise à jour !");
    } catch (err) {
      console.error(err);
      setError("Erreur lors du téléchargement de l'image.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: pseudo, bio, is_private: isPrivate })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible de mettre à jour le profil.");
      console.error(updateError);
    } else {
      setMessage("Profil mis à jour !");
      setProfile((p) =>
        p ? { ...p, display_name: pseudo, bio, is_private: isPrivate } : null
      );
    }

    setSaving(false);
  };

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const updates: { email?: string; password?: string } = {};
    if (email) updates.email = email;
    if (newPassword) updates.password = newPassword;

    const { error: authError } = await supabase.auth.updateUser(updates);
    if (authError) {
      setError("Erreur lors de la mise à jour des identifiants.");
    } else {
      setMessage("Compte mis à jour !");
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      setUser(
        updatedUser
          ? { id: updatedUser.id, email: updatedUser.email ?? "" }
          : null
      );
    }

    setNewPassword("");
    setSaving(false);
  };

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Mon profil</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-orange-300 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400 border-4 border-dashed border-gray-300">
                📸
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow cursor-pointer transition"
              title="Choisir une image"
            >
              +
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <button
            onClick={handleAvatarUpload}
            disabled={saving}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm"
          >
            {saving ? "Envoi..." : "Mettre à jour la photo"}
          </button>

          <p className="text-sm text-gray-500 mt-2">Photo de profil</p>
        </div>

        {/* Modifier pseudo, bio et type de compte */}
        <form onSubmit={handleUpdateProfile} className="mb-6 space-y-3">
          <label className="block font-medium">Pseudo & bio</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ton pseudo"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Ta bio..."
          />

          {/* Toggle Public / Privé */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`flex-1 py-2 rounded border ${
                !isPrivate
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`flex-1 py-2 rounded border ${
                isPrivate
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Privé
            </button>
          </div>

          <button
            disabled={saving}
            className="bg-orange-500 text-white px-4 py-2 rounded mt-3"
          >
            {saving ? "Sauvegarde..." : "Mettre à jour le profil"}
          </button>
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
              placeholder="Nouveau mot de passe"
            />
          </div>
          <button
            disabled={saving}
            className="mt-2 bg-gray-800 text-white px-4 py-2 rounded"
          >
            {saving ? "Mise à jour..." : "Mettre à jour le compte"}
          </button>
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
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">Pas d’affiche</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {r.film_title ?? `Film #${r.film_id ?? "?"}`}{" "}
                    <span className="text-gray-500 text-sm">
                      ({r.created_at
                        ? new Date(r.created_at).getFullYear()
                        : "?"})
                    </span>
                  </h3>
                  <p className="text-gray-700 mt-2">{r.opinion}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    Scénario : {r.scenario ?? "-"} / Musique : {r.music ?? "-"} /
                    Effets spéciaux : {r.special_effects ?? "-"}
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
