import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';

type RouteContext = {
  params: {
    postId: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({
      data: {
        postId: params.postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
