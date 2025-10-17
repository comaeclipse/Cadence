import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/catalogs/[type] - List catalog items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    let items;
    switch (type) {
      case 'behaviors':
        items = await prisma.behavior.findMany({ orderBy: { label: 'asc' } });
        break;
      case 'antecedents':
        items = await prisma.antecedent.findMany({ orderBy: { label: 'asc' } });
        break;
      case 'consequences':
        items = await prisma.consequence.findMany({ orderBy: { label: 'asc' } });
        break;
      case 'interventions':
        items = await prisma.intervention.findMany({ orderBy: { label: 'asc' } });
        break;
      case 'locations':
        items = await prisma.location.findMany({ orderBy: { label: 'asc' } });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid catalog type' },
          { status: 400 }
        );
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog items' },
      { status: 500 }
    );
  }
}

// POST /api/catalogs/[type] - Create catalog item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await request.json();

    let item;
    switch (type) {
      case 'behaviors':
        item = await prisma.behavior.create({ data: { label: body.label } });
        break;
      case 'antecedents':
        item = await prisma.antecedent.create({ data: { label: body.label } });
        break;
      case 'consequences':
        item = await prisma.consequence.create({ data: { label: body.label } });
        break;
      case 'interventions':
        item = await prisma.intervention.create({ data: { label: body.label } });
        break;
      case 'locations':
        item = await prisma.location.create({ data: { label: body.label } });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid catalog type' },
          { status: 400 }
        );
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return NextResponse.json(
      { error: 'Failed to create catalog item' },
      { status: 500 }
    );
  }
}
