import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

type Params = { params: Promise<{ type: string; id: string }> };

// DELETE /api/catalogs/[type]/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { type, id } = await params;

    switch (type) {
      case 'behaviors':
        await prisma.behavior.delete({ where: { id } });
        break;
      case 'antecedents':
        await prisma.antecedent.delete({ where: { id } });
        break;
      case 'consequences':
        await prisma.consequence.delete({ where: { id } });
        break;
      case 'interventions':
        await prisma.intervention.delete({ where: { id } });
        break;
      case 'locations':
        await prisma.location.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid catalog type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    return NextResponse.json({ error: 'Failed to delete catalog item' }, { status: 500 });
  }
}
