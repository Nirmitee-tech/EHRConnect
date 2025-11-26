#!/bin/bash

# Create dynamic route pages

TARGET_DIR="/Users/apple/EHRConnect/EHRConnect/ehr-react/src/pages"
SOURCE_DIR="/Users/apple/EHRConnect/EHRConnect/ehr-web/src/app"

# Patient Detail
if [ -f "$SOURCE_DIR/patients/[id]/page.tsx" ]; then
    cp "$SOURCE_DIR/patients/[id]/page.tsx" "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' "/^'use client'/d" "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' "s/useSession/useAuth/g" "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' "s/from 'next-auth\/react'/from '@\/contexts\/AuthContext'/g" "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' "s/from 'next\/navigation'/from 'react-router-dom'/g" "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/const router = useRouter()/const navigate = useNavigate()/g' "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/router\.push(/navigate(/g' "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/router\.back()/navigate(-1)/g' "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/process\.env\.NEXT_PUBLIC_/import.meta.env.VITE_/g' "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/session\.user/user/g' "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/session\.accessToken/token/g' "$TARGET_DIR/PatientDetail.tsx"
    sed -i '' 's/const { data: session/const { user, token/g' "$TARGET_DIR/PatientDetail.tsx"
    echo "✓ Created PatientDetail.tsx"
fi

# Patient Edit
if [ -f "$SOURCE_DIR/patients/[id]/edit/page.tsx" ]; then
    cp "$SOURCE_DIR/patients/[id]/edit/page.tsx" "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' "/^'use client'/d" "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' "s/useSession/useAuth/g" "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' "s/from 'next-auth\/react'/from '@\/contexts\/AuthContext'/g" "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' "s/from 'next\/navigation'/from 'react-router-dom'/g" "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' 's/const router = useRouter()/const navigate = useNavigate()/g' "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' 's/router\.push(/navigate(/g' "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' 's/process\.env\.NEXT_PUBLIC_/import.meta.env.VITE_/g' "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' 's/session\.user/user/g' "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' 's/session\.accessToken/token/g' "$TARGET_DIR/PatientEdit.tsx"
    sed -i '' 's/const { data: session/const { user, token/g' "$TARGET_DIR/PatientEdit.tsx"
    echo "✓ Created PatientEdit.tsx"
fi

# Encounter Detail
if [ -f "$SOURCE_DIR/encounters/[id]/page.tsx" ]; then
    cp "$SOURCE_DIR/encounters/[id]/page.tsx" "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' "/^'use client'/d" "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' "s/useSession/useAuth/g" "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' "s/from 'next-auth\/react'/from '@\/contexts\/AuthContext'/g" "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' "s/from 'next\/navigation'/from 'react-router-dom'/g" "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' 's/const router = useRouter()/const navigate = useNavigate()/g' "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' 's/router\.push(/navigate(/g' "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' 's/process\.env\.NEXT_PUBLIC_/import.meta.env.VITE_/g' "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' 's/session\.user/user/g' "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' 's/session\.accessToken/token/g' "$TARGET_DIR/EncounterDetail.tsx"
    sed -i '' 's/const { data: session/const { user, token/g' "$TARGET_DIR/EncounterDetail.tsx"
    echo "✓ Created EncounterDetail.tsx"
fi

# Accept Invitation
if [ -f "$SOURCE_DIR/accept-invitation/[token]/page.tsx" ]; then
    cp "$SOURCE_DIR/accept-invitation/[token]/page.tsx" "$TARGET_DIR/AcceptInvitation.tsx"
    sed -i '' "/^'use client'/d" "$TARGET_DIR/AcceptInvitation.tsx"
    sed -i '' "s/from 'next\/navigation'/from 'react-router-dom'/g" "$TARGET_DIR/AcceptInvitation.tsx"
    sed -i '' 's/const router = useRouter()/const navigate = useNavigate()/g' "$TARGET_DIR/AcceptInvitation.tsx"
    sed -i '' 's/router\.push(/navigate(/g' "$TARGET_DIR/AcceptInvitation.tsx"
    sed -i '' 's/process\.env\.NEXT_PUBLIC_/import.meta.env.VITE_/g' "$TARGET_DIR/AcceptInvitation.tsx"
    echo "✓ Created AcceptInvitation.tsx"
fi

echo "✓ Dynamic pages created!"
ls -1 "$TARGET_DIR"/*.tsx | wc -l | xargs echo "Total pages:"
