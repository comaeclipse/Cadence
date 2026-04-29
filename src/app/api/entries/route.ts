import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  decryptIncidentFields,
  decryptFoodFields,
  decryptPoopFields,
  decryptChildFields,
} from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

// GET /api/entries - Get all entries (incidents, poops, foods) in one call
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const childId = request.nextUrl.searchParams.get('childId');
    const userFilter = { child: { userId: session.userId } };

    // Fetch all entry types using a single transaction to avoid exhausting the connection pool
    const [incidents, poops, foods] = await prisma.$transaction([
      prisma.incident.findMany({
        where: childId ? { childId, child: { userId: session.userId } } : userFilter,
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
        where: childId ? { childId, child: { userId: session.userId } } : userFilter,
        include: {
          child: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
      prisma.food.findMany({
        where: childId ? { childId, child: { userId: session.userId } } : userFilter,
        include: {
          child: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
    ]);

    return NextResponse.json({
      incidents: incidents.map(i => decryptIncidentFields({ ...i, child: decryptChildFields(i.child) })),
      poops: poops.map(p => decryptPoopFields({ ...p, child: decryptChildFields(p.child) })),
      foods: foods.map(f => decryptFoodFields({ ...f, child: decryptChildFields(f.child) })),
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
