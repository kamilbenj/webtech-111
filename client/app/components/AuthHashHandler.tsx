'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthHashHandler() {
  useEffect(() => {
    // Exemple d’URL: /feed#access_token=...&refresh_token=...
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash || !hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => {
          // Nettoie l’URL (retire le fragment #...) puis recharge
          const clean = window.location.pathname + window.location.search;
          window.history.replaceState({}, '', clean);
          window.location.reload();
        })
        .catch((e) => console.error('setSession error:', e));
    }
  }, []);

  return null;
}