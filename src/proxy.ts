import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import { SessionData, SESSION_COOKIE_NAME, getSessionOptions } from '@/lib/session';

const PUBLIC_PATHS = new Set(['/login', '/privacy']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth API routes and static assets
  if (pathname.startsWith('/api/auth/')) return NextResponse.next();

  // Allow public pages
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Verify session cookie
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (cookieValue) {
    try {
      const { password } = getSessionOptions();
      const session = await unsealData<SessionData>(cookieValue, { password });
      isAuthenticated = !!session.userId;
    } catch {
      // Invalid or tampered cookie — treat as unauthenticated
    }
  }

  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
