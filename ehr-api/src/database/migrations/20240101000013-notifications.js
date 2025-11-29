const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  title TEXT,
  message TEXT,
  category TEXT NOT NULL DEFAULT 'system',
  severity TEXT NOT NULL DEFAULT 'info',
  href TEXT,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  read_by TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_org_created_at
  ON notifications (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_event
  ON notifications (event);

CREATE INDEX IF NOT EXISTS idx_notifications_recipients
  ON notifications
  USING GIN (recipients);

CREATE INDEX IF NOT EXISTS idx_notifications_read_by
  ON notifications
  USING GIN (read_by);
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
      console.log('🔄 Executing 20240101000013-notifications...');
      await pool.query(sql);
      console.log('✅ 20240101000013-notifications completed');
    } catch (error) {
      console.error('❌ 20240101000013-notifications failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000013-notifications.js');
  }
};
