import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { getOtherParticipantId, normalizeParticipants } from '@/lib/messaging';

const conversationInclude = {
  participantA: { select: publicUserSelect },
  participantB: { select: publicUserSelect },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      sender: { select: publicUserSelect },
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: user.id }, { participantBId: user.id }],
      },
      orderBy: { updatedAt: 'desc' },
      include: conversationInclude,
    });

    const unreadCounts = await Promise.all(
      conversations.map((conversation) =>
        prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: user.id },
            read: false,
          },
        }),
      ),
    );

    return NextResponse.json({
      conversations: conversations.map((conversation, index) => ({
        ...conversation,
        otherParticipant:
          getOtherParticipantId(conversation, user.id) === conversation.participantAId
            ? conversation.participantA
            : conversation.participantB,
        lastMessage: conversation.messages[0] || null,
        unreadCount: unreadCounts[index],
      })),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const participantId = typeof body.participantId === 'string' ? body.participantId : undefined;

    if (!participantId) {
      return NextResponse.json({ error: 'participantId is required' }, { status: 400 });
    }

    if (participantId === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const participants = normalizeParticipants(user.id, participantId);
    const conversation = await prisma.conversation.upsert({
      where: {
        participantAId_participantBId: participants,
      },
      update: {},
      create: participants,
      include: conversationInclude,
    });

    return NextResponse.json({
      conversation: {
        ...conversation,
        otherParticipant:
          getOtherParticipantId(conversation, user.id) === conversation.participantAId
            ? conversation.participantA
            : conversation.participantB,
        lastMessage: conversation.messages[0] || null,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
