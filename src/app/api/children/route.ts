import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/children - List all children
export async function GET() {
  try {
    const children = await prisma.child.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}

// POST /api/children - Create a new child
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const child = await prisma.child.create({
      data: {
        name: body.name,
        dob: body.dob ? new Date(body.dob) : undefined,
        avatarUrl: body.avatarUrl,
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: 'Failed to create child' },
      { status: 500 }
    );
  }
}
