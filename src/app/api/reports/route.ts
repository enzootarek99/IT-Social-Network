import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

const allowedTargetTypes = new Set(['post', 'comment', 'opportunity', 'event', 'message', 'user']);

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const targetType = requireString(body.targetType, 'targetType');
    const targetId = requireString(body.targetId, 'targetId');
    const reason = requireString(body.reason, 'reason');

    if (!allowedTargetTypes.has(targetType)) {
      return NextResponse.json({ error: 'Unsupported report target type' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        targetType,
        targetId,
        reason,
        reporterId: user.id,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create report';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error creating report:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
