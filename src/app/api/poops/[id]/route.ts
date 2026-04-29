import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptPoopFields, decryptPoopFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

// GET /api/poops/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const poop = await prisma.poop.findFirst({
      where: { id, child: { userId: session.userId } },
      include: { child: true },
    });

    if (!poop) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    return NextResponse.json(decryptPoopFields({ ...poop, child: decryptChildFields(poop.child) }));
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
  }
}

// PATCH /api/poops/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const owned = await prisma.poop.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    const poop = await prisma.poop.update({
      where: { id },
      data: encryptPoopFields({
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
        consistency: body.consistency,
        notes: body.notes,
      }),
      include: { child: true },
    });

    return NextResponse.json(decryptPoopFields({ ...poop, child: decryptChildFields(poop.child) }));
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

// PUT /api/poops/[id] - Simple update from UI
export async function PUT(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const owned = await prisma.poop.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (body.consistency !== undefined) data.consistency = body.consistency;
    if (body.notes !== undefined) data.notes = body.notes;

    const poop = await prisma.poop.update({
      where: { id },
      data: encryptPoopFields(data),
      include: { child: true },
    });

    return NextResponse.json(decryptPoopFields({ ...poop, child: decryptChildFields(poop.child) }));
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

// DELETE /api/poops/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const owned = await prisma.poop.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    await prisma.poop.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
