import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';
import { getOtherParticipantId } from '@/lib/messaging';
import { createNotification } from '@/lib/notifications';

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
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
      select: {
        id: true,
        participantAId: true,
        participantBId: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const body = await request.json();
    const content = requireString(body.content, 'content');
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
      },
      include: {
        sender: { select: publicUserSelect },
      },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const recipientId = getOtherParticipantId(conversation, user.id);
    await createNotification({
      recipientId,
      actorId: user.id,
      type: 'message',
      message: `${user.firstName} ${user.lastName} vous a envoyé un message.`,
      link: `/messages?conversationId=${conversationId}`,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error sending message:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
