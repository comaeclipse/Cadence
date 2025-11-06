import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/foods/[id] - Get a single food entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });

    if (!food) {
      return NextResponse.json(
        { error: 'Food entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error('Error fetching food entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food entry' },
      { status: 500 }
    );
  }
}

// PATCH /api/foods/[id] - Update a food entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const food = await prisma.food.update({
      where: { id },
      data: {
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
        foodItem: body.foodItem,
        amountConsumed: body.amountConsumed,
        notes: body.notes,
      },
      include: {
        child: true,
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error('Error updating food entry:', error);
    return NextResponse.json(
      { error: 'Failed to update food entry' },
      { status: 500 }
    );
  }
}

// PUT /api/foods/[id] - Update a food entry (simple update from UI)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    
    if (body.foodItem !== undefined) data.foodItem = body.foodItem;
    if (body.amountConsumed !== undefined) data.amountConsumed = body.amountConsumed;
    if (body.notes !== undefined) data.notes = body.notes;

    const food = await prisma.food.update({
      where: { id },
      data,
      include: {
        child: true,
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error('Error updating food entry:', error);
    return NextResponse.json(
      { error: 'Failed to update food entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/foods/[id] - Delete a food entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete food entry' },
      { status: 500 }
    );
  }
}
