# Missing Pieces Implementation Guide

This document addresses critical gaps identified in the initial RBAC implementation and provides complete solutions for production readiness.

---

## 1. Token Lifecycle & Refresh Strategy

### NextAuth Token Refresh Implementation

**File**: `ehr-web/src/lib/auth.ts` (Enhanced)

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      // Initial sign in
      if (account && profile) {
        const profileWithClaims = profile as Record<string, unknown>;
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at! * 1000,
          idToken: account.id_token,
          org_id: profileWithClaims.org_id as string,
          org_slug: profileWithClaims.org_slug as string,
          location_ids: profileWithClaims.location_ids as string[],
          permissions: profileWithClaims.permissions as string[],
          roles: profile.realm_access?.roles || [],
        };
      }

      // Token is still valid
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Token has expired, try to refresh
      console.log('Token expired, refreshing...');
      return refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.idToken = token.idToken as string;
      session.roles = token.roles as string[];
      session.org_id = token.org_id as string;
      session.org_slug = token.org_slug as string;
      session.location_ids = token.location_ids as string[];
      session.permissions = token.permissions as string[];
      
      // Pass error to frontend
      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.idToken) {
        const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
        const logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`;
        
        try {
          const params = new URLSearchParams({
            id_token_hint: token.idToken as string,
            post_logout_redirect_uri: process.env.NEXTAUTH_URL || 'http://localhost:3000',
          });
          
          await fetch(`${logoutUrl}?${params.toString()}`, {
            method: 'GET',
          });
        } catch (error) {
          console.error('Error logging out from Keycloak:', error);
        }
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours for healthcare compliance
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};
```

### Token Revocation Hook

**Backend**: `ehr-api/src/services/session.service.js`

```javascript
const KeycloakService = require('./keycloak.service');
const { query } = require('../database/connection');

class SessionService {
  /**
   * Force logout user (revoke all sessions)
   * Called when user is disabled or roles revoked
   */
  async forceLogout(userId, reason) {
    // Get user's Keycloak ID
    const result = await query(
      'SELECT keycloak_user_id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const keycloakUserId = result.rows[0].keycloak_user_id;

    // Revoke all Keycloak sessions
    await KeycloakService.logoutUser(keycloakUserId);

    // Log the forced logout
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata
      )
      SELECT 
        ra.org_id, $2, 'AUTH.FORCED_LOGOUT', 'User', $1,
        u.email, 'success', $3
      FROM users u
      JOIN role_assignments ra ON u.id = ra.user_id
      WHERE u.id = $1
      LIMIT 1`,
      [userId, userId, JSON.stringify({ reason })]
    );

    return { success: true, message: 'User sessions revoked' };
  }

  /**
   * Check if user session is still valid
   * Call this on sensitive operations
   */
  async validateUserSession(userId, orgId) {
    const result = await query(
      `SELECT u.status, ra.revoked_at
       FROM users u
       JOIN role_assignments ra ON u.id = ra.user_id
       WHERE u.id = $1 AND ra.org_id = $2
       LIMIT 1`,
      [userId, orgId]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'User not found in organization' };
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return { valid: false, reason: 'User account is not active' };
    }

    if (user.revoked_at) {
      return { valid: false, reason: 'User access has been revoked' };
    }

    return { valid: true };
  }
}

module.exports = new SessionService();
```

### Frontend Token Validation

**File**: `ehr-web/src/hooks/use-session-validation.ts`

```typescript
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionValidation() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.error === 'RefreshAccessTokenError') {
      // Token refresh failed, force re-login
      router.push('/auth/signin?error=SessionExpired');
    }
  }, [session, status, router]);

  return { session, status };
}
```

---

## 2. Org Isolation Enforcement

### Enhanced Middleware with Org Validation

**File**: `ehr-web/src/middleware.ts` (Enhanced)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  const PUBLIC_PATHS = [
    '/api/auth',
    '/api/orgs', // POST only (signup)
    '/api/invitations',
    '/auth',
    '/register',
    '/accept-invitation',
    '/_next',
    '/favicon.ico',
  ];

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Extract org slug from path
  const orgSlugMatch = pathname.match(/^\/t\/([^/]+)/);
  const pathOrgSlug = orgSlugMatch ? orgSlugMatch[1] : null;

  const tokenOrgSlug = token.org_slug as string | undefined;
  const tokenOrgId = token.org_id as string | undefined;

  // Validate org slug matches token
  if (pathOrgSlug && tokenOrgSlug && pathOrgSlug !== tokenOrgSlug) {
    console.warn(`Org access denied: user ${token.email} (${tokenOrgSlug}) tried to access ${pathOrgSlug}`);
    
    // Log security event
    await logSecurityEvent({
      type: 'ORG_ACCESS_DENIED',
      userId: token.sub,
      attemptedOrg: pathOrgSlug,
      userOrg: tokenOrgSlug,
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.redirect(new URL(`/t/${tokenOrgSlug}/unauthorized`, request.url));
  }

  // Create response with security headers
  const response = NextResponse.next();
  
  // Add org context headers for API
  if (tokenOrgId) {
    response.headers.set('x-org-id', tokenOrgId);
    response.headers.set('x-user-id', token.sub as string);
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

async function logSecurityEvent(event: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/security-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
```

### Backend API Org Enforcement

**File**: `ehr-api/src/middleware/org-isolation.js`

```javascript
/**
 * Middleware to enforce org isolation at API level
 * Must be used on all protected routes
 */
function enforceOrgIsolation(req, res, next) {
  const requestedOrgId = req.params.orgId || req.body.org_id;
  const tokenOrgId = req.headers['x-org-id'];
  const userId = req.headers['x-user-id'];

  if (!tokenOrgId || !userId) {
    return res.status(401).json({ error: 'Missing authentication context' });
  }

  // Check if requested org matches token org
  if (requestedOrgId && requestedOrgId !== tokenOrgId) {
    // Log security event
    logSecurityViolation({
      type: 'ORG_ISOLATION_VIOLATION',
      userId,
      tokenOrgId,
      requestedOrgId,
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(403).json({ 
      error: 'Access denied',
      code: 'ORG_ISOLATION_VIOLATION' 
    });
  }

  // Attach to request for use in handlers
  req.orgContext = {
    orgId: tokenOrgId,
    userId,
    roles: req.headers['x-user-roles'] ? JSON.parse(req.headers['x-user-roles']) : [],
    locationIds: req.headers['x-location-ids'] ? JSON.parse(req.headers['x-location-ids']) : [],
  };

  next();
}

async function logSecurityViolation(event) {
  const { query } = require('../database/connection');
  
  try {
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type,
        status, metadata, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, 'failure', $5, $6, $7)`,
      [
        event.tokenOrgId,
        event.userId,
        event.type,
        'SecurityViolation',
        JSON.stringify({
          requestedOrgId: event.requestedOrgId,
          endpoint: event.endpoint,
          method: event.method,
        }),
        event.ip,
        event.userAgent,
      ]
    );
  } catch (error) {
    console.error('Failed to log security violation:', error);
  }
}

module.exports = { enforceOrgIsolation };
```

### Database Query Guard

**File**: `ehr-api/src/database/connection.js` (Add to existing)

```javascript
/**
 * Safe query that enforces org_id filtering
 * Use this for all tenant-scoped queries
 */
async function querySafe(sql, params, orgContext) {
  if (!orgContext || !orgContext.org_id) {
    throw new Error('orgContext with org_id is required for safe queries');
  }

  // Verify query includes org_id filter
  if (!sql.toLowerCase().includes('org_id')) {
    console.warn('Query without org_id filter:', sql);
    // In production, you might want to throw an error here
  }

  return await query(sql, params, orgContext);
}

module.exports = {
  // ... existing exports
  querySafe,
};
```

---

## 3. Complete Onboarding Wizard

### Onboarding API Routes

**File**: `ehr-api/src/routes/onboarding.js`

```javascript
const express = require('express');
const router = express.Router();
const { enforceOrgIsolation } = require('../middleware/org-isolation');

router.use(enforceOrgIsolation);

const ONBOARDING_STEPS = [
  { id: 'profile', name: 'Organization Profile', required: true },
  { id: 'locations', name: 'Add Locations', required: true },
  { id: 'compliance', name: 'Compliance Settings', required: true },
  { id: 'data-retention', name: 'Data Retention', required: false },
  { id: 'staff', name: 'Invite Staff', required: false },
  { id: 'review', name: 'Review & Complete', required: true },
];

/**
 * GET /api/orgs/:orgId/onboarding
 * Get onboarding status
 */
router.get('/:orgId/onboarding', async (req, res) => {
  try {
    const { query } = require('../database/connection');
    
    const result = await query(
      `SELECT onboarding_completed, onboarding_step, settings
       FROM organizations
       WHERE id = $1`,
      [req.params.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const org = result.rows[0];
    const completedSteps = org.settings?.onboarding_steps || [];

    res.json({
      completed: org.onboarding_completed,
      currentStep: org.onboarding_step,
      steps: ONBOARDING_STEPS.map(step => ({
        ...step,
        completed: completedSteps.includes(step.id),
      })),
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orgs/:orgId/onboarding/steps/:stepId
 * Complete an onboarding step
 */
router.post('/:orgId/onboarding/steps/:stepId', async (req, res) => {
  try {
    const { query } = require('../database/connection');
    const { stepId } = req.params;
    const { data } = req.body;

    // Validate step exists
    const step = ONBOARDING_STEPS.find(s => s.id === stepId);
    if (!step) {
      return res.status(400).json({ error: 'Invalid step ID' });
    }

    // Get current settings
    const orgResult = await query(
      'SELECT settings FROM organizations WHERE id = $1',
      [req.params.orgId]
    );

    const settings = orgResult.rows[0]?.settings || {};
    const completedSteps = settings.onboarding_steps || [];

    // Mark step as completed
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }

    // Store step data
    settings.onboarding_steps = completedSteps;
    settings[`onboarding_${stepId}`] = data;

    // Check if all required steps are completed
    const allRequiredComplete = ONBOARDING_STEPS
      .filter(s => s.required)
      .every(s => completedSteps.includes(s.id));

    // Update organization
    await query(
      `UPDATE organizations
       SET settings = $1,
           onboarding_step = $2,
           onboarding_completed = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [JSON.stringify(settings), stepId, allRequiredComplete, req.params.orgId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata
      )
      VALUES ($1, $2, 'ONBOARDING.STEP_COMPLETED', 'Organization', $3, $4, 'success', $5)`,
      [
        req.params.orgId,
        req.orgContext.userId,
        req.params.orgId,
        stepId,
        JSON.stringify({ step: step.name, data }),
      ]
    );

    res.json({
      success: true,
      completed: allRequiredComplete,
      nextStep: getNextStep(stepId, completedSteps),
    });
  } catch (error) {
    console.error('Complete onboarding step error:', error);
    res.status(400).json({ error: error.message });
  }
});

function getNextStep(currentStepId, completedSteps) {
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStepId);
  
  for (let i = currentIndex + 1; i < ONBOARDING_STEPS.length; i++) {
    if (!completedSteps.includes(ONBOARDING_STEPS[i].id)) {
      return ONBOARDING_STEPS[i];
    }
  }
  
  return null;
}

module.exports = router;
```

---

## 4. Password Reset & Account Recovery

### Password Reset Service

**File**: `ehr-api/src/services/auth.service.js`

```javascript
const crypto = require('crypto');
const { query, transaction } = require('../database/connection');
const KeycloakService = require('./keycloak.service');

class AuthService {
  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const userResult = await query(
      'SELECT id, keycloak_user_id, email, name FROM users WHERE email = $1 AND status = \'active\'',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    const user = userResult.rows[0];

    // Create reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await query(
      `INSERT INTO email_verifications (email, token, type, expires_at)
       VALUES ($1, $2, 'password_reset', $3)`,
      [email, token, expiresAt]
    );

    // Send reset email (integrate with your email service)
    await this.sendPasswordResetEmail(email, token, user.name);

    // Audit log
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status
      )
      SELECT ra.org_id, $1, 'AUTH.PASSWORD_RESET_REQUESTED', 'User', $1, $2, 'success'
      FROM role_assignments ra
      WHERE ra.user_id = $1
      LIMIT 1`,
      [user.id, email]
    );

    return { success: true, message: 'Password reset email sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    return await transaction(async (client) => {
      // Verify token
      const tokenResult = await client.query(
        `SELECT ev.*, u.id as user_id, u.keycloak_user_id
         FROM email_verifications ev
         JOIN users u ON ev.email = u.email
         WHERE ev.token = $1 AND ev.type = 'password_reset'
           AND ev.expires_at > CURRENT_TIMESTAMP
           AND ev.verified_at IS NULL`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const verification = tokenResult.rows[0];

      // Reset password in Keycloak
      await KeycloakService.resetPassword(
        verification.keycloak_user_id,
        newPassword,
        false
      );

      // Mark token as used
      await client.query(
        'UPDATE email_verifications SET verified_at = CURRENT_TIMESTAMP WHERE token = $1',
        [token]
      );

      // Force logout all sessions
      await KeycloakService.logoutUser(verification.keycloak_user_id);

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status
        )
        SELECT ra.org_id, $1, 'AUTH.PASSWORD_RESET_COMPLETED', 'User', $1, $2, 'success'
        FROM role_assignments ra
        WHERE ra.user_id = $1
        LIMIT 1`,
        [verification.user_id, verification.email]
      );

      return { success: true, message: 'Password reset successfully' };
    });
  }

  async sendPasswordResetEmail(email, token, name) {
    // Integrate with your email service
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
    
    console.log(`Send password reset email to ${email}:`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Name: ${name}`);
    
    // TODO: Integrate with SendGrid, AWS SES, etc.
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email) {
    const userResult = await query(
      'SELECT keycloak_user_id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return { success: true, message: 'If the email exists, verification has been sent' };
    }

    await KeycloakService.sendVerifyEmail(userResult.rows[0].keycloak_user_id);

    return { success: true, message: 'Verification email sent' };
  }
}

module.exports = new AuthService();
```

---

## 5. Complete Logout Flow

### Enhanced Logout Sequence

**File**: `ehr-web/src/components/logout-button.tsx`

```typescript
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export function LogoutButton() {
  const { data: session } = useSession();
  const [logging out, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!session) return;

    setLoggingOut(true);

    try {
      // Call backend to log the logout event
      await fetch(`/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'user_initiated',
        }),
      });

      // Sign out from NextAuth (which will also call Keycloak logout)
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if backend call fails
      await signOut({ callbackUrl: '/auth/signin' });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
    >
      {loggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

**Backend Logout Route**: `ehr-api/src/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    const { reason } = req.body;

    if (userId && orgId) {
      const { query } = require('../database/connection');
      
      // Log logout event
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata, ip_address, user_agent
        )
        VALUES ($1, $2, 'AUTH.LOGOUT', 'User', $2, 
                (SELECT email FROM users WHERE id = $2),
                'success', $3, $4, $5)`,
        [
          orgId,
          userId,
          JSON.stringify({ reason }),
          req.ip,
          req.headers['user-agent'],
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout logging error:', error);
    // Don't fail logout if logging fails
    res.json({ success: true });
  }
});

module.exports = router;
```

---

Due to length constraints, I'll create a second document with the remaining sections (6-13).
