import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/incidents - List all incidents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');

    const incidents = await prisma.incident.findMany({
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
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create a new incident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const incident = await prisma.incident.create({
      data: {
        childId: body.childId,
        timestamp: new Date(body.timestamp),
        behaviorText: body.behaviorText,
        intensity: body.intensity,
        durationSec: body.durationSec,
        latencySec: body.latencySec,
        locationId: body.locationId,
        locationText: body.locationText,
        functionHypothesis: body.functionHypothesis,
        notes: body.notes,
        tags: body.tags || [],
        settingEvents: body.settingEvents,
        behaviors: body.behaviorIds
          ? {
              connect: body.behaviorIds.map((id: string) => ({ id })),
            }
          : undefined,
        antecedents: body.antecedentIds
          ? {
              connect: body.antecedentIds.map((id: string) => ({ id })),
            }
          : undefined,
        consequences: body.consequenceIds
          ? {
              connect: body.consequenceIds.map((id: string) => ({ id })),
            }
          : undefined,
        interventions: body.interventionIds
          ? {
              connect: body.interventionIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        child: true,
        behaviors: true,
        location: true,
        antecedents: true,
        consequences: true,
        interventions: true,
        attachments: true,
      },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
