import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { optionalUrl, requireString } from '@/lib/parsers';

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { postId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own posts' }, { status: 403 });
    }

    const body = await request.json();
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: requireString(body.content, 'content'),
        imageUrl: optionalUrl(body.imageUrl, 'imageUrl'),
      },
      include: {
        author: { select: publicUserSelect },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 5,
          include: {
            author: { select: publicUserSelect },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update post';
    const status = message.includes('required') || message.includes('valid URL') ? 400 : 500;

    if (status === 500) {
      console.error('Error updating post:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { postId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own posts' }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
