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
    console.log('Creating incident with data:', JSON.stringify(body, null, 2));

    // Build data object without undefined values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      childId: body.childId,
      timestamp: new Date(body.timestamp),
      functionHypothesis: body.functionHypothesis,
      tags: body.tags || [],
    };

    // Only add optional fields if they have values
    if (body.behaviorText) data.behaviorText = body.behaviorText;
    if (body.durationSec !== undefined && body.durationSec !== null) data.durationSec = body.durationSec;
    if (body.latencySec !== undefined && body.latencySec !== null) data.latencySec = body.latencySec;
    if (body.locationId) data.locationId = body.locationId;
    if (body.locationText) data.locationText = body.locationText;
    if (body.notes) data.notes = body.notes;
    if (body.settingEvents) data.settingEvents = body.settingEvents;

    // Handle relations
    if (body.behaviorIds && body.behaviorIds.length > 0) {
      data.behaviors = {
        connect: body.behaviorIds.map((id: string) => ({ id })),
      };
    }
    if (body.antecedentIds && body.antecedentIds.length > 0) {
      data.antecedents = {
        connect: body.antecedentIds.map((id: string) => ({ id })),
      };
    }
    if (body.consequenceIds && body.consequenceIds.length > 0) {
      data.consequences = {
        connect: body.consequenceIds.map((id: string) => ({ id })),
      };
    }
    if (body.interventionIds && body.interventionIds.length > 0) {
      data.interventions = {
        connect: body.interventionIds.map((id: string) => ({ id })),
      };
    }

    console.log('Prisma create data:', JSON.stringify(data, null, 2));

    const incident = await prisma.incident.create({
      data,
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

    console.log('Incident created successfully:', incident.id);
    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to create incident',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
