#!/usr/bin/env node

/**
 * Standalone migration script to execute schema.sql
 * This bypasses Sequelize's query limitations and uses pg directly
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
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

        console.log('📖 Reading schema.sql...');
        const schemaPath = path.resolve(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🔄 Executing schema.sql...');
        await client.query(schemaSql);

        console.log('✅ Schema created successfully!');
        client.release();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
