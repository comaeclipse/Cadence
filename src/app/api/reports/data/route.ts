import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptIncidentFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

// GET /api/reports/data - Fetch filtered incidents for reports
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause — always scoped to the authenticated user
    const where: {
      child?: { userId: string };
      childId?: string;
      timestamp?: { gte?: Date; lt?: Date };
    } = { child: { userId: session.userId } };

    if (childId) {
      where.childId = childId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the entire end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.timestamp.lt = end;
      }
    }

    const incidents = await prisma.incident.findMany({
      where,
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
        timestamp: 'asc', // Chronological order for reports
      },
    });

    return NextResponse.json(incidents.map(i => decryptIncidentFields({ ...i, child: decryptChildFields(i.child) })));
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
