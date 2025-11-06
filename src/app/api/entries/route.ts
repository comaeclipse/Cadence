import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/entries - Get all entries (incidents, poops, foods) in one call
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');

    // Fetch all entry types in parallel
    const [incidents, poops, foods] = await Promise.all([
      prisma.incident.findMany({
        where: childId ? { childId } : undefined,
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
        where: childId ? { childId } : undefined,
        include: {
          child: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
      prisma.food.findMany({
        where: childId ? { childId } : undefined,
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
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
