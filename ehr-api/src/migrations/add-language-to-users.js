
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const envPath = '/Users/apple/EHRConnect/EHRConnect/ehr-api/.env';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Read .env file successfully. Length:', envContent.length);
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

console.log('DB URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('DB URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : 'N/A');


async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: Add language to users table...');
        await client.query('BEGIN');

        // Check if column exists
        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'language'
    `);

        if (checkRes.rows.length === 0) {
            await client.query(`
        ALTER TABLE users 
        ADD COLUMN language VARCHAR(10) DEFAULT 'en'
    `);
            console.log('Added language column to users table.');
        } else {
            console.log('Language column already exists.');
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
