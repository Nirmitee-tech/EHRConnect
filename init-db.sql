-- Create databases for Medplum and Keycloak
-- Note: PostgreSQL doesn't support IF NOT EXISTS for CREATE DATABASE

-- Create keycloak database
SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Create medplum database  
SELECT 'CREATE DATABASE medplum'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'medplum')\gexec

-- Note: GRANT statements will be handled by the applications themselves
-- as they connect with the medplum user which already has access
