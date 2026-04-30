import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptPoopFields, decryptPoopFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

// GET /api/poops - List all health log entries
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const childId = request.nextUrl.searchParams.get('childId');

    const poops = await prisma.poop.findMany({
      where: childId
        ? { childId, child: { userId: session.userId } }
        : { child: { userId: session.userId } },
      include: {
        child: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json(poops.map(p => decryptPoopFields({ ...p, child: decryptChildFields(p.child) })));
  } catch (error) {
    console.error('Error fetching poops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poops' },
      { status: 500 }
    );
  }
}

// POST /api/poops - Create a new health log entry
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    const child = await prisma.child.findFirst({
      where: { id: body.childId, userId: session.userId },
    });
    if (!child) return NextResponse.json({ error: 'Child not found.' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      childId: body.childId,
      timestamp: new Date(body.timestamp),
      consistency: body.consistency,
    };

    // Only add optional fields if they have values
    if (body.notes) data.notes = body.notes;

    const poop = await prisma.poop.create({
      data: encryptPoopFields(data),
      include: {
        child: true,
      },
    });

    return NextResponse.json(decryptPoopFields(poop), { status: 201 });
  } catch (error) {
    console.error('Error creating poop entry:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create poop entry' },
      { status: 500 }
    );
  }
}
