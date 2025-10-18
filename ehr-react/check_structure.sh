#!/bin/bash

echo "=== Checking Directory Structure ==="
echo ""

dirs=(
  "src/components/ui"
  "src/components/forms"
  "src/components/layout"
  "src/components/permissions"
  "src/pages"
  "src/contexts"
  "src/hooks"
  "src/services"
  "src/lib"
  "src/utils"
  "src/types"
  "src/constants"
)

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    count=$(find "$dir" -name "*.ts" -o -name "*.tsx" | wc -l | xargs)
    echo "✅ $dir ($count files)"
  else
    echo "❌ $dir (missing)"
  fi
done

echo ""
echo "=== Checking for Next.js imports ==="
next_count=$(grep -r "from ['\"]next/" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | xargs)
if [ "$next_count" -eq 0 ]; then
  echo "✅ No Next.js imports found"
else
  echo "❌ Found $next_count Next.js imports"
  grep -r "from ['\"]next/" src --include="*.tsx" --include="*.ts" 2>/dev/null
fi

echo ""
echo "=== Summary ==="
total_files=$(find src -name "*.ts" -o -name "*.tsx" | wc -l | xargs)
echo "Total TypeScript files: $total_files"
