import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface SessionData {
  userId: string;
  username: string;
}

if (!process.env.SESSION_PASSWORD) {
  throw new Error('SESSION_PASSWORD environment variable is not set');
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD,
  cookieName: 'cadence_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
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
