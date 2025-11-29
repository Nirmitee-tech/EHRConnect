'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
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

      CREATE INDEX IF NOT EXISTS idx_department_memberships_user_id ON department_memberships(user_id);
      CREATE INDEX IF NOT EXISTS idx_department_memberships_department_id ON department_memberships(department_id);

      -- Add comment
      COMMENT ON TABLE department_memberships IS 'Tracks which users belong to which departments';
      COMMENT ON COLUMN department_memberships.left_at IS 'NULL means currently active member, timestamp means left the department';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS department_memberships CASCADE;
    `);
  }
};
