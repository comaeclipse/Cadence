import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptFoodFields, decryptFoodFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

// GET /api/foods/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const food = await prisma.food.findFirst({
      where: { id, child: { userId: session.userId } },
      include: { child: true },
    });

    if (!food) return NextResponse.json({ error: 'Food entry not found' }, { status: 404 });
    return NextResponse.json(decryptFoodFields({ ...food, child: decryptChildFields(food.child) }));
  } catch (error) {
    console.error('Error fetching food entry:', error);
    return NextResponse.json({ error: 'Failed to fetch food entry' }, { status: 500 });
  }
}

// PATCH /api/foods/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const owned = await prisma.food.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Food entry not found' }, { status: 404 });

    const food = await prisma.food.update({
      where: { id },
      data: encryptFoodFields({
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
        foodItem: body.foodItem,
        amountConsumed: body.amountConsumed,
        notes: body.notes,
      }),
      include: { child: true },
    });

    return NextResponse.json(decryptFoodFields({ ...food, child: decryptChildFields(food.child) }));
  } catch (error) {
    console.error('Error updating food entry:', error);
    return NextResponse.json({ error: 'Failed to update food entry' }, { status: 500 });
  }
}

// PUT /api/foods/[id] - Simple update from UI
export async function PUT(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const owned = await prisma.food.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Food entry not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (body.foodItem !== undefined) data.foodItem = body.foodItem;
    if (body.amountConsumed !== undefined) data.amountConsumed = body.amountConsumed;
    if (body.notes !== undefined) data.notes = body.notes;

    const food = await prisma.food.update({
      where: { id },
      data: encryptFoodFields(data),
      include: { child: true },
    });

    return NextResponse.json(decryptFoodFields({ ...food, child: decryptChildFields(food.child) }));
  } catch (error) {
    console.error('Error updating food entry:', error);
    return NextResponse.json({ error: 'Failed to update food entry' }, { status: 500 });
  }
}

// DELETE /api/foods/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const owned = await prisma.food.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Food entry not found' }, { status: 404 });

    await prisma.food.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return NextResponse.json({ error: 'Failed to delete food entry' }, { status: 500 });
  }
}
