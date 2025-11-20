"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url?: string | null;
};

type PendingRequest = {
  id: string;
  requester_id: string;
  requester_name: string;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  /* -----------------------------------------------------
   * 🔄 Fonction centrale : charger amis + demandes
   * ----------------------------------------------------- */
  const loadData = async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return;

    const user = userData.user;

    /* ---------- A) Amis acceptés ---------- */
    const { data: friendships } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const friendIds =
      friendships?.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      ) || [];

    if (friendIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", friendIds);

      setFriends(profiles || []);
    } else {
      setFriends([]);
    }

    /* ---------- B) Demandes d'amis reçues ---------- */
    let pendingQuery = supabase
      .from("friendships")
      .select("id, requester_id")
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    if (friendIds.length > 0) {
      friendIds.forEach((fid) => {
        pendingQuery = pendingQuery.neq("requester_id", fid);
      });
    }

    const { data: pending } = await pendingQuery;

    if (pending && pending.length > 0) {
      const requesterIds = pending.map((r) => r.requester_id);

      const { data: reqProfiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", requesterIds);

      const enriched = pending.map((p) => ({
        id: p.id,
        requester_id: p.requester_id,
        requester_name:
          reqProfiles?.find((u) => u.id === p.requester_id)?.display_name ??
          "Utilisateur",
      }));

      setRequests(enriched);
    } else {
      setRequests([]);
    }
  };

  /* -----------------------------------------------------
   * Charger au démarrage
   * ----------------------------------------------------- */
  useEffect(() => {
    loadData().then(() => setLoading(false));
  }, []);

  /* -----------------------------------------------------
   * 🔍 Recherche de profils
   * ----------------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length < 2) return setResults([]);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${search}%`)
        .limit(10);

      if (error) setResults([]);
      else setResults(data || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* -----------------------------------------------------
   * ➕ Envoyer une demande
   * ----------------------------------------------------- */
  const sendRequest = async (target: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    if (target === user.id)
      return alert("Impossible de t’ajouter toi-même 😭");

    const { data: exists } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${target}),
         and(requester_id.eq.${target},addressee_id.eq.${user.id})`
      );

    if (exists && exists.length > 0)
      return alert("Vous avez déjà une relation.");

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: target,
      status: "pending",
    });

    if (error) alert("Erreur lors de l’envoi.");
    else alert("Demande envoyée !");
  };

  /* -----------------------------------------------------
   * ✔️ Accepter une demande → rafraîchissement auto !
   * ----------------------------------------------------- */
  const accept = async (id: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", id);

    if (error) return alert("Erreur en acceptant.");

    await loadData();
  };

  /* -----------------------------------------------------
   * ❌ Refuser
   * ----------------------------------------------------- */
  const decline = async (id: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "declined" })
      .eq("id", id);

    if (error) return alert("Erreur en refusant.");

    await loadData();
  };

  /* ----------------------------------------------------- */

  if (loading) return <div className="p-6">Chargement…</div>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes amis</h1>

      {/* BARRE RECHERCHE */}
      <input
        type="text"
        placeholder="Rechercher un utilisateur…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded-lg mb-4"
      />

      {results.length > 0 && (
        <div className="border rounded-lg shadow mb-6">
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 border-b last:border-none"
            >
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar_url || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <span>{u.display_name}</span>
              </div>

              <button
                onClick={() => sendRequest(u.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
      )}

      {/* DEMANDES D'AMIS */}
      <h2 className="text-xl font-semibold mt-6 mb-3">Demandes d’amis reçues</h2>

      {requests.length === 0 ? (
        <p className="text-gray-500">Aucune demande reçue.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <span className="font-medium">{req.requester_name}</span>

              <div className="flex gap-3">
                <button
                  onClick={() => accept(req.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accepter
                </button>
                <button
                  onClick={() => decline(req.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Refuser
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* LISTE DES AMIS */}
      <h2 className="text-xl font-semibold mt-8 mb-3">Liste de mes amis</h2>

      {friends.length === 0 ? (
        <p className="text-gray-500">Tu n’as pas encore d’amis 😢</p>
      ) : (
        <ul className="space-y-3">
          {friends.map((f) => (
            <li
              key={f.id}
              className="border p-4 rounded-lg shadow flex items-center gap-4"
            >
              <img
                src={f.avatar_url || "/default-avatar.png"}
                className="w-12 h-12 rounded-full object-cover border"
              />

              <Link href={`/friends/${f.id}`}>
                <span className="font-semibold hover:underline cursor-pointer">
                  {f.display_name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
