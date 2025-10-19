-- Add custom HL7 integration vendor
INSERT INTO integration_vendors (id, name, category, description, logo, website, documentation, featured, active, sort_order)
VALUES (
  'custom-hl7',
  'Custom HL7',
  'hl7-fhir',
  'Custom HL7 v2.x integration with data mapper for legacy systems',
  'https://www.hl7.org/favicon.ico',
  'https://www.hl7.org',
  'https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185',
  true,
  true,
  1
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  logo = EXCLUDED.logo,
  website = EXCLUDED.website,
  documentation = EXCLUDED.documentation,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;
