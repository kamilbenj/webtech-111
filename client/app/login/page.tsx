'use client';

import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.push('/feed');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="max-w-sm mx-auto py-16">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        view="magic_link"
        magicLink
        redirectTo={`${location.origin}/auth/callback`} // ✅ pour poser les cookies côté SSR
      />
    </div>
  );
}