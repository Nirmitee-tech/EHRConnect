# Complete the React Migration - Step-by-Step Instructions

## Current Status

✅ **COMPLETED:**
- New React + Vite project created
- All dependencies installed
- Tailwind CSS configured
- Keycloak authentication setup
- All components copied and automatically adapted
- API client with auth configured
- Migration scripts created

⏳ **REMAINING:**
- Create page components from Next.js pages
- Configure routes in App.tsx
- Move API routes to backend
- Test everything

## Step 1: Create .env File

```bash
cd ehr-react
cp .env.example .env
```

Edit `.env`:
```bash
VITE_API_URL=http://localhost:8000
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=ehrconnect
VITE_KEYCLOAK_CLIENT_ID=ehr-web
VITE_MEDPLUM_BASE_URL=http://localhost:8103
```

## Step 2: Create the Most Important Page Components

These are the core pages needed to get started. Create them in `ehr-react/src/pages/`:

### pages/Login.tsx
```typescript
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (!isLoading) {
      login();
    }
  }, [isAuthenticated, isLoading, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
```

### pages/Dashboard.tsx
Copy from `ehr-web/src/app/dashboard/page.tsx`, but:
- Remove `'use client'`
- Already adapted by script (useSession → useAuth)
- Wrap with AuthenticatedLayout if not already

### pages/Patients.tsx
Copy from `ehr-web/src/app/patients/page.tsx`

### pages/Appointments.tsx
Copy from `ehr-web/src/app/appointments/page.tsx`

Continue for all pages...

## Step 3: Update App.tsx with Core Routes

```typescript
// ehr-react/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FacilityProvider } from './contexts/facility-context';
import { TabProvider } from './contexts/tab-context';
import ProtectedRoute from './components/permissions/ProtectedRoute';
import { AuthenticatedLayout } from './components/layout/authenticated-layout';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';

function App() {
  return (
    <AuthProvider>
      <FacilityProvider>
        <TabProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <Patients />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </TabProvider>
      </FacilityProvider>
    </AuthProvider>
  );
}

export default App;
```

## Step 4: Update main.tsx

```typescript
// ehr-react/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## Step 5: Add Backend API Routes (if needed)

If the frontend was using Next.js API routes, add them to backend:

### FHIR Proxy (ehr-api/src/routes/fhir.js)
```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.all('/*', authenticateToken, async (req, res) => {
  try {
    const medplumUrl = process.env.MEDPLUM_BASE_URL || 'http://localhost:8103';
    const path = req.params[0];

    const response = await axios({
      method: req.method,
      url: `${medplumUrl}/${path}`,
      headers: {
        ...req.headers,
        Authorization: req.headers.authorization,
        'Content-Type': 'application/fhir+json',
        host: undefined,
      },
      data: req.body,
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'FHIR proxy error' }
    );
  }
});

module.exports = router;
```

### Register route in ehr-api/src/index.js
```javascript
const fhirRouter = require('./routes/fhir');
app.use('/fhir', fhirRouter);
```

## Step 6: Start Development

```bash
# Terminal 1: Backend
cd ehr-api
npm run dev

# Terminal 2: Frontend
cd ehr-react
npm run dev
```

Visit `http://localhost:3000`

## Step 7: Testing Checklist

- [ ] App loads without errors
- [ ] Redirects to Keycloak login
- [ ] Can log in successfully
- [ ] Token is present in network requests
- [ ] Dashboard loads
- [ ] Can navigate between pages
- [ ] API calls work
- [ ] Role permissions work

## Step 8: Progressive Page Creation

Don't try to create all 40+ pages at once. Start with the core pages and add more as needed:

**Priority 1 (Must Have):**
- Login
- Dashboard
- Patients (list, detail, edit, new)
- Appointments

**Priority 2 (Important):**
- Billing
- Encounters
- Admin
- Settings

**Priority 3 (Nice to Have):**
- All other pages

For each page:
1. Copy from `ehr-web/src/app/.../page.tsx`
2. Remove `'use client'` (already done by script)
3. Check that useSession → useAuth (done by script)
4. Wrap with AuthenticatedLayout if needed
5. Add route to App.tsx
6. Test

## Common Issues & Solutions

### Issue: "Cannot find module '@/...'"
**Solution:** The path alias is configured. Make sure you're running from ehr-react directory.

### Issue: Keycloak redirects infinitely
**Solution:** Check that `ProtectedRoute` is not causing loops. The Login page should NOT be wrapped with ProtectedRoute.

### Issue: API calls return 401
**Solution:**
- Check that token is in headers (inspect Network tab)
- Verify backend auth middleware
- Check that token hasn't expired

### Issue: Components import errors
**Solution:** Some components may have import paths that need adjustment. Update them to use `@/` aliases.

## Quick Reference

### Convert a Next.js Page to React Page

**Before (Next.js):**
```typescript
'use client'

export default function PatientPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();

  if (!session) return null;

  return <div>Patient {params.id}</div>;
}
```

**After (React + Vite):**
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

export default function Patient() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const params = useParams();

  if (!isAuthenticated) return null;

  return (
    <AuthenticatedLayout>
      <div>Patient {params.id}</div>
    </AuthenticatedLayout>
  );
}
```

## Summary

**Time estimate:** 6-10 hours to complete
**Difficulty:** Medium (mostly copy-paste and route configuration)
**Status:** 60% complete (foundation is solid)

The hardest parts are done:
- ✅ Project setup
- ✅ Authentication
- ✅ Component migration
- ✅ Automatic adaptation

What remains is straightforward:
- Copy pages from app/ to pages/
- Add routes to App.tsx
- Test and fix issues

You've got this! 🚀
