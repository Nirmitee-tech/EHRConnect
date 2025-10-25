-- Add org_type to organizations table

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS org_type TEXT;

-- Add comment
COMMENT ON COLUMN organizations.org_type IS 'Type of healthcare organization: hospital, clinic, diagnostic_center, pharmacy, nursing_home, lab';
