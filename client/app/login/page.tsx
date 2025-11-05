'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';

// Empêche toute tentative de prerender statique côté serveur
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const redirect =
    typeof window !== 'undefined'
      ? `${location.origin}/auth/callback`
      : undefined;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          view="magic_link"
          showLinks={false}
          magicLink
          redirectTo={redirect}
        />
      </div>
    </div>
  );
}