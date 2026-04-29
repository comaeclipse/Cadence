import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth, getSession } from '@/lib/session';

// DELETE /api/account - Permanently delete the authenticated user's account and all data
export async function DELETE(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Password is required to delete your account.' }, { status: 400 });
  }

  // Re-verify password before destructive action
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 403 });
  }

  // Delete all user data in dependency order.
  // Children cascade-delete their incidents, foods, and poops (per schema onDelete: Cascade).
  // Incidents cascade-delete their attachments.
  await prisma.$transaction([
    prisma.child.deleteMany({ where: { userId: session.userId } }),
    prisma.user.delete({ where: { id: session.userId } }),
  ]);

  // Destroy the session cookie
  const ironSession = await getSession();
  ironSession.destroy();

  return NextResponse.json({ ok: true });
}
