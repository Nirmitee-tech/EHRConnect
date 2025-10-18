#!/bin/bash

# Script to convert all Next.js page files to React page components

set -e

SOURCE_DIR="/Users/apple/EHRConnect/EHRConnect/ehr-web/src/app"
TARGET_DIR="/Users/apple/EHRConnect/EHRConnect/ehr-react/src/pages"

echo "Creating all page components from Next.js pages..."

# Create pages directory
mkdir -p "$TARGET_DIR"

# Function to convert a Next.js page to React page
convert_page() {
    local source_file="$1"
    local page_name="$2"
    local target_file="$TARGET_DIR/$page_name.tsx"

    echo "Converting $source_file to $target_file..."

    # Copy the file
    cp "$source_file" "$target_file"

    # Remove 'use client' directive
    sed -i '' "/^'use client'/d" "$target_file"
    sed -i '' '/^"use client"/d' "$target_file"

    # Replace next-auth imports
    sed -i '' "s/from 'next-auth\/react'/from '@\/contexts\/AuthContext'/g" "$target_file"
    sed -i '' 's/from "next-auth\/react"/from "@\/contexts\/AuthContext"/g' "$target_file"

    # Replace useSession with useAuth
    sed -i '' 's/const { data: session, status } = useSession()/const { user, isAuthenticated, isLoading, token } = useAuth()/g' "$target_file"
    sed -i '' 's/const { data: session } = useSession()/const { user, isAuthenticated, token } = useAuth()/g' "$target_file"

    # Replace session references
    sed -i '' 's/session\.user/user/g' "$target_file"
    sed -i '' 's/session\.accessToken/token/g' "$target_file"
    sed -i '' 's/session\.org_id/user?.org_id/g' "$target_file"
    sed -i '' 's/session\.roles/user?.realm_access?.roles/g' "$target_file"
    sed -i '' 's/status === .authenticated./isAuthenticated/g' "$target_file"
    sed -i '' 's/status === .loading./isLoading/g' "$target_file"
    sed -i '' 's/status === .unauthenticated./!isAuthenticated/g' "$target_file"

    # Replace signIn and signOut
    sed -i '' 's/signIn/login/g' "$target_file"
    sed -i '' 's/signOut/logout/g' "$target_file"

    # Replace next/navigation with react-router-dom
    sed -i '' "s/from 'next\/navigation'/from 'react-router-dom'/g" "$target_file"
    sed -i '' 's/from "next\/navigation"/from "react-router-dom"/g' "$target_file"

    # Replace router
    sed -i '' 's/const router = useRouter()/const navigate = useNavigate()/g' "$target_file"
    sed -i '' 's/router\.push(/navigate(/g' "$target_file"
    sed -i '' 's/router\.replace(/navigate(/g' "$target_file"
    sed -i '' 's/router\.back()/navigate(-1)/g' "$target_file"

    # Replace environment variables
    sed -i '' 's/process\.env\.NEXT_PUBLIC_/import.meta.env.VITE_/g' "$target_file"

    # Remove next/image imports
    sed -i '' "/import.*from.*'next\/image'/d" "$target_file"
    sed -i '' '/import.*from.*"next\/image"/d' "$target_file"

    echo "✓ Created $page_name.tsx"
}

# Convert main pages
echo "Converting main pages..."
convert_page "$SOURCE_DIR/page.tsx" "Home"
convert_page "$SOURCE_DIR/dashboard/page.tsx" "Dashboard"
convert_page "$SOURCE_DIR/register/page.tsx" "Register"
convert_page "$SOURCE_DIR/onboarding/page.tsx" "Onboarding"

# Convert patient pages
echo "Converting patient pages..."
if [ -f "$SOURCE_DIR/patients/page.tsx" ]; then
    convert_page "$SOURCE_DIR/patients/page.tsx" "Patients"
fi
if [ -f "$SOURCE_DIR/patients/new/page.tsx" ]; then
    convert_page "$SOURCE_DIR/patients/new/page.tsx" "PatientNew"
fi

# Convert appointments page
echo "Converting appointments page..."
if [ -f "$SOURCE_DIR/appointments/page.tsx" ]; then
    convert_page "$SOURCE_DIR/appointments/page.tsx" "Appointments"
fi

# Convert billing pages
echo "Converting billing pages..."
if [ -f "$SOURCE_DIR/billing/page.tsx" ]; then
    convert_page "$SOURCE_DIR/billing/page.tsx" "Billing"
fi

# Convert admin pages
echo "Converting admin pages..."
if [ -f "$SOURCE_DIR/admin/page.tsx" ]; then
    convert_page "$SOURCE_DIR/admin/page.tsx" "Admin"
fi

# Convert settings page
echo "Converting settings page..."
if [ -f "$SOURCE_DIR/settings/page.tsx" ]; then
    convert_page "$SOURCE_DIR/settings/page.tsx" "Settings"
fi

# Convert staff page
echo "Converting staff page..."
if [ -f "$SOURCE_DIR/staff/page.tsx" ]; then
    convert_page "$SOURCE_DIR/staff/page.tsx" "Staff"
fi

# Convert users page
echo "Converting users page..."
if [ -f "$SOURCE_DIR/users/page.tsx" ]; then
    convert_page "$SOURCE_DIR/users/page.tsx" "Users"
fi

# Convert roles page
echo "Converting roles page..."
if [ -f "$SOURCE_DIR/roles/page.tsx" ]; then
    convert_page "$SOURCE_DIR/roles/page.tsx" "Roles"
fi

# Convert inventory page
echo "Converting inventory page..."
if [ -f "$SOURCE_DIR/inventory/page.tsx" ]; then
    convert_page "$SOURCE_DIR/inventory/page.tsx" "Inventory"
fi

# Convert medical codes page
echo "Converting medical codes page..."
if [ -f "$SOURCE_DIR/medical-codes/page.tsx" ]; then
    convert_page "$SOURCE_DIR/medical-codes/page.tsx" "MedicalCodes"
fi

# Convert audit logs page
echo "Converting audit logs page..."
if [ -f "$SOURCE_DIR/audit-logs/page.tsx" ]; then
    convert_page "$SOURCE_DIR/audit-logs/page.tsx" "AuditLogs"
fi

echo ""
echo "✓ Page conversion complete!"
echo "✓ Pages created in: $TARGET_DIR"
echo ""
echo "Created pages:"
ls -1 "$TARGET_DIR"
echo ""
echo "Next steps:"
echo "1. Review the generated pages"
echo "2. Create dynamic route pages (with :id parameters)"
echo "3. Update App.tsx with routing configuration"
