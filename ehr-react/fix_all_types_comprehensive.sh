#!/bin/bash

echo "Fixing ALL type imports from @/types/*..."

# Find all TypeScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/types/*" | while IFS= read -r file; do
  # Check if file has any imports from @/types
  if grep -q "from '@/types" "$file"; then
    # Replace all variations: @/types/*, @/types
    sed -i '' -E "/from '@\/types/s/^([[:space:]]*)import \{/\1import type {/" "$file"
    echo "Fixed: $file"
  fi
done

echo "Done!"
