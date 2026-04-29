import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptFoodFields, decryptFoodFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

// GET /api/foods - List all food entries
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const childId = request.nextUrl.searchParams.get('childId');

    const foods = await prisma.food.findMany({
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

    return NextResponse.json(foods.map(f => decryptFoodFields({ ...f, child: decryptChildFields(f.child) })));
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch foods' },
      { status: 500 }
    );
  }
}

// POST /api/foods - Create a new food entry
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    console.log('Creating food entry with data:', JSON.stringify(body, null, 2));

    const child = await prisma.child.findFirst({
      where: { id: body.childId, userId: session.userId },
    });
    if (!child) return NextResponse.json({ error: 'Child not found.' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      childId: body.childId,
      timestamp: new Date(body.timestamp),
      foodItem: body.foodItem,
      amountConsumed: body.amountConsumed,
    };

    // Only add optional fields if they have values
    if (body.notes) data.notes = body.notes;

    console.log('Prisma create data:', JSON.stringify(data, null, 2));

    const food = await prisma.food.create({
      data: encryptFoodFields(data),
      include: {
        child: true,
      },
    });

    console.log('Food entry created successfully:', food.id);
    return NextResponse.json(decryptFoodFields(food), { status: 201 });
  } catch (error) {
    console.error('Error creating food entry:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to create food entry',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
