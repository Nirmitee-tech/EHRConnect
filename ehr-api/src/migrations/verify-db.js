#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function verifyDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'medplum',
        user: process.env.DB_USER || 'medplum',
        password: process.env.DB_PASSWORD || 'medplum123',
    });

    try {
        const client = await pool.connect();

        console.log('📊 Database Verification\n');
        console.log('='.repeat(50));

        // Count tables
        const { rows: tables } = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
        console.log(`✅ Tables: ${tables[0].count}`);

        // Count views
        const { rows: views } = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `);
        console.log(`✅ Views: ${views[0].count}`);

        // Count roles
        const { rows: roles } = await client.query('SELECT COUNT(*) as count FROM roles');
        console.log(`✅ Roles: ${roles[0].count}`);

        // Count inventory categories
        const { rows: categories } = await client.query('SELECT COUNT(*) as count FROM inventory_categories');
        console.log(`✅ Inventory Categories: ${categories[0].count}`);

        // Count inventory suppliers
        const { rows: suppliers } = await client.query('SELECT COUNT(*) as count FROM inventory_suppliers');
        console.log(`✅ Inventory Suppliers: ${suppliers[0].count}`);

        console.log('='.repeat(50));
        console.log('\n✨ Database setup is complete and verified!');

        client.release();
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verifyDatabase();
