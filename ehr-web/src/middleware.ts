import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require org validation
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/fhir', // FHIR API endpoints
  '/auth',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/_next',
  '/favicon.ico',
  '/api/health',
];

// Root path should be accessible to everyone (landing page)
const ROOT_PATH = '/';

// Paths that require authentication but not org validation
const AUTH_ONLY_PATHS = [
  '/onboarding',
  '/select-organization',
  '/accept-invitation',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow root path (landing page) for everyone
  if (pathname === ROOT_PATH) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if no session
  if (!token) {
    // Only set callbackUrl for page routes, NOT for API routes
    // API routes should never be navigation destinations
    if (!pathname.startsWith('/api/')) {
      // For page routes, redirect to root with callbackUrl so user can sign in
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      // For API routes, just return 401 Unauthorized
      // Don't redirect API calls to pages
      return NextResponse.redirect(new URL('/', request.url));

    }
  }

  // Handle auth-only paths (onboarding, etc.)
  if (AUTH_ONLY_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get org context from token
  const tokenOrgId = token.org_id as string | undefined;
  const tokenOrgSlug = token.org_slug as string | undefined;
  
  // If user has no org assigned and not already on onboarding, redirect to onboarding
  if (!tokenOrgId && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Create response with org context headers for API/database isolation
  const response = NextResponse.next();
  
  if (tokenOrgId) {
    response.headers.set('x-org-id', tokenOrgId);
  }
  if (tokenOrgSlug) {
    response.headers.set('x-org-slug', tokenOrgSlug);
  }
  
  const tokenLocationIds = token.location_ids as string[] | undefined;
  if (tokenLocationIds) {
    response.headers.set('x-location-ids', JSON.stringify(tokenLocationIds));
  }
  
  const tokenRoles = token.roles as string[] | undefined;
  if (tokenRoles) {
    response.headers.set('x-user-roles', JSON.stringify(tokenRoles));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
