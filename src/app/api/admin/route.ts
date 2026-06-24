import { NextRequest, NextResponse } from 'next/server';
import { publicUserSelect } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdmin(request);

    if (response) {
      return response;
    }

    const [
      userCount,
      postCount,
      opportunityCount,
      eventCount,
      messageCount,
      notificationCount,
      users,
      posts,
      opportunities,
      events,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.freelanceOpportunity.count(),
      prisma.event.count(),
      prisma.message.count(),
      prisma.notification.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          ...publicUserSelect,
          _count: {
            select: {
              posts: true,
              followers: true,
              opportunities: true,
              organizedEvents: true,
            },
          },
        },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          author: { select: publicUserSelect },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.freelanceOpportunity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          author: { select: publicUserSelect },
          _count: { select: { applications: true } },
        },
      }),
      prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          organizer: { select: publicUserSelect },
          _count: { select: { attendees: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        userCount,
        postCount,
        opportunityCount,
        eventCount,
        messageCount,
        notificationCount,
      },
      users,
      posts,
      opportunities,
      events,
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
