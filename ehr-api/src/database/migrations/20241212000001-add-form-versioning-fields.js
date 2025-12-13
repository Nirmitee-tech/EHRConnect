'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add retired_at column if it doesn't exist
      const tableDescription = await queryInterface.describeTable('form_templates');

      if (!tableDescription.retired_at) {
        await queryInterface.addColumn(
          'form_templates',
          'retired_at',
          {
            type: Sequelize.DATE,
            allowNull: true,
          },
          { transaction }
        );
      }

      // Add index on (org_id, status, is_latest_version) for efficient queries
      await queryInterface.sequelize.query(
        `
        CREATE INDEX IF NOT EXISTS idx_form_templates_org_status_latest
        ON form_templates(org_id, status, is_latest_version)
        WHERE status != 'archived'
        `,
        { transaction }
      );

      // Add index on parent_version_id for version chain queries
      await queryInterface.sequelize.query(
        `
        CREATE INDEX IF NOT EXISTS idx_form_templates_parent_version
        ON form_templates(parent_version_id)
        WHERE parent_version_id IS NOT NULL
        `,
        { transaction }
      );

      // Create view for latest active versions
      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE VIEW form_templates_latest AS
        SELECT *
        FROM form_templates
        WHERE is_latest_version = true
        AND status != 'archived'
        `,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Form versioning fields added successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding form versioning fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop view
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS form_templates_latest', {
        transaction,
      });

      // Drop indexes
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_form_templates_org_status_latest',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_form_templates_parent_version',
        { transaction }
      );

      // Drop column
      const tableDescription = await queryInterface.describeTable('form_templates');
      if (tableDescription.retired_at) {
        await queryInterface.removeColumn('form_templates', 'retired_at', { transaction });
      }

      await transaction.commit();
      console.log('✅ Form versioning fields removed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing form versioning fields:', error);
      throw error;
    }
  },
};
