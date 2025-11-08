#!/bin/bash

# Fix incorrect auth imports in pages

TARGET_DIR="/Users/apple/EHRConnect/EHRConnect/ehr-react/src/pages"

echo "Fixing auth imports in pages..."

# Fix Dashboard.tsx
sed -i '' 's/import { login, logout, useSession } from/import { useAuth } from/g' "$TARGET_DIR/Dashboard.tsx"
sed -i '' 's/useAuth from/useAuth } from/g' "$TARGET_DIR/Dashboard.tsx"

# Fix Home.tsx
sed -i '' 's/import { useSession, login, logout } from/import { useAuth } from/g' "$TARGET_DIR/Home.tsx"

# Fix Onboarding.tsx
sed -i '' 's/import { useSession, logout } from/import { useAuth } from/g' "$TARGET_DIR/Onboarding.tsx"

# Fix all references to login() and logout()
find "$TARGET_DIR" -name "*.tsx" -exec sed -i '' 's/onClick={() => login(/onClick={() => login(/g' {} \;
find "$TARGET_DIR" -name "*.tsx" -exec sed -i '' 's/onClick={() => logout(/onClick={() => logout(/g' {} \;
find "$TARGET_DIR" -name "*.tsx" -exec sed -i '' 's/onClick={login}/onClick={login}/g' {} \;
find "$TARGET_DIR" -name "*.tsx" -exec sed -i '' 's/onClick={logout}/onClick={logout}/g' {} \;

# Fix session references that should be user
find "$TARGET_DIR" -name "*.tsx" -exec sed -i '' 's/!session/!isAuthenticated/g' {} \;
find "$TARGET_DIR" -name "*.tsx" -exec sed -i '' 's/if (session)/if (isAuthenticated \&\& user)/g' {} \;

echo "✓ Fixed auth imports"
