import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get('code');

    if (code) {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('exchangeCodeForSession error:', error.message);
        return NextResponse.redirect(new URL('/login?error=auth', origin));
      }
    }

    return NextResponse.redirect(new URL('/feed', origin));
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Unexpected error during callback';
    console.error(message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}