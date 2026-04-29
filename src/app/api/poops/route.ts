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
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    console.log('Creating poop entry with data:', JSON.stringify(body, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      childId: body.childId,
      timestamp: new Date(body.timestamp),
      consistency: body.consistency,
    };

    // Only add optional fields if they have values
    if (body.notes) data.notes = body.notes;

    console.log('Prisma create data:', JSON.stringify(data, null, 2));

    const poop = await prisma.poop.create({
      data: encryptPoopFields(data),
      include: {
        child: true,
      },
    });

    console.log('Poop entry created successfully:', poop.id);
    return NextResponse.json(decryptPoopFields(poop), { status: 201 });
  } catch (error) {
    console.error('Error creating poop entry:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to create poop entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
