const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
      -- Remove foreign key constraint on patient_id (related patient field)
      -- This allows tasks to reference FHIR patients that may not be synced to local DB yet
      ALTER TABLE tasks
        DROP CONSTRAINT IF EXISTS tasks_patient_id_fkey;

      -- Add a comment to explain this decision
      COMMENT ON COLUMN tasks.patient_id IS
        'FHIR Patient reference for related patient context - may reference external FHIR patients not in local DB. No FK constraint to allow flexibility with FHIR resources.';
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
      console.log('🔄 Executing fix_task_related_patient_constraint...');
      await pool.query(sql);
      console.log('✅ fix_task_related_patient_constraint completed');
    } catch (error) {
      console.error('❌ fix_task_related_patient_constraint failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
      -- Restore the foreign key constraint
      ALTER TABLE tasks
        ADD CONSTRAINT tasks_patient_id_fkey
        FOREIGN KEY (patient_id)
        REFERENCES fhir_patients(id)
        ON DELETE CASCADE;
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
      await pool.query(sql);
    } catch (error) {
      console.error('Error rolling back:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
