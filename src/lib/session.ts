import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface SessionData {
  userId: string;
  username: string;
}

export const SESSION_COOKIE_NAME = 'cadence_session';

export function getSessionOptions(): SessionOptions {
  if (!process.env.SESSION_PASSWORD) {
    throw new Error('SESSION_PASSWORD environment variable is not set');
  }
  return {
    password: process.env.SESSION_PASSWORD,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

type AuthResult =
  | { session: IronSession<SessionData>; error: null }
  | { session: null; error: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession();
  if (!session.userId) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}
