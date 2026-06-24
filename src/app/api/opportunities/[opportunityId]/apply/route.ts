import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';
import { createNotification } from '@/lib/notifications';

type RouteContext = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { opportunityId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const message = requireString(body.message, 'message');
    const opportunity = await prisma.freelanceOpportunity.findUnique({
      where: { id: opportunityId },
      select: {
        authorId: true,
        title: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const existingApplication = await prisma.opportunityApplication.findUnique({
      where: {
        opportunityId_applicantId: {
          opportunityId,
          applicantId: user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 409 },
      );
    }

    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId,
        applicantId: user.id,
        message,
      },
    });
    await createNotification({
      recipientId: opportunity.authorId,
      actorId: user.id,
      type: 'application',
      message: `${user.firstName} ${user.lastName} a candidaté à "${opportunity.title}".`,
      link: `/marketplace/${opportunityId}`,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to apply to opportunity';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error applying to opportunity:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
