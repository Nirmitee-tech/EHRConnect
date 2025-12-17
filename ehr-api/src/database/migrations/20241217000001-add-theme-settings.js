/**
 * Migration: Add theme settings to organizations table
 * 
 * This migration adds theme customization capabilities including:
 * - Theme settings (colors, fonts, logo URLs)
 * - Support for custom branding per organization
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🎨 Adding theme settings to organizations table...');

    const { Pool } = require('pg');
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      const client = await pool.connect();
      
      try {
        // Add theme_settings column if it doesn't exist
        await client.query(`
          ALTER TABLE organizations 
          ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{
            "primaryColor": "#4A90E2",
            "secondaryColor": "#9B59B6",
            "sidebarBackgroundColor": "#0F1E56",
            "sidebarTextColor": "#B0B7D0",
            "sidebarActiveColor": "#3342A5",
            "accentColor": "#10B981",
            "fontFamily": "Inter, sans-serif",
            "logoUrl": null,
            "faviconUrl": null
          }'::jsonb;
        `);

        console.log('✅ Theme settings column added successfully');
        
        // Create index for faster theme settings queries
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_organizations_theme_settings 
          ON organizations USING gin(theme_settings);
        `);

        console.log('✅ Index created for theme settings');
        
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Removing theme settings from organizations table...');

    const { Pool } = require('pg');
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      const client = await pool.connect();
      
      try {
        // Drop the index first
        await client.query(`
          DROP INDEX IF EXISTS idx_organizations_theme_settings;
        `);

        // Remove theme_settings column
        await client.query(`
          ALTER TABLE organizations 
          DROP COLUMN IF EXISTS theme_settings;
        `);

        console.log('✅ Theme settings removed successfully');
        
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
