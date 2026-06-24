import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

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
    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId,
        applicantId: user.id,
        message: requireString(body.message, 'message'),
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error applying to opportunity:', error);
    return NextResponse.json({ error: 'Failed to apply to opportunity' }, { status: 500 });
  }
}
