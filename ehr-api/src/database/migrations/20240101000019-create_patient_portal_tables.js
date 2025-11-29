const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Migration: Create patient portal tables
-- Description: Tables for managing patient portal access, authentication, sessions, and audit logs
-- Separates authentication (PostgreSQL) from clinical data (FHIR)

-- =====================================================
-- PATIENT PORTAL USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Patient identification
  fhir_patient_id TEXT UNIQUE NOT NULL, -- Links to FHIR Patient resource ID
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Credentials
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hashed password

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'suspended', 'pending')),

  -- Access control
  portal_access_granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  portal_access_granted_by UUID REFERENCES users(id), -- Provider who granted access
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,

  -- Security
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  email_verification_token TEXT,
  email_verified_at TIMESTAMPTZ,

  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb, -- Notification settings, language, etc.

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for patient_portal_users
CREATE INDEX IF NOT EXISTS idx_patient_portal_users_email ON patient_portal_users(email);
CREATE INDEX IF NOT EXISTS idx_patient_portal_users_fhir_patient_id ON patient_portal_users(fhir_patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_users_org_id ON patient_portal_users(org_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_users_status ON patient_portal_users(status);
CREATE INDEX IF NOT EXISTS idx_patient_portal_users_org_email ON patient_portal_users(org_id, email);
CREATE INDEX IF NOT EXISTS idx_patient_portal_users_last_login ON patient_portal_users(last_login_at);

-- Unique constraint for email per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_portal_users_org_email_unique ON patient_portal_users(org_id, LOWER(email));

-- =====================================================
-- PATIENT PORTAL SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_portal_user_id UUID NOT NULL REFERENCES patient_portal_users(id) ON DELETE CASCADE,

  -- Session data
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Session metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for patient_portal_sessions
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_user ON patient_portal_sessions(patient_portal_user_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_expires ON patient_portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_portal_sessions_last_activity ON patient_portal_sessions(last_activity_at);

-- =====================================================
-- PATIENT PORTAL AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_portal_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_portal_user_id UUID REFERENCES patient_portal_users(id) ON DELETE SET NULL,

  -- Action details
  action TEXT NOT NULL, -- 'login', 'logout', 'view_records', 'book_appointment', 'failed_login', etc.
  resource_type TEXT, -- 'Appointment', 'MedicationRequest', 'Observation', etc.
  resource_id TEXT,

  -- Request details
  ip_address INET,
  user_agent TEXT,

  -- Status
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
  error_message TEXT,

  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for patient_portal_audit_logs
CREATE INDEX IF NOT EXISTS idx_patient_portal_audit_logs_user ON patient_portal_audit_logs(patient_portal_user_id);
CREATE INDEX IF NOT EXISTS idx_patient_portal_audit_logs_action ON patient_portal_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_patient_portal_audit_logs_created ON patient_portal_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_portal_audit_logs_status ON patient_portal_audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_patient_portal_audit_logs_resource ON patient_portal_audit_logs(resource_type, resource_id);

-- Composite index for common audit queries
CREATE INDEX IF NOT EXISTS idx_patient_portal_audit_logs_user_action_created ON patient_portal_audit_logs(patient_portal_user_id, action, created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp on patient_portal_users
CREATE OR REPLACE FUNCTION update_patient_portal_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_patient_portal_users_updated_at ON patient_portal_users;
CREATE TRIGGER trigger_patient_portal_users_updated_at
  BEFORE UPDATE ON patient_portal_users
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_portal_users_updated_at();

-- Trigger to update last_activity_at on sessions
CREATE OR REPLACE FUNCTION update_patient_portal_sessions_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_patient_portal_sessions_activity ON patient_portal_sessions;
CREATE TRIGGER trigger_patient_portal_sessions_activity
  BEFORE UPDATE ON patient_portal_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_portal_sessions_activity();

-- =====================================================
-- FUNCTIONS FOR CLEANUP
-- =====================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_patient_portal_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM patient_portal_sessions
  WHERE expires_at < CURRENT_TIMESTAMP;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs (older than 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_patient_portal_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM patient_portal_audit_logs
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE patient_portal_users IS 'Patient portal user accounts - manages authentication and access control for patients';
COMMENT ON COLUMN patient_portal_users.fhir_patient_id IS 'Reference to FHIR Patient resource ID in Medplum';
COMMENT ON COLUMN patient_portal_users.email IS 'Patient email address for login';
COMMENT ON COLUMN patient_portal_users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN patient_portal_users.status IS 'Account status: active, disabled, suspended, or pending';
COMMENT ON COLUMN patient_portal_users.portal_access_granted_by IS 'Provider/user who granted portal access';
COMMENT ON COLUMN patient_portal_users.failed_login_attempts IS 'Count of consecutive failed login attempts';
COMMENT ON COLUMN patient_portal_users.account_locked_until IS 'Timestamp until which account is locked after failed attempts';

COMMENT ON TABLE patient_portal_sessions IS 'Active patient portal sessions for session management';
COMMENT ON COLUMN patient_portal_sessions.session_token IS 'Unique session token for authentication';
COMMENT ON COLUMN patient_portal_sessions.expires_at IS 'Session expiration timestamp';
COMMENT ON COLUMN patient_portal_sessions.last_activity_at IS 'Last activity timestamp for session timeout';

COMMENT ON TABLE patient_portal_audit_logs IS 'Audit trail for all patient portal actions and access';
COMMENT ON COLUMN patient_portal_audit_logs.action IS 'Action performed: login, logout, view_records, book_appointment, etc.';
COMMENT ON COLUMN patient_portal_audit_logs.resource_type IS 'FHIR resource type accessed (if applicable)';
COMMENT ON COLUMN patient_portal_audit_logs.resource_id IS 'FHIR resource ID accessed (if applicable)';
COMMENT ON COLUMN patient_portal_audit_logs.status IS 'Action outcome: success, failure, or error';
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 20240101000019-create_patient_portal_tables...');
      await pool.query(sql);
      console.log('✅ 20240101000019-create_patient_portal_tables completed');
    } catch (error) {
      console.error('❌ 20240101000019-create_patient_portal_tables failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000019-create_patient_portal_tables.js');
  }
};
