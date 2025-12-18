import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import acceptLanguage from 'accept-language';
import { cookieName, fallbackLng, languages } from './i18n/settings';

acceptLanguage.languages(languages);

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
  '/patient-login', // Patient portal login
  '/patient-register', // Patient portal registration
  '/api/patient/register', // Patient registration API
  '/_next',
  '/favicon.ico',
  '/api/health',
  '/widget', // Public booking widget
  '/api/public', // Public API endpoints for widget
  '/meeting', // Public meeting links for patients
  '/join', // Alternative public meeting join path
  '/forms/fill', // Public form filling for patients
];

// Root path should be accessible to everyone (landing page)
const ROOT_PATH = '/';

// Paths that require authentication but not org validation
const AUTH_ONLY_PATHS = [
  '/onboarding',
  '/select-organization',
  '/accept-invitation',
  '/portal', // Patient portal - authenticated but no org context needed
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Language detection (applies to all routes, including public + root).
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatches = [...cookieHeader.matchAll(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`, 'g'))];
  const lastCookieValueRaw = cookieMatches.length > 0 ? cookieMatches[cookieMatches.length - 1][1] : undefined;
  const lastCookieValueDecoded = lastCookieValueRaw ? decodeURIComponent(lastCookieValueRaw) : undefined;
  const lastCookieBase = lastCookieValueDecoded?.split('-')[0] || undefined;

  let lng: string = fallbackLng;
  if (lastCookieBase && languages.includes(lastCookieBase)) {
    lng = lastCookieBase;
  } else {
    const fromAcceptLanguage = acceptLanguage.get(request.headers.get('Accept-Language')) ?? undefined;
    const acceptBase = fromAcceptLanguage?.split('-')[0] || undefined;
    if (acceptBase && languages.includes(acceptBase)) {
      lng = acceptBase;
    }
  }

  const applyLocaleCookie = (response: NextResponse) => {
    // Normalize the locale cookie to root path to avoid path-scoped duplicates.
    response.cookies.set(cookieName, lng, { path: '/', maxAge: 60 * 60 * 24 * 365 });

    // Best-effort cleanup of path-scoped duplicates that were set without an explicit path.
    const defaultPath = pathname.substring(0, pathname.lastIndexOf('/')) || '/';
    if (defaultPath !== '/') {
      response.cookies.set(cookieName, '', { path: defaultPath, maxAge: 0 });
    }
    return response;
  };

  // Allow root path (landing page) for everyone
  if (pathname === ROOT_PATH) {
    return applyLocaleCookie(NextResponse.next());
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return applyLocaleCookie(NextResponse.next());
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
      return applyLocaleCookie(NextResponse.redirect(loginUrl));
    } else {
      // For API routes, just return 401 Unauthorized
      // Don't redirect API calls to pages
      return applyLocaleCookie(NextResponse.redirect(new URL('/', request.url)));

    }
  }

  // Handle auth-only paths (onboarding, etc.)
  if (AUTH_ONLY_PATHS.some(path => pathname.startsWith(path))) {
    return applyLocaleCookie(NextResponse.next());
  }

  // Get org context from token
  const tokenOrgId = token.org_id as string | undefined;
  const tokenOrgSlug = token.org_slug as string | undefined;
  const userType = token.userType as string | undefined;

  // If user has no org assigned and not already on onboarding, redirect to onboarding
  // BUT: Skip this check for patients - they don't have org_id, they have patientId
  if (!tokenOrgId && !pathname.startsWith('/onboarding') && userType !== 'patient') {
    return applyLocaleCookie(NextResponse.redirect(new URL('/onboarding', request.url)));
  }

  // Create response with org context headers for API/database isolation
  const response = applyLocaleCookie(NextResponse.next());

  // Set user ID header (from id or sub field)
  const tokenUserId = (token.id || token.sub) as string | undefined;
  if (tokenUserId) {
    response.headers.set('x-user-id', tokenUserId);
  }

  // Set org context headers
  if (tokenOrgId) {
    response.headers.set('x-org-id', tokenOrgId);
  }
  if (tokenOrgSlug) {
    response.headers.set('x-org-slug', tokenOrgSlug);
  }

  // Set location IDs
  const tokenLocationIds = token.location_ids as string[] | undefined;
  if (tokenLocationIds) {
    response.headers.set('x-location-ids', JSON.stringify(tokenLocationIds));
  }

  // Set user roles
  const tokenRoles = token.roles as string[] | undefined;
  if (tokenRoles) {
    response.headers.set('x-user-roles', JSON.stringify(tokenRoles));
  }

  // Set user permissions
  const tokenPermissions = token.permissions as string[] | undefined;
  if (tokenPermissions) {
    response.headers.set('x-user-permissions', JSON.stringify(tokenPermissions));
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
