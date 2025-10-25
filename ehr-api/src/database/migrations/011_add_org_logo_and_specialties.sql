-- Add logo and specialties to organizations table

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN organizations.logo_url IS 'URL to organization logo image';
COMMENT ON COLUMN organizations.specialties IS 'Array of medical specialties offered by the organization';
