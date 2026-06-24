import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { attachAuthCookie, hashPassword, publicUserSelect, signAuthToken } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, firstName, lastName } = body;

    if (!email || !username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'email, username, password, firstName and lastName are required' },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must contain at least 8 characters' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user already exists with this email or username' },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: await hashPassword(password),
        firstName,
        lastName,
        title: 'IT Professional',
      },
      select: publicUserSelect,
    });

    const token = signAuthToken(user.id);
    const response = NextResponse.json({ user, token }, { status: 201 });

    return attachAuthCookie(response, token);
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
