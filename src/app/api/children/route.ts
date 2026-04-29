import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptChildFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

// GET /api/children - List all children
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // suppress unused param warning — request kept for Next.js signature compatibility
  void request;

  try {
    const children = await prisma.child.findMany({
      where: { userId: session.userId },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(children.map(decryptChildFields));
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}

// POST /api/children - Create a new child
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    const child = await prisma.child.create({
      data: encryptChildFields({
        name: body.name,
        dob: body.dob ? new Date(body.dob) : undefined,
        avatarUrl: body.avatarUrl,
        userId: session.userId,
      }),
    });

    return NextResponse.json(decryptChildFields(child), { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: 'Failed to create child' },
      { status: 500 }
    );
  }
}
