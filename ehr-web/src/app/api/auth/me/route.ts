import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/me
 *
 * Returns the full user profile including data that's not stored in the session
 * to prevent "431 Request Header Fields Too Large" errors.
 *
 * This endpoint fetches complete user data from the backend API, including:
 * - Full list of permissions (not limited to 20)
 * - Full list of roles (not limited to 10)
 * - Full list of location_ids (not limited to 10)
 * - Organization logo URL
 * - All org specialties
 * - Any other data not stored in session
 *
 * Use this when you need complete user profile data beyond what's in the session.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full user profile from backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'x-user-id': session.user?.id || '',
        'x-org-id': session.org_id || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: response.status }
      );
    }

    const userData = await response.json();

    // Merge session data with full profile data
    const fullProfile = {
      ...userData,
      // Include session data
      user: session.user,
      org_id: session.org_id,
      org_slug: session.org_slug,
      org_name: session.org_name,
      onboarding_completed: session.onboarding_completed,
      scope: session.scope,
    };

    return NextResponse.json({
      success: true,
      profile: fullProfile,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
