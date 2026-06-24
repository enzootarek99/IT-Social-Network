import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId are required' },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const [followers, following] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      followers: followers.map((f) => f.follower),
      following: following.map((f) => f.following),
      followerCount: followers.length,
      followingCount: following.length,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    );
  }
}
