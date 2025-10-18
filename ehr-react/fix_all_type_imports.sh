#!/bin/bash

echo "Fixing type imports in all files..."

# Find all TypeScript files excluding node_modules and types directory itself
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/types/*" | while IFS= read -r file; do
  # Check if file has imports from @/types
  if grep -q "from '@/types" "$file"; then
    # Replace import { with import type { for @/types imports
    sed -i '' '/from .@\/types/s/^import {/import type {/' "$file"
    echo "Fixed: $file"
  fi
done

echo "Done!"
