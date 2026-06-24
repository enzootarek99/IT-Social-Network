import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const online = searchParams.get('online');
    const timeframe = searchParams.get('timeframe') || 'upcoming';

    const events = await prisma.event.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(online === 'true' ? { online: true } : online === 'false' ? { online: false } : {}),
        ...(timeframe === 'past'
          ? { startsAt: { lt: new Date() } }
          : timeframe === 'all'
            ? {}
            : { startsAt: { gte: new Date() } }),
      },
      orderBy: { startsAt: 'asc' },
      include: {
        organizer: { select: publicUserSelect },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      take: 50,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const startsAt = new Date(requireString(body.startsAt, 'startsAt'));
    const endsAt = body.endsAt ? new Date(body.endsAt) : null;

    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      return NextResponse.json({ error: 'Invalid event date' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: requireString(body.title, 'title'),
        description: requireString(body.description, 'description'),
        location: requireString(body.location, 'location'),
        startsAt,
        endsAt,
        online: Boolean(body.online ?? false),
        url: typeof body.url === 'string' ? body.url.trim() || null : null,
        organizerId: user.id,
      },
      include: {
        organizer: { select: publicUserSelect },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create event';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error creating event:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
