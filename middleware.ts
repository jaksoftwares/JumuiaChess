import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin/dashboard')) {
    const cookies = request.cookies.getAll();
    const hasAuthToken = cookies.some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
    const hasDevSession = request.cookies.has('admin-session');

    // Allow local development without forcing login while still protecting the route in production.
    if (!hasAuthToken && !hasDevSession && process.env.NODE_ENV === 'production') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
