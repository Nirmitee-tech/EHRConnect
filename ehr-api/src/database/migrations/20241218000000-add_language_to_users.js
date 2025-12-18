const { Pool } = require('pg');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const sql = `
-- Migration: Add language field to users table
-- This enables persisting user language preferences

ALTER TABLE users
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

COMMENT ON COLUMN users.language IS 'User preferred language code (e.g., en, es, hi, ur). Defaults to en.';
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
            console.log('🔄 Executing 20241218000000-add_language_to_users...');
            await pool.query(sql);
            console.log('✅ 20241218000000-add_language_to_users completed');
        } catch (error) {
            console.error('❌ 20241218000000-add_language_to_users failed:', error.message);
            throw error;
        } finally {
            await pool.end();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const sql = `
ALTER TABLE users
DROP COLUMN IF EXISTS language;
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
            console.log('🔄 Reverting 20241218000000-add_language_to_users...');
            await pool.query(sql);
            console.log('✅ 20241218000000-add_language_to_users reverted');
        } catch (error) {
            console.error('❌ 20241218000000-add_language_to_users reversion failed:', error.message);
            throw error;
        } finally {
            await pool.end();
        }
    }
};
