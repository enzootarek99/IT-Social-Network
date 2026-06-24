import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';

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
        _count: {
          select: {
            applications: true,
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
