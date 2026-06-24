import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { attachAuthCookie, hashPassword, publicUserSelect, signAuthToken } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';
import { getDatabaseSetupErrorMessage } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, firstName, lastName } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';

    if (!normalizedEmail || !normalizedUsername || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'email, username, password, firstName and lastName are required' },
        { status: 400 },
      );
    }

    if (!isValidEmail(normalizedEmail)) {
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
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
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
        email: normalizedEmail,
        username: normalizedUsername,
        password: await hashPassword(password),
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        title: 'IT Professional',
      },
      select: publicUserSelect,
    });

    const token = signAuthToken(user.id);
    const response = NextResponse.json({ user, token }, { status: 201 });

    return attachAuthCookie(response, token);
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: getDatabaseSetupErrorMessage(error, 'Inscription impossible.') },
      { status: 500 },
    );
  }
}
