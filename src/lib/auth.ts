import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const TOKEN_COOKIE = 'token';

export const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  adminRole: true,
  firstName: true,
  lastName: true,
  title: true,
  bio: true,
  avatar: true,
  company: true,
  location: true,
  website: true,
  skills: true,
  experience: true,
  education: true,
  portfolio: true,
  createdAt: true,
  updatedAt: true,
} as const;

type TokenPayload = JwtPayload & {
  userId?: string;
};

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  return 'development-secret';
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export function signAuthToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}

export function getTokenFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get(TOKEN_COOKIE)?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  return cookieToken ?? bearerToken;
}

export async function getAuthUserFromToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;

    if (!decoded.userId) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: decoded.userId },
      select: publicUserSelect,
    });
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest) {
  const token = getTokenFromRequest(request);
  return getAuthUserFromToken(token);
}

export function attachAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}
