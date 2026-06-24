import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

const allowedNames = new Set(['Linkora', 'DevGrid', 'Peerlink', 'Techphere', 'Stackd', 'Noduuz', 'NexusIT']);

export async function GET() {
  const groupedVotes = await prisma.nameVote.groupBy({
    by: ['name'],
    _count: { name: true },
  });

  return NextResponse.json({
    votes: groupedVotes.map((vote) => ({ name: vote.name, count: vote._count.name })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const name = requireString(body.name, 'name');

    if (!allowedNames.has(name)) {
      return NextResponse.json({ error: 'Unsupported name proposal' }, { status: 400 });
    }

    await prisma.nameVote.deleteMany({ where: { userId: user.id } });
    const vote = await prisma.nameVote.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to vote';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error voting for name:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
