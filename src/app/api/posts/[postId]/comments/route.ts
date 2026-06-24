import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';
import { createNotification } from '@/lib/notifications';

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { postId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        author: {
          select: { username: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content: requireString(body.content, 'content'),
      },
      include: {
        author: { select: publicUserSelect },
      },
    });
    await createNotification({
      recipientId: post.authorId,
      actorId: user.id,
      type: 'comment',
      message: `${user.firstName} ${user.lastName} a commenté votre publication.`,
      link: `/profile/${post.author.username}`,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error creating comment:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
