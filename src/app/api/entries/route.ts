import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/entries - Get all entries (incidents, poops, foods) in one call
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');
    const userId = searchParams.get('userId');

    // Build base where clause scoped to user
    const userFilter = userId ? { child: { userId } } : undefined;

    // Fetch all entry types using a single transaction to avoid exhausting the connection pool
    const [incidents, poops, foods] = await prisma.$transaction([
      prisma.incident.findMany({
        where: childId ? { childId } : userFilter,
        include: {
          child: true,
          behaviors: true,
          location: true,
          antecedents: true,
          consequences: true,
          interventions: true,
          attachments: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
      prisma.poop.findMany({
        where: childId ? { childId } : userFilter,
        include: {
          child: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
      prisma.food.findMany({
        where: childId ? { childId } : userFilter,
        include: {
          child: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
    ]);

    return NextResponse.json({
      incidents,
      poops,
      foods,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching entries:', error.message, error.stack);
    } else {
      console.error('Error fetching entries:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
