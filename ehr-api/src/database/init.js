const { v4: uuidv4 } = require('uuid');

const FHIR_TABLES = `
-- FHIR Resources base table
CREATE TABLE IF NOT EXISTS fhir_resources (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resource_type VARCHAR(64) NOT NULL,
    version_id VARCHAR(64) NOT NULL DEFAULT '1',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resource_data JSONB NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    org_id UUID,

    -- Add indexes for better performance
    CONSTRAINT unique_resource_version UNIQUE (id, version_id)
);

-- Indexes for FHIR resource queries
CREATE INDEX IF NOT EXISTS idx_fhir_resources_type ON fhir_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_last_updated ON fhir_resources(last_updated);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_deleted ON fhir_resources(deleted);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_org_id ON fhir_resources(org_id);
CREATE INDEX IF NOT EXISTS idx_fhir_resources_data_gin ON fhir_resources USING GIN (resource_data);

-- Patient-specific indexes for common searches
CREATE INDEX IF NOT EXISTS idx_patient_family_name 
ON fhir_resources USING GIN ((resource_data->'name'->0->'family')) 
WHERE resource_type = 'Patient';

CREATE INDEX IF NOT EXISTS idx_patient_given_name 
ON fhir_resources USING GIN ((resource_data->'name'->0->'given')) 
WHERE resource_type = 'Patient';

CREATE INDEX IF NOT EXISTS idx_patient_identifier 
ON fhir_resources USING GIN ((resource_data->'identifier')) 
WHERE resource_type = 'Patient';

CREATE INDEX IF NOT EXISTS idx_patient_birthdate 
ON fhir_resources ((resource_data->>'birthDate')) 
WHERE resource_type = 'Patient';

CREATE INDEX IF NOT EXISTS idx_patient_gender 
ON fhir_resources ((resource_data->>'gender')) 
WHERE resource_type = 'Patient';

-- Organization-specific indexes
CREATE INDEX IF NOT EXISTS idx_org_name 
ON fhir_resources USING GIN ((resource_data->'name')) 
WHERE resource_type = 'Organization';

CREATE INDEX IF NOT EXISTS idx_org_identifier 
ON fhir_resources USING GIN ((resource_data->'identifier')) 
WHERE resource_type = 'Organization';

-- Practitioner-specific indexes  
CREATE INDEX IF NOT EXISTS idx_practitioner_name 
ON fhir_resources USING GIN ((resource_data->'name')) 
WHERE resource_type = 'Practitioner';

CREATE INDEX IF NOT EXISTS idx_practitioner_identifier 
ON fhir_resources USING GIN ((resource_data->'identifier')) 
WHERE resource_type = 'Practitioner';

-- History table for versioning
CREATE TABLE IF NOT EXISTS fhir_resource_history (
    id VARCHAR(64),
    version_id VARCHAR(64),
    resource_type VARCHAR(64) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    resource_data JSONB NOT NULL,
    method VARCHAR(10) NOT NULL, -- CREATE, UPDATE, DELETE
    
    PRIMARY KEY (id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_fhir_history_type ON fhir_resource_history(resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_history_updated ON fhir_resource_history(last_updated);
`;

async function initializeDatabase(pool) {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Execute schema creation
    await pool.query(FHIR_TABLES);
    
    console.log('✅ Database schema created successfully');
    
    // Check if we need to seed initial data
    const { rows } = await pool.query(
      "SELECT COUNT(*) as count FROM fhir_resources WHERE resource_type = 'Organization'"
    );
    
    if (parseInt(rows[0].count) === 0) {
      await seedInitialData(pool);
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function seedInitialData(pool) {
  console.log('🌱 Seeding initial data...');
  
  try {
    // Create default organization
    const orgId = uuidv4();
    const defaultOrg = {
      resourceType: 'Organization',
      id: orgId,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString()
      },
      identifier: [
        {
          use: 'official',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'PRN',
                display: 'Provider number'
              }
            ]
          },
          system: 'http://ehr-connect.com/organization',
          value: 'ORG001'
        }
      ],
      active: true,
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/organization-type',
              code: 'prov',
              display: 'Healthcare Provider'
            }
          ]
        }
      ],
      name: 'EHR Connect Healthcare',
      telecom: [
        {
          system: 'phone',
          value: '+1-555-123-4567',
          use: 'work'
        },
        {
          system: 'email',
          value: 'contact@ehr-connect.com',
          use: 'work'
        }
      ],
      address: [
        {
          use: 'work',
          type: 'physical',
          line: ['123 Healthcare Blvd'],
          city: 'Medical City',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        }
      ]
    };
    
    await pool.query(
      `INSERT INTO fhir_resources (id, resource_type, resource_data, last_updated) 
       VALUES ($1, $2, $3, $4)`,
      [orgId, 'Organization', JSON.stringify(defaultOrg), new Date()]
    );
    
    console.log('✅ Initial data seeded successfully');
    
  } catch (error) {
    console.error('❌ Failed to seed initial data:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  seedInitialData
};
