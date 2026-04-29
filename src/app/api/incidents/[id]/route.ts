import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptIncidentFields, decryptIncidentFields, decryptChildFields } from '@/lib/encryption';
import { requireAuth } from '@/lib/session';

const INCLUDE = {
  child: true,
  behaviors: true,
  location: true,
  antecedents: true,
  consequences: true,
  interventions: true,
  attachments: true,
} as const;

// GET /api/incidents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const incident = await prisma.incident.findFirst({
      where: { id, child: { userId: session.userId } },
      include: INCLUDE,
    });

    if (!incident) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    return NextResponse.json(decryptIncidentFields({ ...incident, child: decryptChildFields(incident.child) }));
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json({ error: 'Failed to fetch incident' }, { status: 500 });
  }
}

// PATCH /api/incidents/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const owned = await prisma.incident.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });

    const incident = await prisma.incident.update({
      where: { id },
      data: encryptIncidentFields({
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
        behaviorText: body.behaviorText,
        durationSec: body.durationSec,
        latencySec: body.latencySec,
        locationId: body.locationId,
        locationText: body.locationText,
        functionHypothesis: body.functionHypothesis,
        notes: body.notes,
        tags: body.tags,
        settingEvents: body.settingEvents,
        behaviors: body.behaviorIds ? { set: body.behaviorIds.map((id: string) => ({ id })) } : undefined,
        consequences: body.consequenceIds ? { set: body.consequenceIds.map((id: string) => ({ id })) } : undefined,
      }),
      include: INCLUDE,
    });

    return NextResponse.json(decryptIncidentFields({ ...incident, child: decryptChildFields(incident.child) }));
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}

// PUT /api/incidents/[id] - Simple update from UI
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const owned = await prisma.incident.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.trigger !== undefined) data.locationText = body.trigger;
    if (body.duration !== undefined) data.durationSec = body.duration ? parseInt(body.duration) || 0 : null;
    if (body.type !== undefined && Array.isArray(body.type)) data.behaviorText = body.type.join(', ');

    const incident = await prisma.incident.update({
      where: { id },
      data: encryptIncidentFields(data),
      include: INCLUDE,
    });

    return NextResponse.json(decryptIncidentFields({ ...incident, child: decryptChildFields(incident.child) }));
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}

// DELETE /api/incidents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;
    const owned = await prisma.incident.findFirst({ where: { id, child: { userId: session.userId } } });
    if (!owned) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });

    await prisma.incident.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ error: 'Failed to delete incident' }, { status: 500 });
  }
}
