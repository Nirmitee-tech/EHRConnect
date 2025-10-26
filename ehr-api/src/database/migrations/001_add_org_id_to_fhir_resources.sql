-- Migration: Add org_id column to fhir_resources for multi-tenant data isolation
-- This ensures all FHIR resources are properly scoped to an organization

-- Add org_id column
ALTER TABLE fhir_resources
ADD COLUMN IF NOT EXISTS org_id VARCHAR(64);

-- Create index for org_id filtering (critical for performance)
CREATE INDEX IF NOT EXISTS idx_fhir_resources_org_id ON fhir_resources(org_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_fhir_resources_org_type ON fhir_resources(org_id, resource_type);

-- For existing data: Extract org_id from JSONB if it exists in extensions
-- This handles appointments created with v2 endpoint that store org in extension
UPDATE fhir_resources
SET org_id = (
  SELECT ref_value
  FROM jsonb_array_elements(resource_data->'extension') AS ext
  CROSS JOIN LATERAL (
    SELECT regexp_replace(ext->'valueReference'->>'reference', 'Organization/', '') AS ref_value
  ) AS refs
  WHERE ext->>'url' = 'http://ehrconnect.io/fhir/StructureDefinition/appointment-organization'
  LIMIT 1
)
WHERE resource_type = 'Appointment'
  AND org_id IS NULL
  AND resource_data->'extension' IS NOT NULL;

-- For patients: Extract from managingOrganization
UPDATE fhir_resources
SET org_id = regexp_replace(resource_data->'managingOrganization'->>'reference', 'Organization/', '')
WHERE resource_type = 'Patient'
  AND org_id IS NULL
  AND resource_data->'managingOrganization' IS NOT NULL;

-- For practitioners: Extract from organization (if they have one)
UPDATE fhir_resources
SET org_id = (
  SELECT ref_value
  FROM jsonb_array_elements(COALESCE(resource_data->'practitionerRole', '[]'::jsonb)) AS role
  CROSS JOIN LATERAL (
    SELECT regexp_replace(role->'organization'->>'reference', 'Organization/', '') AS ref_value
  ) AS refs
  WHERE role->'organization' IS NOT NULL
  LIMIT 1
)
WHERE resource_type = 'Practitioner'
  AND org_id IS NULL
  AND resource_data->'practitionerRole' IS NOT NULL;

-- Organizations themselves: use their own ID
UPDATE fhir_resources
SET org_id = id
WHERE resource_type = 'Organization'
  AND org_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN fhir_resources.org_id IS 'Organization ID for multi-tenant data isolation. All resources must be scoped to an organization.';

-- Migration complete
