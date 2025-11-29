#!/usr/bin/env node

/**
 * Clean up database - drop all tables, views, and functions
 */

const { Pool } = require('pg');
require('dotenv').config();

async function cleanDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'medplum',
        user: process.env.DB_USER || 'medplum',
        password: process.env.DB_PASSWORD || 'medplum123',
    });

    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        console.log('🗑️  Dropping all views...');
        await client.query('DROP VIEW IF EXISTS inventory_item_stock_summary CASCADE;');
        await client.query('DROP VIEW IF EXISTS v_organization_summary CASCADE;');
        await client.query('DROP VIEW IF EXISTS v_pending_invitations CASCADE;');
        await client.query('DROP VIEW IF EXISTS v_active_staff CASCADE;');

        console.log('🗑️  Dropping all tables...');
        const tables = [
            'dashboard_snapshots',
            'inventory_stock_movements',
            'inventory_lots',
            'inventory_item_locations',
            'inventory_items',
            'inventory_suppliers',
            'inventory_categories',
            'organization_settings',
            'email_verifications',
            'audit_settings',
            'audit_events',
            'invitations',
            'role_assignments',
            'roles',
            'users',
            'departments',
            'locations',
            'organizations'
        ];

        for (const table of tables) {
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        }

        console.log('🗑️  Dropping all functions...');
        await client.query('DROP FUNCTION IF EXISTS current_org_id() CASCADE;');
        await client.query('DROP FUNCTION IF EXISTS validate_location_assignment() CASCADE;');
        await client.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');
        await client.query('DROP FUNCTION IF EXISTS set_audit_event_category() CASCADE;');
        await client.query('DROP FUNCTION IF EXISTS set_inventory_updated_at() CASCADE;');

        console.log('✅ Database cleaned successfully!');
        client.release();
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

cleanDatabase();
