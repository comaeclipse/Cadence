import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/poops/[id] - Get a single poop entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const poop = await prisma.poop.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });

    if (!poop) {
      return NextResponse.json(
        { error: 'Poop entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(poop);
  } catch (error) {
    console.error('Error fetching poop entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poop entry' },
      { status: 500 }
    );
  }
}

// PATCH /api/poops/[id] - Update a poop entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const poop = await prisma.poop.update({
      where: { id },
      data: {
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
        consistency: body.consistency,
        notes: body.notes,
      },
      include: {
        child: true,
      },
    });

    return NextResponse.json(poop);
  } catch (error) {
    console.error('Error updating poop entry:', error);
    return NextResponse.json(
      { error: 'Failed to update poop entry' },
      { status: 500 }
    );
  }
}

// PUT /api/poops/[id] - Update a poop entry (simple update from UI)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    
    if (body.consistency !== undefined) data.consistency = body.consistency;
    if (body.notes !== undefined) data.notes = body.notes;

    const poop = await prisma.poop.update({
      where: { id },
      data,
      include: {
        child: true,
      },
    });

    return NextResponse.json(poop);
  } catch (error) {
    console.error('Error updating poop entry:', error);
    return NextResponse.json(
      { error: 'Failed to update poop entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/poops/[id] - Delete a poop entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.poop.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting poop entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete poop entry' },
      { status: 500 }
    );
  }
}
