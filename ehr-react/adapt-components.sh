#!/bin/bash

# Script to automatically adapt Next.js components for React + Vite

echo "Adapting components for React + Vite..."

TARGET_DIR="src"

# Remove 'use client' directives
echo "Removing 'use client' directives..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "/^'use client'$/d" {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' '/^"use client"$/d' {} \;

# Replace next/navigation imports with react-router-dom
echo "Replacing next/navigation with react-router-dom..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/from 'next\/navigation'/from 'react-router-dom'/g" {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/from "next\/navigation"/from "react-router-dom"/g' {} \;

# Replace useRouter with useNavigate
echo "Replacing useRouter with useNavigate..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/const router = useRouter()/const navigate = useNavigate()/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/router\.push(/navigate(/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/router\.replace(/navigate(/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/router\.back()/navigate(-1)/g' {} \;

# Replace next-auth imports
echo "Replacing next-auth with AuthContext..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/from 'next-auth\/react'/from '@\/contexts\/AuthContext'/g" {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/from "next-auth\/react"/from "@\/contexts\/AuthContext"/g' {} \;

# Replace useSession with useAuth
echo "Replacing useSession with useAuth..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/const { data: session, status } = useSession()/const { user, isAuthenticated, isLoading, token } = useAuth()/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/const { data: session } = useSession()/const { user, isAuthenticated, token } = useAuth()/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/session\.user/user/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/session\.accessToken/token/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/signIn/login/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/signOut/logout/g' {} \;

# Replace environment variables
echo "Replacing environment variables..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/process\.env\.NEXT_PUBLIC_/import.meta.env.VITE_/g' {} \;

# Remove next/image imports
echo "Removing next/image imports..."
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "/import.*from.*'next\/image'/d" {} \;
find "$TARGET_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' '/import.*from.*"next\/image"/d' {} \;

echo "Component adaptation complete!"
echo ""
echo "Manual review still required for:"
echo "1. Image components (replace <Image> with <img>)"
echo "2. Link components (use react-router-dom <Link>)"
echo "3. Session status checks (status === 'authenticated' → isAuthenticated)"
echo "4. Session loading checks (status === 'loading' → isLoading)"
echo "5. Complex routing logic"
echo "6. API calls that need updating"
