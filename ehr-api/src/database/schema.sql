-- Multi-Tenant Hospital/Clinic Management Schema
-- Version: 1.0
-- Compatible with PostgreSQL 12+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  legal_name TEXT,
  legal_info JSONB, -- Legal entity details, registration numbers
  status TEXT NOT NULL CHECK (status IN ('pending_verification', 'active', 'suspended', 'deactivated')),
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB, -- Structured address
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_step TEXT, -- Current step if incomplete
  settings JSONB, -- Org-specific settings
  created_by UUID NOT NULL, -- References first user/owner
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  suspended_at TIMESTAMP,
  metadata JSONB -- Additional org metadata
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_created_by ON organizations(created_by);

-- =====================================================
-- LOCATIONS (Facilities/Branches)
-- =====================================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Unique within org
  location_type TEXT NOT NULL CHECK (location_type IN ('hospital', 'clinic', 'diagnostic_center', 'pharmacy', 'branch')),
  address JSONB NOT NULL, -- Structured: line1, line2, city, state, postal_code, country
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  contact_email TEXT,
  contact_phone TEXT,
  contact_person TEXT,
  operational_hours JSONB, -- Opening hours per day
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP,
  metadata JSONB,
  UNIQUE(org_id, code)
);

CREATE INDEX idx_locations_org_id ON locations(org_id);
CREATE INDEX idx_locations_active ON locations(active);
CREATE INDEX idx_locations_org_active ON locations(org_id, active);

-- =====================================================
-- DEPARTMENTS (Optional for v1, prepared for v2)
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- NULL means org-wide
  name TEXT NOT NULL,
  code TEXT,
  department_type TEXT, -- 'emergency', 'opd', 'ipd', 'icu', 'lab', 'radiology', 'pharmacy'
  head_user_id UUID, -- Department head
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  UNIQUE(org_id, location_id, code)
);

CREATE INDEX idx_departments_org_id ON departments(org_id);
CREATE INDEX idx_departments_location_id ON departments(location_id);

-- =====================================================
-- DEPARTMENT MEMBERSHIPS (User-Department relationships)
-- =====================================================
CREATE TABLE IF NOT EXISTS department_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  role TEXT, -- 'member', 'head', 'assistant', etc.
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, department_id, left_at) -- Allow rejoining after leaving
);

CREATE INDEX idx_department_memberships_user_id ON department_memberships(user_id);
CREATE INDEX idx_department_memberships_department_id ON department_memberships(department_id);

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  keycloak_user_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('invited', 'active', 'disabled', 'suspended')),
  profile JSONB, -- Additional profile fields
  preferences JSONB, -- User preferences
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  disabled_at TIMESTAMP,
  disabled_reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak_user_id ON users(keycloak_user_id);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- ROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL, -- 'ORG_OWNER', 'ORG_ADMIN', 'CLINICIAN', 'FRONT_DESK', 'AUDITOR', 'PLATFORM_ADMIN'
  name TEXT NOT NULL,
  description TEXT,
  scope_level TEXT NOT NULL CHECK (scope_level IN ('PLATFORM', 'ORG', 'LOCATION', 'DEPARTMENT')),
  permissions JSONB NOT NULL, -- Array of permission strings
  is_system BOOLEAN NOT NULL DEFAULT FALSE, -- System roles cannot be deleted
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_key ON roles(key);
CREATE INDEX idx_roles_scope_level ON roles(scope_level);

-- Insert default system roles
INSERT INTO roles (key, name, description, scope_level, permissions, is_system) VALUES
  ('PLATFORM_ADMIN', 'Platform Administrator', 'Nirmitee super-admin with tenant operations access', 'PLATFORM', 
   '["platform:orgs:read", "platform:orgs:write", "platform:audit:read", "platform:support"]', true),
  ('ORG_OWNER', 'Organization Owner', 'Full organization control including billing and admin delegation', 'ORG',
   '["org:*:*", "locations:*:*", "staff:*:*", "roles:*:*", "audit:read"]', true),
  ('ORG_ADMIN', 'Organization Administrator', 'Manage locations, staff, and settings', 'ORG',
   '["org:read", "org:update", "locations:*:*", "staff:*:*", "audit:read"]', true),
  ('CLINICIAN', 'Clinician', 'Clinical workflows within assigned locations', 'LOCATION',
   '["patients:*:*", "encounters:*:*", "observations:*:*", "orders:*:*", "reports:read"]', true),
  ('FRONT_DESK', 'Front Desk', 'Patient registration and appointment management', 'LOCATION',
   '["patients:register", "patients:read", "appointments:*:*", "visits:checkin"]', true),
  ('AUDITOR', 'Auditor', 'Read-only access to audit logs and configurations', 'ORG',
   '["audit:read", "org:read", "locations:read", "staff:read"]', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- ROLE ASSIGNMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('ORG', 'LOCATION', 'DEPARTMENT')),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- Required if scope = 'LOCATION'
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE, -- Required if scope = 'DEPARTMENT'
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Optional: time-bound assignments
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES users(id),
  revocation_reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_role_assignments_user_id ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_org_id ON role_assignments(org_id);
CREATE INDEX idx_role_assignments_location_id ON role_assignments(location_id);
CREATE INDEX idx_role_assignments_active ON role_assignments(user_id, org_id) WHERE revoked_at IS NULL;

-- =====================================================
-- INVITATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id),
  role_keys TEXT[] NOT NULL, -- Array of role keys to assign
  scope TEXT NOT NULL CHECK (scope IN ('ORG', 'LOCATION', 'DEPARTMENT')),
  location_ids UUID[], -- Array of location IDs if scope = 'LOCATION'
  department_ids UUID[], -- Array of department IDs if scope = 'DEPARTMENT'
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES users(id),
  revocation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  CONSTRAINT valid_location_scope CHECK (
    (scope = 'LOCATION' AND location_ids IS NOT NULL AND array_length(location_ids, 1) > 0) OR
    (scope != 'LOCATION')
  )
);

CREATE INDEX idx_invitations_org_id ON invitations(org_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- =====================================================
-- AUDIT EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id), -- NULL for system actions
  action TEXT NOT NULL, -- 'ORG.CREATED', 'USER.INVITED', 'ROLE.GRANTED', etc.
  target_type TEXT NOT NULL, -- 'Organization', 'User', 'Location', 'RoleAssignment'
  target_id UUID, -- ID of the affected entity
  target_name TEXT, -- Human-readable target name
  category TEXT NOT NULL DEFAULT 'system', -- Logical grouping for filtering (http_requests, authentication, etc.)
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT, -- If status = 'failure'
  metadata JSONB, -- Additional context (changes made, etc.)
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_events_org_id ON audit_events(org_id);
CREATE INDEX idx_audit_events_actor_user_id ON audit_events(actor_user_id);
CREATE INDEX idx_audit_events_action ON audit_events(action);
CREATE INDEX idx_audit_events_target_type ON audit_events(target_type);
CREATE INDEX idx_audit_events_target_id ON audit_events(target_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX idx_audit_events_org_created ON audit_events(org_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_audit_event_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category IS NULL OR NEW.category = 'system' THEN
    NEW.category := CASE
      WHEN NEW.action LIKE 'AUTH.%' THEN 'authentication'
      WHEN NEW.action LIKE 'SECURITY.%' THEN 'security'
      WHEN NEW.action LIKE 'ORG.%' THEN 'administration'
      WHEN NEW.action LIKE 'ROLE.%' THEN 'administration'
      WHEN NEW.action LIKE 'USER.%' THEN 'administration'
      WHEN NEW.action LIKE 'INVENTORY.%' THEN 'data_changes'
      WHEN NEW.action LIKE 'BILLING.%' THEN 'data_changes'
      WHEN NEW.action LIKE 'HTTP.%' THEN 'http_requests'
      ELSE COALESCE(NEW.category, 'data_changes')
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_events_category_default
  BEFORE INSERT ON audit_events
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_event_category();

-- =====================================================
-- AUDIT SETTINGS (per-organization preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id),
  UNIQUE(org_id, preference_key)
);

CREATE INDEX idx_audit_settings_org ON audit_settings(org_id);
CREATE INDEX idx_audit_settings_key ON audit_settings(org_id, preference_key);

-- =====================================================
-- EMAIL VERIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'email_change', 'password_reset')),
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- =====================================================
-- ORGANIZATION SETTINGS (Separate table for scalability)
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'compliance', 'data_retention', 'notifications', 'integrations'
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id),
  UNIQUE(org_id, category, key)
);

CREATE INDEX idx_organization_settings_org_id ON organization_settings(org_id);
CREATE INDEX idx_organization_settings_category ON organization_settings(org_id, category);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate location assignments
CREATE OR REPLACE FUNCTION validate_location_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure location belongs to the same org as the assignment
  IF NEW.scope = 'LOCATION' AND NEW.location_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM locations 
      WHERE id = NEW.location_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Location does not belong to the specified organization';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_location_assignment BEFORE INSERT OR UPDATE ON role_assignments
  FOR EACH ROW EXECUTE FUNCTION validate_location_assignment();

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) - Optional but recommended
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see data from their org
-- Note: These policies should be customized based on your application user setup
-- Typically, you'd set a session variable with the org_id from the JWT token

-- Create a function to get current org_id from session
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_org_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Policy for organizations table
CREATE POLICY org_isolation_policy ON organizations
  FOR ALL
  USING (id = current_org_id() OR current_setting('app.current_user_role', true) = 'PLATFORM_ADMIN');

-- Policy for locations table
CREATE POLICY location_isolation_policy ON locations
  FOR ALL
  USING (org_id = current_org_id() OR current_setting('app.current_user_role', true) = 'PLATFORM_ADMIN');

-- Policy for audit_events table
CREATE POLICY audit_isolation_policy ON audit_events
  FOR SELECT
  USING (org_id = current_org_id() OR current_setting('app.current_user_role', true) = 'PLATFORM_ADMIN');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active staff with their roles and locations
CREATE OR REPLACE VIEW v_active_staff AS
SELECT 
  u.id AS user_id,
  u.email,
  u.name,
  u.status AS user_status,
  ra.org_id,
  o.name AS org_name,
  o.slug AS org_slug,
  r.key AS role_key,
  r.name AS role_name,
  ra.scope,
  ra.location_id,
  l.name AS location_name,
  ra.assigned_at
FROM users u
JOIN role_assignments ra ON u.id = ra.user_id
JOIN organizations o ON ra.org_id = o.id
JOIN roles r ON ra.role_id = r.id
LEFT JOIN locations l ON ra.location_id = l.id
WHERE u.status = 'active' 
  AND ra.revoked_at IS NULL
  AND (ra.expires_at IS NULL OR ra.expires_at > CURRENT_TIMESTAMP);

-- Pending invitations
CREATE OR REPLACE VIEW v_pending_invitations AS
SELECT 
  i.id,
  i.org_id,
  o.name AS org_name,
  i.email,
  i.role_keys,
  i.scope,
  i.location_ids,
  i.expires_at,
  i.created_at,
  ib.name AS invited_by_name,
  ib.email AS invited_by_email
FROM invitations i
JOIN organizations o ON i.org_id = o.id
JOIN users ib ON i.invited_by = ib.id
WHERE i.status = 'sent' 
  AND i.expires_at > CURRENT_TIMESTAMP;

-- Organization summary
CREATE OR REPLACE VIEW v_organization_summary AS
SELECT 
  o.id,
  o.name,
  o.slug,
  o.status,
  o.created_at,
  COUNT(DISTINCT l.id) FILTER (WHERE l.active = true) AS active_locations,
  COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'active') AS active_users,
  COUNT(DISTINCT ra.id) FILTER (WHERE ra.revoked_at IS NULL) AS total_role_assignments
FROM organizations o
LEFT JOIN locations l ON o.id = l.org_id
LEFT JOIN role_assignments ra ON o.id = ra.org_id
LEFT JOIN users u ON ra.user_id = u.id
GROUP BY o.id, o.name, o.slug, o.status, o.created_at;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE organizations IS 'Multi-tenant organizations (hospitals/clinics)';
COMMENT ON TABLE locations IS 'Physical locations/facilities within an organization';
COMMENT ON TABLE departments IS 'Departments within locations (optional v1, full in v2)';
COMMENT ON TABLE users IS 'Platform users with Keycloak integration';
COMMENT ON TABLE roles IS 'Role definitions with permissions';
COMMENT ON TABLE role_assignments IS 'User role assignments with org/location scoping';
COMMENT ON TABLE invitations IS 'Staff invitation system with token-based acceptance';
COMMENT ON TABLE audit_events IS 'Audit trail for all sensitive operations';
COMMENT ON TABLE email_verifications IS 'Email verification tokens for registration and changes';
COMMENT ON TABLE organization_settings IS 'Configurable organization settings by category';

COMMENT ON COLUMN role_assignments.scope IS 'Defines if role applies to ORG, LOCATION, or DEPARTMENT level';
COMMENT ON COLUMN audit_events.metadata IS 'JSON containing change details, before/after values, etc.';
COMMENT ON COLUMN organizations.onboarding_step IS 'Current wizard step if onboarding incomplete';

-- =====================================================
-- INVENTORY MANAGEMENT MODULE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_categories_org_name_unique ON inventory_categories(org_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_categories_org ON inventory_categories(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(org_id, is_active);

CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address JSONB,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_suppliers_org_name_unique ON inventory_suppliers(org_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_org ON inventory_suppliers(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_active ON inventory_suppliers(org_id, is_active);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  default_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'each',
  track_lots BOOLEAN NOT NULL DEFAULT TRUE,
  track_expiration BOOLEAN NOT NULL DEFAULT TRUE,
  allow_partial_quantity BOOLEAN NOT NULL DEFAULT FALSE,
  min_stock_level NUMERIC(12,2) DEFAULT 0,
  max_stock_level NUMERIC(12,2),
  reorder_point NUMERIC(12,2),
  reorder_quantity NUMERIC(12,2),
  cost_per_unit NUMERIC(12,2),
  is_controlled_substance BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, sku)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_items_org_name_unique ON inventory_items(org_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_items_org ON inventory_items(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(org_id, category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(org_id, sku);

CREATE TABLE IF NOT EXISTS inventory_item_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  par_level NUMERIC(12,2),
  reorder_point NUMERIC(12,2),
  reorder_quantity NUMERIC(12,2),
  max_level NUMERIC(12,2),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, item_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_item_locations_org ON inventory_item_locations(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_locations_item ON inventory_item_locations(org_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_locations_location ON inventory_item_locations(org_id, location_id);

CREATE TABLE IF NOT EXISTS inventory_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  lot_number TEXT NOT NULL,
  serial_number TEXT,
  barcode TEXT,
  expiration_date DATE,
  manufacture_date DATE,
  quantity_on_hand NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','expired','quarantined','consumed','returned')),
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, item_id, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_inventory_lots_org_item ON inventory_lots(org_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_location ON inventory_lots(org_id, location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_expiration ON inventory_lots(org_id, expiration_date);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_status ON inventory_lots(org_id, status);

CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
  source_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  destination_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('receipt','issue','transfer','adjustment','return','wastage')),
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  reason TEXT,
  reference_type TEXT,
  reference_id TEXT,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_org ON inventory_stock_movements(org_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_stock_movements(org_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_lot ON inventory_stock_movements(org_id, lot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_stock_movements(org_id, movement_type);

CREATE OR REPLACE VIEW inventory_item_stock_summary AS
SELECT
  i.org_id,
  i.id AS item_id,
  i.name,
  i.sku,
  COALESCE(SUM(l.quantity_on_hand), 0) AS quantity_on_hand,
  COALESCE(SUM(l.quantity_reserved), 0) AS quantity_reserved,
  MIN(l.expiration_date) FILTER (WHERE l.expiration_date IS NOT NULL AND l.status = 'available') AS next_expiration_date
FROM inventory_items i
LEFT JOIN inventory_lots l ON l.item_id = i.id AND l.org_id = i.org_id AND l.status IN ('available','reserved')
GROUP BY i.org_id, i.id, i.name, i.sku;

CREATE OR REPLACE FUNCTION set_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_categories_updated
BEFORE UPDATE ON inventory_categories
FOR EACH ROW EXECUTE FUNCTION set_inventory_updated_at();

CREATE TRIGGER trg_inventory_suppliers_updated
BEFORE UPDATE ON inventory_suppliers
FOR EACH ROW EXECUTE FUNCTION set_inventory_updated_at();

CREATE TRIGGER trg_inventory_items_updated
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION set_inventory_updated_at();

CREATE TRIGGER trg_inventory_item_locations_updated
BEFORE UPDATE ON inventory_item_locations
FOR EACH ROW EXECUTE FUNCTION set_inventory_updated_at();

CREATE TRIGGER trg_inventory_lots_updated
BEFORE UPDATE ON inventory_lots
FOR EACH ROW EXECUTE FUNCTION set_inventory_updated_at();

-- =====================================================
-- DASHBOARD SNAPSHOTS (Role-based analytics payloads)
-- =====================================================
CREATE TABLE IF NOT EXISTS dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID,
  location_ids UUID[],
  role_level TEXT NOT NULL CHECK (role_level IN ('executive', 'clinical', 'operations', 'billing', 'patient', 'general')),
  data_mode TEXT NOT NULL CHECK (data_mode IN ('actual', 'demo')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_org_role_mode
  ON dashboard_snapshots(org_id, role_level, data_mode, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_role_mode
  ON dashboard_snapshots(role_level, data_mode, period_end DESC);

