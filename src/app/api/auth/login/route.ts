import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { attachAuthCookie, publicUserSelect, signAuthToken, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const userWithPassword = await prisma.user.findUnique({
      where: { email },
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
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
