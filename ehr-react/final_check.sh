#!/bin/bash
echo "=== Final Migration Verification ==="
echo ""
echo "Component Directories:"
ls -d src/components/*/ | wc -l | xargs echo "Total directories:"
echo ""
echo "Next.js Imports:"
grep -r "from ['\"]next/" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | xargs echo "Count:"
echo ""
echo "Design System Imports:"
grep -r "@nirmitee.io/design-system" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "src/components/ui" | wc -l | xargs echo "Count:"
echo ""
echo "Total TypeScript Files:"
find src -name "*.ts" -o -name "*.tsx" | wc -l | xargs
