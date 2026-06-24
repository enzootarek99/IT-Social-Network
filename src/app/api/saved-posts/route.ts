import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: { select: publicUserSelect },
            comments: {
              orderBy: { createdAt: 'asc' },
              take: 5,
              include: { author: { select: publicUserSelect } },
            },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    });

    return NextResponse.json({ posts: savedPosts.map((item) => item.post) });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 });
  }
}
