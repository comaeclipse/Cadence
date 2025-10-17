import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/incidents/[id] - Get a single incident
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        child: true,
        behavior: true,
        location: true,
        antecedents: true,
        consequences: true,
        interventions: true,
        attachments: true,
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

// PATCH /api/incidents/[id] - Update an incident
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
        behaviorId: body.behaviorId,
        behaviorText: body.behaviorText,
        intensity: body.intensity,
        durationSec: body.durationSec,
        latencySec: body.latencySec,
        locationId: body.locationId,
        locationText: body.locationText,
        functionHypothesis: body.functionHypothesis,
        notes: body.notes,
        tags: body.tags,
        settingEvents: body.settingEvents,
      },
      include: {
        child: true,
        behavior: true,
        location: true,
        antecedents: true,
        consequences: true,
        interventions: true,
        attachments: true,
      },
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

// DELETE /api/incidents/[id] - Delete an incident
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.incident.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}
