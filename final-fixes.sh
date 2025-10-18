#!/bin/bash

TARGET="/Users/apple/EHRConnect/EHRConnect/ehr-react/src/pages"

echo "Applying final fixes to all pages..."

# Fix Dashboard - add missing variables and fix issues
sed -i '' 's/const { user, isAuthenticated, isLoading, token } = useAuth()/const { user, isAuthenticated, isLoading, token, login, logout } = useAuth()/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/user?.realm_access?.roles\.map/user?.realm_access?.roles?.map/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/const roleLevel = useMemo(() => deriveRoleLevel(session)/const roleLevel = useMemo(() => deriveRoleLevel(user)/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/function deriveRoleLevel(session:/function deriveRoleLevel(user:/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/const roles = Array.isArray(session?.roles)/const roles = Array.isArray(user?.realm_access?.roles)/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/const permissions = Array.isArray(session?.permissions)/const permissions = Array.isArray(user?.permissions)/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/const orgId = session?.org_id/const orgId = user?.org_id/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/if (session?.accessToken)/if (token)/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/}, \[session, orgId\])/}, [token, orgId])/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/if (userId)/if (user?.sub)/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/headers\.set(.x-user-id., userId)/headers.set("x-user-id", user?.sub || "")/g' "$TARGET/Dashboard.tsx"
sed -i '' 's/}, \[session,/}, [isAuthenticated,/g' "$TARGET/Dashboard.tsx"

# Fix Home page
sed -i '' 's/const { user, isAuthenticated, token } = useAuth()/const { user, isAuthenticated, isLoading, login, logout } = useAuth()/g' "$TARGET/Home.tsx"
sed -i '' 's/if (isAuthenticated && isAuthenticated)/if (isAuthenticated)/g' "$TARGET/Home.tsx"
sed -i '' 's/navigate(.\/dashboard.)/navigate("\/dashboard")/g' "$TARGET/Home.tsx"

# Fix Onboarding page  
sed -i '' 's/const { user, isAuthenticated, token } = useAuth()/const { user, isAuthenticated, isLoading, token, logout } = useAuth()/g' "$TARGET/Onboarding.tsx"
sed -i '' 's/if (isLoading === .unauthenticated.)/if (!isAuthenticated \&\& !isLoading)/g' "$TARGET/Onboarding.tsx"
sed -i '' 's/navigate(.\/./navigate("\//g' "$TARGET/Onboarding.tsx"

# Fix Register page
sed -i '' 's/window\.location\.href = .\/api\/auth\/login./login()/g' "$TARGET/Register.tsx"

echo "✓ Applied all fixes!"
