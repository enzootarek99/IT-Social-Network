import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
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
      take: 50,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const content = requireString(body.content, 'content');

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : null,
        authorId: user.id,
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

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error creating post:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
