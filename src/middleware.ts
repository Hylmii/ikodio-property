import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login-user', 
    '/login-tenant', 
    '/register-user', 
    '/register-tenant', 
    '/verify-email', 
    '/reset-password',
    '/confirm-reset-password',
    '/properties',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith('/properties/')
  );

  // User protected routes - only accessible by authenticated USER
  const userRoutes = ['/profile', '/transactions'];
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

  // Tenant protected routes - only accessible by authenticated TENANT
  const tenantRoutes = ['/tenant'];
  const isTenantRoute = tenantRoutes.some(route => pathname.startsWith(route));

  // Admin protected routes - only accessible by authenticated ADMIN
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // API and static routes - always allow
  const isApiRoute = pathname.startsWith('/api');
  const isStaticRoute = pathname.startsWith('/_next') || pathname.startsWith('/uploads') || pathname.includes('.');

  if (isApiRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // If user not logged in and trying to access protected route
  if (!session && (isUserRoute || isTenantRoute || isAdminRoute)) {
    let loginUrl = '/login-user';
    if (isTenantRoute) loginUrl = '/login-tenant';
    if (isAdminRoute) loginUrl = '/login-user'; // Admin login via user login
    
    const url = new URL(loginUrl, request.url);
    url.searchParams.set('callbackUrl', pathname);
    url.searchParams.set('message', 'Please login to continue');
    return NextResponse.redirect(url);
  }

  // If user is logged in
  if (session && session.user) {
    const userRole = session.user.role;
    const isVerified = session.user.isVerified;

    // Redirect logged-in users away from login/register pages
    if (pathname === '/login-user' || pathname === '/register-user') {
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (userRole === 'USER') {
        return NextResponse.redirect(new URL('/properties', request.url));
      }
    }

    if (pathname === '/login-tenant' || pathname === '/register-tenant') {
      if (userRole === 'TENANT') {
        return NextResponse.redirect(new URL('/tenant/dashboard', request.url));
      }
    }

    // USER role trying to access TENANT routes
    if (userRole === 'USER' && isTenantRoute) {
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'Akses Ditolak: Area ini khusus untuk pemilik properti (tenant). Akun Anda adalah pengguna (user).');
      return NextResponse.redirect(url);
    }

    // TENANT role trying to access USER routes
    if (userRole === 'TENANT' && isUserRoute) {
      const url = new URL('/tenant/dashboard', request.url);
      url.searchParams.set('error', 'Akses Ditolak: Fitur ini khusus untuk pengguna (user). Akun tenant tidak dapat mengakses fitur pemesanan.');
      return NextResponse.redirect(url);
    }

    // Non-ADMIN role trying to access ADMIN routes
    if (isAdminRoute && userRole !== 'ADMIN') {
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'Akses Ditolak: Area ini memerlukan hak akses administrator.');
      return NextResponse.redirect(url);
    }

    // Check email verification for critical actions
    const requiresVerification = [
      '/transactions/create',
      '/tenant/properties/create',
      '/tenant/properties/new',
      '/tenant/orders',
    ];
    
    const needsVerification = requiresVerification.some(path => pathname.startsWith(path));
    
    if (needsVerification && !isVerified) {
      const url = new URL('/profile', request.url);
      url.searchParams.set('error', 'Please verify your email address to continue');
      url.searchParams.set('showVerification', 'true');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (upload directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
