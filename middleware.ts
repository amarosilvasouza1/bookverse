import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/' || 
    path === '/login' || 
    path === '/register' || 
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') || 
    path.startsWith('/static') ||
    path.includes('favicon.ico');

  const token = request.cookies.get('session')?.value;
  let isAuthenticated = false;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      isAuthenticated = true;
    }
  }

  // Redirect to login if accessing protected route without auth
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing login/register while authenticated
  if ((path === '/login' || path === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
