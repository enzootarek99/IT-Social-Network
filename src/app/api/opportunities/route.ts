import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString, toStringArray } from '@/lib/parsers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const skill = searchParams.get('skill')?.trim();
    const remote = searchParams.get('remote');
    const contractType = searchParams.get('contractType')?.trim();

    const opportunities = await prisma.freelanceOpportunity.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { company: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(skill ? { skills: { has: skill } } : {}),
        ...(remote === 'true' ? { remote: true } : remote === 'false' ? { remote: false } : {}),
        ...(contractType ? { contractType: { contains: contractType, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: publicUserSelect },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      take: 50,
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const opportunity = await prisma.freelanceOpportunity.create({
      data: {
        title: requireString(body.title, 'title'),
        company: requireString(body.company, 'company'),
        description: requireString(body.description, 'description'),
        budget: requireString(body.budget, 'budget'),
        location: requireString(body.location, 'location'),
        remote: Boolean(body.remote ?? true),
        contractType: typeof body.contractType === 'string' ? body.contractType : 'Mission',
        skills: toStringArray(body.skills),
        authorId: user.id,
      },
      include: {
        author: { select: publicUserSelect },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create opportunity';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error creating opportunity:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
