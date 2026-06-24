import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { attachAuthCookie, publicUserSelect, signAuthToken, verifyPassword } from '@/lib/auth';
import { getDatabaseSetupErrorMessage } from '@/lib/api-errors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, password } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const userWithPassword = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, userWithPassword.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userWithPassword.id },
      select: publicUserSelect,
    });
    const token = signAuthToken(user.id);
    const response = NextResponse.json({ user, token });

    return attachAuthCookie(response, token);
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: getDatabaseSetupErrorMessage(error, 'Connexion impossible.') },
      { status: 500 },
    );
  }
}
