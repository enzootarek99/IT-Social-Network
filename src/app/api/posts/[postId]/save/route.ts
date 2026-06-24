import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';

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

    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existingSave) {
      await prisma.savedPost.delete({ where: { id: existingSave.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.savedPost.create({
      data: {
        postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Error toggling saved post:', error);
    return NextResponse.json({ error: 'Failed to toggle saved post' }, { status: 500 });
  }
}
