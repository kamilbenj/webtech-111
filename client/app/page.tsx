'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash; // ex: #access_token=...&refresh_token=...
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(() => router.replace('/feed'))
          .catch(() => router.replace('/login'));
        return;
      }
    }
    // Pas de hash valide -> page login
    router.replace('/login');
  }, [router]);

  return <div className="p-6">Redirection…</div>;
}