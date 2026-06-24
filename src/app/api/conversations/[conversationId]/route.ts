import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { getOtherParticipantId } from '@/lib/messaging';

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

async function getConversationForUser(conversationId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantAId: userId }, { participantBId: userId }],
    },
    include: {
      participantA: { select: publicUserSelect },
      participantB: { select: publicUserSelect },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: publicUserSelect },
        },
      },
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { conversationId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversation = await getConversationForUser(conversationId, user.id);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      conversation: {
        ...conversation,
        otherParticipant:
          getOtherParticipantId(conversation, user.id) === conversation.participantAId
            ? conversation.participantA
            : conversation.participantB,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { conversationId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ participantAId: user.id }, { participantBId: user.id }],
      },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 });
  }
}
