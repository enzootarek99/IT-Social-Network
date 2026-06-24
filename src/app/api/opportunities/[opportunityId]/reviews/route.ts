import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

type RouteContext = {
  params: Promise<{ opportunityId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { opportunityId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 });
    }

    const review = await prisma.opportunityReview.upsert({
      where: {
        opportunityId_reviewerId: {
          opportunityId,
          reviewerId: user.id,
        },
      },
      update: {
        rating,
        comment: requireString(body.comment, 'comment'),
      },
      create: {
        opportunityId,
        reviewerId: user.id,
        rating,
        comment: requireString(body.comment, 'comment'),
      },
      include: {
        reviewer: { select: publicUserSelect },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save review';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) console.error('Error saving review:', error);

    return NextResponse.json({ error: message }, { status });
  }
}
