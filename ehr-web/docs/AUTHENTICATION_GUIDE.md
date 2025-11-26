# Authentication Guide - EHRConnect

This guide explains how to use and test the authentication system in EHRConnect.

## Overview

EHRConnect uses **NextAuth.js** with **Keycloak** as the authentication provider, featuring:

- ✅ **Automatic Login/Logout** - Sign In button appears when logged out
- ✅ **User Profile Display** - Shows logged-in user info with name, email, and roles
- ✅ **Custom Keycloak Theme** - Professional healthcare-focused login pages
- ✅ **Role-Based Access** - User roles are available in the session
- ✅ **Secure Sessions** - JWT-based authentication

## Features

### 1. User Profile Component

The `UserProfile` component in the header automatically handles three states:

#### **Unauthenticated** (Not Logged In)
- Shows "Sign In" button
- Clicking opens Keycloak login page with custom theme

#### **Loading**
- Shows loading skeleton while checking authentication

#### **Authenticated** (Logged In)
- Displays user avatar
- Shows user name and primary role
- Dropdown menu with:
  - User email
  - All user roles (badges)
  - Profile button
  - Settings button
  - Sign Out button

## Setup Instructions

### 1. Environment Variables

Create `ehr-web/.env.local` with these variables:

```env
# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client
KEYCLOAK_CLIENT_SECRET=nextjs-secret-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here-min-32-characters
```

> **Generate NEXTAUTH_SECRET**: Run `openssl rand -base64 32` or use any random 32+ character string

### 2. Start Services

```bash
# Start Keycloak (if not running)
docker-compose up -d keycloak

# Start Next.js app
cd ehr-web
npm run dev
```

## Testing Authentication

### Test Flow

1. **Open the App**
   ```
   http://localhost:3000
   ```

2. **Initial State**
   - You should see a "Sign In" button in the header
   - No user information displayed

3. **Click "Sign In"**
   - Redirects to Keycloak login page (with custom EHRConnect theme!)
   - Professional healthcare design
   - Form validation

4. **Login with Test Users**

   **Administrator:**
   - Username: `admin`
   - Password: `admin123`
   - Role: admin

   **Practitioner:**
   - Username: `practitioner`  
   - Password: `doctor123`
   - Role: practitioner

5. **After Login**
   - Redirected back to the app
   - User profile appears in header
   - Shows name, email, and roles

6. **Click User Profile**
   - Opens dropdown menu
   - See all user information:
     - Full name
     - Email address
     - Role badges (admin, practitioner, etc.)
   - Profile and Settings options
   - Sign Out button

7. **Sign Out**
   - Click "Sign Out" in dropdown
   - Returns to home page
   - "Sign In" button appears again

## Using Authentication in Your Code

### 1. Check if User is Logged In

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated' || !session) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
```

### 2. Get User Roles

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function RoleBasedComponent() {
  const { data: session } = useSession();
  const roles = (session as any)?.roles || [];

  const isAdmin = roles.includes('admin');
  const isPractitioner = roles.includes('practitioner');

  return (
    <div>
      {isAdmin && <button>Admin Actions</button>}
      {isPractitioner && <button>Practitioner Actions</button>}
    </div>
  );
}
```

### 3. Programmatic Sign In/Out

```typescript
'use client';

import { signIn, signOut } from 'next-auth/react';

export function AuthButtons() {
  return (
    <div>
      <button onClick={() => signIn('keycloak')}>
        Sign In
      </button>
      
      <button onClick={() => signOut({ callbackUrl: '/' })}>
        Sign Out
      </button>
    </div>
  );
}
```

### 4. Server-Side Authentication

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div>
      <h1>Welcome to Dashboard, {session.user?.name}</h1>
      <p>Roles: {(session as any).roles?.join(', ')}</p>
    </div>
  );
}
```

### 5. API Route Protection

```typescript
// app/api/protected/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'Protected data',
    user: session.user,
  });
}
```

## Session Data Structure

The session object contains:

```typescript
{
  user: {
    name: string,      // User's full name
    email: string,     // User's email
    image?: string     // User's profile image (optional)
  },
  roles: string[],     // Array of user roles
  accessToken: string, // Keycloak access token
  refreshToken: string,// Keycloak refresh token
  fhirUser?: string,   // FHIR user reference
  expires: string      // Session expiry time
}
```

## Troubleshooting

### "Sign In" button not working

**Check:**
1. Keycloak is running: `docker ps | grep keycloak`
2. Environment variables are set correctly
3. `NEXTAUTH_URL` matches your app URL

**Solution:**
```bash
# Restart Keycloak
docker-compose restart keycloak

# Check Keycloak logs
docker logs ehrconnect-keycloak-1
```

### Redirects to wrong URL after login

**Check:** `NEXTAUTH_URL` in `.env.local`

**Should be:**
```env
NEXTAUTH_URL=http://localhost:3000
```

### Session not persisting

**Check:** `NEXTAUTH_SECRET` is set and at least 32 characters

**Generate new secret:**
```bash
openssl rand -base64 32
```

### Custom theme not showing

**Verify:**
```bash
# Check theme is built and deployed
ls -la keycloak/themes/

# Restart Keycloak
docker-compose restart keycloak

# Check logs
docker logs ehrconnect-keycloak-1 | grep ehrconnect
```

## Advanced Features

### Refresh Token Rotation

NextAuth automatically handles token refresh. Tokens are refreshed when:
- Access token expires
- User makes a request requiring authentication

### Session Management

Sessions are stored using JWT strategy:
- No database required for sessions
- Stateless authentication
- Automatic token refresh

### Role-Based Permissions

You can create middleware to protect routes based on roles:

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Protect admin routes
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.roles?.includes('admin') ?? false;
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/patients/:path*'],
};
```

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use strong NEXTAUTH_SECRET** - Minimum 32 characters
3. **Enable HTTPS in production** - Required for secure cookies
4. **Rotate secrets regularly** - Change secrets periodically
5. **Validate roles server-side** - Don't trust client-side role checks

## Testing Checklist

- [ ] Unauthenticated state shows "Sign In" button
- [ ] Clicking "Sign In" redirects to Keycloak
- [ ] Custom theme appears on Keycloak pages
- [ ] Can login with admin credentials
- [ ] After login, user profile shows in header
- [ ] User name and email are displayed
- [ ] User roles appear as badges
- [ ] Dropdown menu works
- [ ] "Sign Out" logs out successfully
- [ ] Returns to "Sign In" button after logout
- [ ] Session persists on page refresh
- [ ] Protected routes redirect to login

## Next Steps

1. **Test the authentication** - Follow the test flow above
2. **Add protected routes** - Secure sensitive pages
3. **Implement role-based UI** - Show/hide features based on roles
4. **Add profile management** - Let users edit their profile
5. **Enable 2FA** - Add two-factor authentication in Keycloak

## Resources

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Keycloak Docs](https://www.keycloak.org/documentation)
- [Custom Keycloak Theme Guide](./keycloak-theme/EHRCONNECT_README.md)

---

**Ready to test!** Start the app and click "Sign In" to see the custom Keycloak theme and authentication in action.
