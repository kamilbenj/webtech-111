import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.redirect(new URL('/login?error=auth', origin));
    }
  }

  // une fois connecté → redirection vers le feed
  return NextResponse.redirect(new URL('/feed', origin));
}