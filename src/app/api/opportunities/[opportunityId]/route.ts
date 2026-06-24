import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString, toStringArray } from '@/lib/parsers';

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { opportunityId } = await context.params;

    const opportunity = await prisma.freelanceOpportunity.findUnique({
      where: { id: opportunityId },
      include: {
        author: { select: publicUserSelect },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: publicUserSelect } },
        },
        _count: {
          select: {
            applications: true,
            reviews: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const isAuthor = user?.id === opportunity.authorId;
    const appliedByMe = user
      ? Boolean(
          await prisma.opportunityApplication.findUnique({
            where: {
              opportunityId_applicantId: {
                opportunityId,
                applicantId: user.id,
              },
            },
            select: { id: true },
          }),
        )
      : false;
    const applications = isAuthor
      ? await prisma.opportunityApplication.findMany({
          where: { opportunityId },
          orderBy: { createdAt: 'desc' },
          include: {
            applicant: { select: publicUserSelect },
          },
        })
      : [];

    return NextResponse.json({
      opportunity: {
        ...opportunity,
        averageRating: opportunity.reviews.length
          ? opportunity.reviews.reduce((sum, review) => sum + review.rating, 0) /
            opportunity.reviews.length
          : null,
        applications,
        appliedByMe,
        isAuthor,
      },
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { opportunityId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const opportunity = await prisma.freelanceOpportunity.findUnique({
      where: { id: opportunityId },
      select: { authorId: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (opportunity.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own opportunities' }, { status: 403 });
    }

    const body = await request.json();
    const updatedOpportunity = await prisma.freelanceOpportunity.update({
      where: { id: opportunityId },
      data: {
        title: requireString(body.title, 'title'),
        company: requireString(body.company, 'company'),
        description: requireString(body.description, 'description'),
        budget: requireString(body.budget, 'budget'),
        location: requireString(body.location, 'location'),
        remote: Boolean(body.remote ?? true),
        contractType: typeof body.contractType === 'string' ? body.contractType : 'Mission',
        skills: toStringArray(body.skills),
      },
      include: {
        author: { select: publicUserSelect },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ opportunity: updatedOpportunity });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update opportunity';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error updating opportunity:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { opportunityId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const opportunity = await prisma.freelanceOpportunity.findUnique({
      where: { id: opportunityId },
      select: { authorId: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (opportunity.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own opportunities' }, { status: 403 });
    }

    await prisma.freelanceOpportunity.delete({ where: { id: opportunityId } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
