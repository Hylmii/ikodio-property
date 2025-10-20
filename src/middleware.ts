import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/login-user', '/login-tenant', '/register-user', '/register-tenant', '/verify-email', '/reset-password', '/properties'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // User protected routes
  const userRoutes = ['/profile', '/transactions', '/reviews'];
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

  // Tenant protected routes
  const tenantRoutes = ['/dashboard', '/tenant/properties', '/tenant/orders', '/tenant/reports', '/tenant/categories'];
  const isTenantRoute = tenantRoutes.some(route => pathname.startsWith(route));

  // API routes
  const isApiRoute = pathname.startsWith('/api');

  // Jika user belum login dan mencoba akses protected route
  if (!session && (isUserRoute || isTenantRoute)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika user sudah login
  if (session && session.user) {
    const userRole = session.user.role;

    // User role trying to access tenant routes
    if (userRole === 'USER' && isTenantRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Tenant role trying to access user routes
    if (userRole === 'TENANT' && isUserRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect to appropriate dashboard after login
    if (pathname === '/login-user' && userRole === 'USER') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    if (pathname === '/login-tenant' && userRole === 'TENANT') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
