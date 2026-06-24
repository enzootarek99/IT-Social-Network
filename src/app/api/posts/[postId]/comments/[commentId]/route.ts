import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

type RouteContext = {
  params: Promise<{
    postId: string;
    commentId: string;
  }>;
};

async function getEditableComment(commentId: string, postId: string) {
  return prisma.comment.findFirst({
    where: { id: commentId, postId },
    select: { authorId: true },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { postId, commentId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const comment = await getEditableComment(commentId, postId);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own comments' }, { status: 403 });
    }

    const body = await request.json();
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: requireString(body.content, 'content') },
      include: { author: { select: publicUserSelect } },
    });

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update comment';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error updating comment:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { postId, commentId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const comment = await getEditableComment(commentId, postId);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
