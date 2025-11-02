import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // synchronise/rafraîchit la session et pose les cookies côté serveur
  await supabase.auth.getSession();

  return res;
}

// Exécute le middleware pour toutes les pages (sauf assets)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};