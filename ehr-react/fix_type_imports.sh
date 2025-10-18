#!/bin/bash
for file in src/services/address.service.ts \
            src/services/appointment-types.service.ts \
            src/services/appointment.service.ts \
            src/services/audit.service.ts \
            src/services/encounter.service.ts \
            src/services/inventory.service.ts \
            src/services/settings.service.ts \
            src/services/staff.service.ts; do
  if [ -f "$file" ]; then
    # Only add 'type' to imports from @/types that don't already have it
    sed -i '' '/from .@\/types/s/^import {/import type {/' "$file"
    echo "Fixed: $file"
  fi
done
