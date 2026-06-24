import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const protectedPrefixes = [
    '/dashboard',
    '/search',
    '/name-proposals',
    '/network',
    '/saved',
    '/profile',
    '/marketplace',
    '/events',
    '/messages',
    '/notifications',
  ];
  const isProtectedRoute =
    pathname === '/' ||
    isAdminRoute ||
    protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL(isAdminRoute ? '/admin/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/search/:path*',
    '/name-proposals/:path*',
    '/network/:path*',
    '/saved/:path*',
    '/profile/:path*',
    '/marketplace/:path*',
    '/events/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/admin/:path*',
  ],
};
