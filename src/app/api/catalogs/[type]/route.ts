import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CatalogType = 'behaviors' | 'antecedents' | 'consequences' | 'interventions' | 'locations';

const catalogModelMap = {
  behaviors: prisma.behavior,
  antecedents: prisma.antecedent,
  consequences: prisma.consequence,
  interventions: prisma.intervention,
  locations: prisma.location,
};

// GET /api/catalogs/[type] - List catalog items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    if (!(type in catalogModelMap)) {
      return NextResponse.json(
        { error: 'Invalid catalog type' },
        { status: 400 }
      );
    }

    const model = catalogModelMap[type as CatalogType];
    const items = await model.findMany({
      orderBy: {
        label: 'asc',
      },
    });

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

    if (!(type in catalogModelMap)) {
      return NextResponse.json(
        { error: 'Invalid catalog type' },
        { status: 400 }
      );
    }

    const model = catalogModelMap[type as CatalogType];
    const item = await model.create({
      data: {
        label: body.label,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return NextResponse.json(
      { error: 'Failed to create catalog item' },
      { status: 500 }
    );
  }
}
