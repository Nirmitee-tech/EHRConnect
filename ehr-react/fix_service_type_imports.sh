#!/bin/bash

# Files with type imports from services that need fixing
files=(
  "src/components/patients/patient-drawer.tsx"
  "src/components/forms/facility-form.tsx"
  "src/components/encounters/template-selector.tsx"
  "src/pages/PatientNew.tsx"
  "src/pages/AuditLogs.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check which pattern to fix
    if grep -q "CreatePatientRequest.*UpdatePatientRequest.*from '@/services/patient.service'" "$file"; then
      sed -i '' "s/import { CreatePatientRequest, UpdatePatientRequest } from '@\/services\/patient.service'/import type { CreatePatientRequest, UpdatePatientRequest } from '@\/services\/patient.service'/" "$file"
      echo "Fixed patient types: $file"
    fi
    
    if grep -q "CreateFacilityRequest.*UpdateFacilityRequest.*from '@/services/facility.service'" "$file"; then
      sed -i '' "s/import { CreateFacilityRequest, UpdateFacilityRequest } from '@\/services\/facility.service'/import type { CreateFacilityRequest, UpdateFacilityRequest } from '@\/services\/facility.service'/" "$file"
      echo "Fixed facility types: $file"
    fi
    
    if grep -q "ClinicalTemplate.*from '@/services/template.service'" "$file"; then
      sed -i '' "s/import { TemplateService, ClinicalTemplate }/import type { ClinicalTemplate }; import { TemplateService }/" "$file"
      echo "Fixed template types: $file"
    fi
    
    if grep -q "AuditEventFilters.*from '@/services/audit.service'" "$file"; then
      sed -i '' "s/import { AuditService, AuditEventFilters }/import type { AuditEventFilters }; import { AuditService }/" "$file"
      echo "Fixed audit types: $file"
    fi
  fi
done

echo "Done!"
