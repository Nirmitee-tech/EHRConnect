'use strict';

const { Pool } = require('pg');

/**
 * Migration: OB/GYN Patient Education Table
 *
 * Adds storage for per-patient education module completion.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- ============================================================================
-- OB/GYN Patient Education
-- ============================================================================
CREATE TABLE IF NOT EXISTS obgyn_patient_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID REFERENCES patient_specialty_episodes(id),
  module_id VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  org_id UUID NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_education_patient ON obgyn_patient_education(patient_id);
CREATE INDEX IF NOT EXISTS idx_education_module ON obgyn_patient_education(module_id);
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
      console.log('Running 251215000002-add-obgyn-patient-education migration...');
      await pool.query(sql);
      console.log('Migration completed: obgyn_patient_education table created');
    } catch (error) {
      console.error('Migration failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
DROP INDEX IF EXISTS idx_education_module;
DROP INDEX IF EXISTS idx_education_patient;
DROP TABLE IF EXISTS obgyn_patient_education;
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
      console.log('Rolling back 251215000002-add-obgyn-patient-education migration...');
      await pool.query(sql);
      console.log('Rollback completed: obgyn_patient_education table removed');
    } catch (error) {
      console.error('Rollback failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
