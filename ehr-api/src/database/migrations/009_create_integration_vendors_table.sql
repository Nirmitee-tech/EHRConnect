-- Integration Vendors Catalog
-- Stores available third-party vendors that can be integrated

CREATE TABLE IF NOT EXISTS integration_vendors (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    logo TEXT,
    website TEXT,
    documentation TEXT,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_vendors_category ON integration_vendors(category);
CREATE INDEX IF NOT EXISTS idx_integration_vendors_featured ON integration_vendors(featured);
CREATE INDEX IF NOT EXISTS idx_integration_vendors_active ON integration_vendors(active);

-- Update trigger
CREATE OR REPLACE FUNCTION update_integration_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integration_vendors_updated_at
    BEFORE UPDATE ON integration_vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_vendors_updated_at();

-- Insert sample vendors
INSERT INTO integration_vendors (id, name, category, description, logo, website, documentation, featured) VALUES
-- EHR Systems
('epic', 'Epic', 'ehr', 'Leading EHR system used by major health systems', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Epic_Systems.svg/1600px-Epic_Systems.svg.png', 'https://www.epic.com', 'https://fhir.epic.com', true),
('cerner', 'Cerner (Oracle Health)', 'ehr', 'Comprehensive EHR and healthcare IT solutions', NULL, 'https://www.cerner.com', 'https://fhir.cerner.com', true),
('athenahealth', 'athenahealth', 'ehr', 'Cloud-based EHR and practice management', NULL, 'https://www.athenahealth.com', 'https://docs.athenahealth.com', true),
('allscripts', 'Allscripts', 'ehr', 'EHR and practice management solutions', NULL, 'https://www.allscripts.com', NULL, false),
('eclinicalworks', 'eClinicalWorks', 'ehr', 'Cloud-based EHR for ambulatory practices', NULL, 'https://www.eclinicalworks.com', NULL, false),

-- Health Data Networks
('redox', 'Redox', 'hl7-fhir', 'Healthcare data integration platform', NULL, 'https://www.redoxengine.com', 'https://docs.redoxengine.com', true),
('zushealth', 'Zus Health', 'hl7-fhir', 'Real-time health data aggregation', NULL, 'https://www.zushealth.com', 'https://docs.zushealth.com', true),
('particle', 'Particle Health', 'hl7-fhir', 'Healthcare data exchange network', NULL, 'https://www.particlehealth.com', NULL, false),

-- Claims & Clearinghouses
('change-healthcare', 'Change Healthcare', 'claims', 'Claims processing and revenue cycle', NULL, 'https://www.changehealthcare.com', NULL, true),
('availity', 'Availity', 'claims', 'Healthcare network for claims and eligibility', NULL, 'https://www.availity.com', 'https://developer.availity.com', true),
('waystar', 'Waystar', 'claims', 'Revenue cycle management platform', NULL, 'https://www.waystar.com', NULL, false),
('clearinghouse-gateway', 'Office Ally', 'claims', 'Medical claims clearinghouse', NULL, 'https://www.officeally.com', NULL, false),

-- Payment Processing
('stripe', 'Stripe', 'payment', 'Online payment processing', NULL, 'https://stripe.com', 'https://stripe.com/docs', true),
('square', 'Square', 'payment', 'Payment processing for healthcare', NULL, 'https://squareup.com', NULL, false),
('authorize-net', 'Authorize.Net', 'payment', 'Payment gateway', NULL, 'https://www.authorize.net', NULL, false),

-- Communication
('twilio', 'Twilio', 'communication', 'SMS, voice, and video communications', NULL, 'https://www.twilio.com', 'https://www.twilio.com/docs', true),
('exotel', 'Exotel', 'communication', 'Cloud telephony platform', NULL, 'https://exotel.com', NULL, false),
('plivo', 'Plivo', 'communication', 'Voice and SMS API platform', NULL, 'https://www.plivo.com', NULL, false),

-- Telehealth
('100ms', '100ms', 'telehealth', 'Live video infrastructure', 'https://cdn.prod.website-files.com/687b2d16145b3601a227c560/68ce683be1f04481afea1307_67f797769b1a701883c4b76d_icon.svg', 'https://www.100ms.live', 'https://docs.100ms.live', true),
('agora', 'Agora', 'telehealth', 'Real-time engagement platform', NULL, 'https://www.agora.io', NULL, false),
('vonage', 'Vonage Video', 'telehealth', 'Video conferencing API', NULL, 'https://www.vonage.com', NULL, false),

-- AI & ML
('openai', 'OpenAI', 'ai', 'GPT models for clinical documentation', NULL, 'https://openai.com', 'https://platform.openai.com/docs', true),
('anthropic', 'Anthropic Claude', 'ai', 'AI assistant for healthcare workflows', NULL, 'https://anthropic.com', NULL, true),
('assemblyai', 'AssemblyAI', 'ai', 'Speech-to-text transcription', NULL, 'https://www.assemblyai.com', NULL, false),
('deepgram', 'Deepgram', 'ai', 'Voice AI platform', NULL, 'https://deepgram.com', NULL, false),

-- CRM & Business
('salesforce-health-cloud', 'Salesforce Health Cloud', 'crm', 'Healthcare CRM solution', NULL, 'https://www.salesforce.com/health', NULL, true),
('hubspot', 'HubSpot', 'crm', 'CRM and marketing automation', NULL, 'https://www.hubspot.com', NULL, false),

-- ERP
('sap-healthcare', 'SAP for Healthcare', 'erp', 'Enterprise resource planning', NULL, 'https://www.sap.com', NULL, false),
('oracle-netsuite', 'Oracle NetSuite', 'erp', 'Cloud ERP solution', NULL, 'https://www.netsuite.com', NULL, false),

-- Laboratory
('labcorp', 'Labcorp', 'laboratory', 'Clinical laboratory services', NULL, 'https://www.labcorp.com', NULL, true),
('quest-diagnostics', 'Quest Diagnostics', 'laboratory', 'Diagnostic information services', NULL, 'https://www.questdiagnostics.com', NULL, true),

-- Pharmacy
('surescripts', 'Surescripts', 'pharmacy', 'E-prescribing network', NULL, 'https://surescripts.com', NULL, true),
('covermymeds', 'CoverMyMeds', 'pharmacy', 'Prior authorization platform', NULL, 'https://www.covermymeds.com', NULL, false),

-- Imaging
('nuance-powerscribe', 'Nuance PowerScribe', 'imaging', 'Radiology reporting', NULL, 'https://www.nuance.com', NULL, false),
('intelerad', 'Intelerad', 'imaging', 'Medical imaging platform', NULL, 'https://www.intelerad.com', NULL, false)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    logo = EXCLUDED.logo,
    website = EXCLUDED.website,
    documentation = EXCLUDED.documentation,
    featured = EXCLUDED.featured;

COMMENT ON TABLE integration_vendors IS 'Catalog of available third-party vendors for integration';
COMMENT ON COLUMN integration_vendors.featured IS 'Whether this vendor should be featured prominently in UI';
COMMENT ON COLUMN integration_vendors.active IS 'Whether this vendor is available for new integrations';
