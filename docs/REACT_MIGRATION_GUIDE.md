# EHR Connect: Next.js to React + Vite Migration Guide

## Overview

This guide documents the complete migration from Next.js to React + Vite for the EHR Connect frontend application.

## Migration Status

### ✅ Completed
1. New React + Vite project created at `ehr-react/`
2. Tailwind CSS configured with EHR theme
3. TypeScript configuration with path aliases (@/)
4. Keycloak authentication setup
5. API client with automatic token refresh
6. Base project structure created
7. All source files copied from ehr-web to ehr-react

### 🔄 In Progress
1. Adapting components for React Router
2. Removing Next.js-specific code
3. Creating page components from Next.js pages

### ⏳ Pending
1. Testing authentication flow
2. Testing all application features
3. Building and deploying

## Project Structure

```
ehr-react/
├── src/
│   ├── components/          # All components copied from ehr-web
│   │   ├── ui/             # Base UI components
│   │   ├── layout/         # Layout components (sidebar, header, etc.)
│   │   ├── appointments/   # Appointment-related components
│   │   ├── billing/        # Billing components
│   │   ├── encounters/     # Clinical encounter components
│   │   ├── forms/          # Form components
│   │   ├── patients/       # Patient management components
│   │   ├── permissions/    # RBAC components
│   │   └── ...
│   ├── pages/              # Page components (to be created from app/)
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility libraries
│   │   ├── keycloak.ts    # Keycloak setup
│   │   ├── api.ts         # API client
│   │   ├── utils.ts       # Utilities
│   │   ├── rbac.ts        # RBAC logic
│   │   └── medplum.ts     # Medplum/FHIR client
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── data/               # Static data
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Changes

### 1. Authentication: NextAuth → Keycloak

**Before (Next.js):**
```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

const { data: session, status } = useSession();
```

**After (React + Vite):**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { isAuthenticated, user, login, logout, token } = useAuth();
```

### 2. Routing: Next.js App Router → React Router

**Before (Next.js):**
```typescript
// File-based routing in app/ directory
// app/patients/page.tsx → /patients
// app/patients/[id]/page.tsx → /patients/:id

import { useRouter, useParams } from 'next/navigation';
```

**After (React + Vite):**
```typescript
// Route configuration in App.tsx
<Route path="/patients" element={<Patients />} />
<Route path="/patients/:id" element={<PatientDetail />} />

import { useNavigate, useParams } from 'react-router-dom';
```

### 3. API Calls: Next.js API Routes → Backend API

**Before (Next.js):**
```typescript
// app/api/patients/route.ts - Server-side API route
export async function GET(request: Request) {
  // Handler logic
}

// Client-side call
const response = await fetch('/api/patients');
```

**After (React + Vite):**
```typescript
// All API calls go to backend (ehr-api)
import apiClient from '@/lib/api';

const response = await apiClient.get('/api/patients');
```

### 4. Images: next/image → Standard img

**Before (Next.js):**
```typescript
import Image from 'next/image';

<Image src="/logo.png" alt="Logo" width={100} height={100} />
```

**After (React + Vite):**
```typescript
<img src="/logo.png" alt="Logo" className="w-[100px] h-[100px]" />
```

### 5. Environment Variables

**Before (Next.js):**
```
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_KEYCLOAK_URL=...
```

**After (React + Vite):**
```
VITE_API_URL=...
VITE_KEYCLOAK_URL=...
```

**Access in code:**
```typescript
// Before
process.env.NEXT_PUBLIC_API_URL

// After
import.meta.env.VITE_API_URL
```

## Step-by-Step Migration Process

### Phase 1: Setup (✅ Completed)

1. Created new Vite project with React + TypeScript
2. Installed all dependencies
3. Configured Tailwind CSS
4. Set up path aliases
5. Created Keycloak authentication
6. Created API client
7. Copied all components, utilities, types

### Phase 2: Component Adaptation (In Progress)

Run the automated adaptation script:

```bash
# This script will:
# 1. Remove 'use client' directives
# 2. Replace next/* imports with react-router-dom
# 3. Replace useSession with useAuth
# 4. Update environment variable access
# 5. Remove next/image imports

node scripts/adapt-components.js
```

Or manually adapt each component:

1. Remove `'use client'` directive
2. Replace `useSession()` with `useAuth()`
3. Replace `useRouter()` from next/navigation with `useNavigate()` from react-router-dom
4. Replace `useParams()` from next/navigation with `useParams()` from react-router-dom
5. Replace `useSearchParams()` with React Router equivalents
6. Replace `next/image` with standard `<img>` tags
7. Update environment variables: `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`

### Phase 3: Create Page Components

Convert Next.js pages to React components:

```bash
# Create page components from app/ directory
# app/dashboard/page.tsx → pages/Dashboard.tsx
# app/patients/page.tsx → pages/Patients.tsx
# etc.
```

Example conversion:

**Before (`app/dashboard/page.tsx`):**
```typescript
'use client'

export default function DashboardPage() {
  const { data: session } = useSession();
  // Component logic
  return <div>Dashboard</div>;
}
```

**After (`pages/Dashboard.tsx`):**
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // Will be redirected by ProtectedRoute
  }

  // Component logic
  return (
    <AuthenticatedLayout>
      <div>Dashboard</div>
    </AuthenticatedLayout>
  );
}
```

### Phase 4: Migrate API Routes to Backend

All Next.js API routes need to be moved to the backend (ehr-api):

1. **NextAuth route (`app/api/auth/[...nextauth]/route.ts`)**
   - ✅ No longer needed (using direct Keycloak integration)

2. **FHIR proxy (`app/api/fhir/[...path]/route.ts`)**
   - Move to backend: `ehr-api/src/routes/fhir-proxy.js`

3. **Appointment types (`app/api/appointment-types/route.ts`)**
   - Move to backend: `ehr-api/src/routes/appointment-types.js`

### Phase 5: Update Routing

Configure all routes in `App.tsx`:

```typescript
<Routes>
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
  <Route path="/patients/new" element={<ProtectedRoute><PatientNew /></ProtectedRoute>} />
  <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
  <Route path="/patients/:id/edit" element={<ProtectedRoute><PatientEdit /></ProtectedRoute>} />
  // ... all other routes
</Routes>
```

## Backend API Migration

### Routes to Add/Update in ehr-api:

1. **FHIR Proxy** (`src/routes/fhir-proxy.js`)
```javascript
router.all('/fhir/*', authenticateToken, async (req, res) => {
  const path = req.params[0];
  const medplumUrl = process.env.MEDPLUM_BASE_URL;

  try {
    const response = await axios({
      method: req.method,
      url: `${medplumUrl}/${path}`,
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/fhir+json',
      },
      data: req.body,
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Proxy error' });
  }
});
```

2. **Appointment Types** (`src/routes/appointment-types.js`)
```javascript
router.get('/appointment-types', authenticateToken, async (req, res) => {
  try {
    const orgId = req.headers['x-org-id'];
    const types = await db.query(
      'SELECT * FROM appointment_types WHERE org_id = $1',
      [orgId]
    );
    res.json(types.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Environment Setup

### ehr-react/.env
```bash
VITE_API_URL=http://localhost:8000
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=ehrconnect
VITE_KEYCLOAK_CLIENT_ID=ehr-web
VITE_MEDPLUM_BASE_URL=http://localhost:8103
```

## Running the Application

### Development

1. Start the backend:
```bash
cd ehr-api
npm run dev
```

2. Start Keycloak (if not running):
```bash
docker-compose up keycloak postgres -d
```

3. Start Medplum (if not running):
```bash
cd medplum
docker-compose up -d
```

4. Start the React app:
```bash
cd ehr-react
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
cd ehr-react
npm run build
```

The build output will be in `ehr-react/dist/`.

Serve with:
```bash
npm run preview
```

Or deploy to any static hosting (Vercel, Netlify, S3, etc.).

## Testing Checklist

- [ ] Keycloak login works
- [ ] Token refresh works automatically
- [ ] Protected routes redirect to login
- [ ] Dashboard loads with user data
- [ ] Patient list loads
- [ ] Patient detail view works
- [ ] Patient creation works
- [ ] Appointments calendar works
- [ ] Billing module works
- [ ] Admin panel works (if admin user)
- [ ] Role-based permissions work
- [ ] Multi-tenant org switching works
- [ ] All API calls use correct headers (org-id, user-id, auth token)

## Troubleshooting

### Authentication Issues

1. **Token not being sent:**
   - Check that `apiClient` from `@/lib/api` is being used
   - Verify token is present: `console.log(keycloak.token)`

2. **Infinite redirect loop:**
   - Check `ProtectedRoute` logic
   - Verify Keycloak initialization

3. **CORS errors:**
   - Update ehr-api CORS configuration to allow `http://localhost:3000`

### Routing Issues

1. **404 on refresh:**
   - Configure server to serve `index.html` for all routes
   - Or use hash router: `<HashRouter>` instead of `<BrowserRouter>`

2. **Links not working:**
   - Use `<Link to="...">` from react-router-dom, not `<a href>`
   - Use `navigate()` instead of `router.push()`

## Performance Optimizations

1. **Code splitting:**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

2. **API caching with SWR:**
```typescript
import useSWR from 'swr';

const fetcher = (url) => apiClient.get(url).then(res => res.data);
const { data, error } = useSWR('/api/patients', fetcher);
```

## Next Steps

1. ✅ Complete component adaptation
2. ✅ Create all page components
3. ✅ Move API routes to backend
4. ✅ Test authentication flow
5. ✅ Test all features
6. Build production version
7. Deploy to hosting platform
8. Update documentation
9. Archive/deprecate ehr-web (Next.js version)

## Conclusion

This migration moves from Next.js SSR framework to a pure SPA with React + Vite, which:

✅ **Pros:**
- Simpler architecture (no server-side rendering complexity)
- Faster development builds (Vite)
- Direct Keycloak integration (no NextAuth layer)
- Clear separation between frontend and backend
- Easier to deploy (static files)

⚠️ **Cons:**
- No SSR/SSG (all client-side rendering)
- Initial load might be slower
- SEO requires additional setup (if needed)

For an internal EHR system, the SPA approach is ideal as SEO is not a concern and all users are authenticated.
