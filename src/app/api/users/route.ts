import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';

const networkUserSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  title: true,
  bio: true,
  avatar: true,
  company: true,
  location: true,
  website: true,
  skills: true,
  createdAt: true,
  _count: {
    select: {
      posts: true,
      followers: true,
      following: true,
    },
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.trim();

    const users = await prisma.user.findMany({
      where: {
        ...(currentUser ? { id: { not: currentUser.id } } : {}),
        ...(search
          ? {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: networkUserSelect,
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    });

    const followedUserIds = currentUser
      ? new Set(
          (
            await prisma.follow.findMany({
              where: {
                followerId: currentUser.id,
                followingId: { in: users.map((user) => user.id) },
              },
              select: { followingId: true },
            })
          ).map((follow) => follow.followingId),
        )
      : new Set<string>();

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        followingByMe: followedUserIds.has(user.id),
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
