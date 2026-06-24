import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const [
      postCount,
      followerCount,
      applicationCount,
      unreadNotificationCount,
      unreadMessageCount,
      recentNotifications,
      conversations,
      upcomingEvents,
      receivedApplications,
    ] = await Promise.all([
      prisma.post.count({ where: { authorId: user.id } }),
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.opportunityApplication.count({
        where: { opportunity: { authorId: user.id } },
      }),
      prisma.notification.count({ where: { recipientId: user.id, read: false } }),
      prisma.message.count({
        where: {
          senderId: { not: user.id },
          read: false,
          conversation: {
            OR: [{ participantAId: user.id }, { participantBId: user.id }],
          },
        },
      }),
      prisma.notification.findMany({
        where: { recipientId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.conversation.findMany({
        where: {
          OR: [{ participantAId: user.id }, { participantBId: user.id }],
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          participantA: { select: publicUserSelect },
          participantB: { select: publicUserSelect },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.event.findMany({
        where: {
          startsAt: { gte: new Date() },
          OR: [{ organizerId: user.id }, { attendees: { some: { userId: user.id } } }],
        },
        orderBy: { startsAt: 'asc' },
        take: 5,
      }),
      prisma.opportunityApplication.findMany({
        where: { opportunity: { authorId: user.id } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          applicant: { select: publicUserSelect },
          opportunity: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        postCount,
        followerCount,
        applicationCount,
        unreadNotificationCount,
        unreadMessageCount,
      },
      recentNotifications,
      conversations: conversations.map((conversation) => ({
        ...conversation,
        otherParticipant:
          conversation.participantAId === user.id
            ? conversation.participantB
            : conversation.participantA,
        lastMessage: conversation.messages[0] || null,
      })),
      upcomingEvents,
      receivedApplications,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
