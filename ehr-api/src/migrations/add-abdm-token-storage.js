const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length > 1) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
} catch (e) {
    console.error('Failed to read .env file:', e);
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: Add ABDM token storage...');
        await client.query('BEGIN');

        // Add token storage columns to abha_profiles table
        console.log('Adding token columns to abha_profiles table...');

        await client.query(`
            ALTER TABLE abha_profiles
            ADD COLUMN IF NOT EXISTS x_token TEXT,
            ADD COLUMN IF NOT EXISTS x_token_expires_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS t_token TEXT,
            ADD COLUMN IF NOT EXISTS refresh_token TEXT,
            ADD COLUMN IF NOT EXISTS token_updated_at TIMESTAMP
        `);

        console.log('✓ Token columns added successfully');

        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);
