#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function testQuery() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'medplum',
        user: process.env.DB_USER || 'medplum',
        password: process.env.DB_PASSWORD || 'medplum123',
    });

    try {
        const client = await pool.connect();

        // Test the exact statement
        const testSQL = `CREATE TABLE IF NOT EXISTS test_inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, LOWER(name))
);`;

        console.log('Testing SQL statement...');
        await client.query(testSQL);
        console.log('✅ Test passed!');

        await client.query('DROP TABLE test_inventory_categories;');

        client.release();
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

testQuery();
