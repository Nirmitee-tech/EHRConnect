-- Prior Authorization Enhancements
-- Adds readiness tracking columns for prior auths

ALTER TABLE billing_prior_authorizations
  ADD COLUMN IF NOT EXISTS readiness_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_passed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS readiness_notes TEXT;
