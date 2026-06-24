import { NextRequest, NextResponse } from 'next/server';
import { publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({
        users: [],
        posts: [],
        opportunities: [],
        events: [],
      });
    }

    const [users, posts, opportunities, events] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: publicUserSelect,
        take: 8,
      }),
      prisma.post.findMany({
        where: { content: { contains: q, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: publicUserSelect },
          _count: { select: { comments: true, likes: true } },
        },
        take: 8,
      }),
      prisma.freelanceOpportunity.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: publicUserSelect },
          _count: { select: { applications: true } },
        },
        take: 8,
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { startsAt: 'asc' },
        include: {
          organizer: { select: publicUserSelect },
          _count: { select: { attendees: true } },
        },
        take: 8,
      }),
    ]);

    return NextResponse.json({ users, posts, opportunities, events });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
