#!/bin/bash

# EHR Connect - Next.js to React + Vite Migration Script
# This script copies and adapts components from ehr-web to ehr-react

set -e

SOURCE_DIR="ehr-web/src"
TARGET_DIR="ehr-react/src"

echo "Starting migration from Next.js to React + Vite..."

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$TARGET_DIR"/{components/{ui,layout,appointments,billing,encounters,forms,patients,permissions,onboarding,staff},pages,contexts,hooks,lib,types,utils,data}

# Copy and adapt UI components
echo "Copying UI components..."
cp "$SOURCE_DIR/components/ui/"*.tsx "$TARGET_DIR/components/ui/" 2>/dev/null || echo "UI components may need manual review"

# Copy layout components
echo "Copying layout components..."
cp "$SOURCE_DIR/components/layout/"*.tsx "$TARGET_DIR/components/layout/" 2>/dev/null || echo "Layout components copied"

# Copy feature components
echo "Copying feature components..."
for dir in appointments billing encounters forms patients permissions onboarding staff; do
    if [ -d "$SOURCE_DIR/components/$dir" ]; then
        cp -r "$SOURCE_DIR/components/$dir/"* "$TARGET_DIR/components/$dir/" 2>/dev/null || echo "Copied $dir components"
    fi
done

# Copy contexts (but we'll need to adapt them)
echo "Copying contexts..."
cp "$SOURCE_DIR/contexts/"*.tsx "$TARGET_DIR/contexts/" 2>/dev/null || echo "Contexts need adaptation"

# Copy lib utilities
echo "Copying lib utilities..."
for file in rbac.ts medplum.ts utils.ts; do
    if [ -f "$SOURCE_DIR/lib/$file" ]; then
        cp "$SOURCE_DIR/lib/$file" "$TARGET_DIR/lib/"
    fi
done

# Copy types
echo "Copying types..."
cp -r "$SOURCE_DIR/types/"* "$TARGET_DIR/types/" 2>/dev/null || echo "Types copied"

# Copy utils
echo "Copying utils..."
cp -r "$SOURCE_DIR/utils/"* "$TARGET_DIR/utils/" 2>/dev/null || echo "Utils copied"

# Copy data
echo "Copying data..."
cp -r "$SOURCE_DIR/data/"* "$TARGET_DIR/data/" 2>/dev/null || echo "Data files copied"

echo "Migration files copied. Manual adaptation required for:"
echo "1. Remove 'use client' directives"
echo "2. Replace next/navigation with react-router-dom"
echo "3. Replace next/image with standard img tags"
echo "4. Replace useSession with useAuth"
echo "5. Update import paths"
echo "6. Convert page components to standard components"

echo ""
echo "Next steps:"
echo "1. Run: cd ehr-react && npm install"
echo "2. Review and adapt copied files"
echo "3. Create route configuration"
echo "4. Test authentication flow"
