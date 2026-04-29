import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptChildFields, decryptChildFields } from '@/lib/encryption';

// GET /api/children - List all children
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const children = await prisma.child.findMany({
      where: userId ? { userId } : undefined,
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
  try {
    const body = await request.json();

    const child = await prisma.child.create({
      data: encryptChildFields({
        name: body.name,
        dob: body.dob ? new Date(body.dob) : undefined,
        avatarUrl: body.avatarUrl,
        userId: body.userId ?? undefined,
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
