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
        console.log('Running migration: Add ABDM tables...');
        await client.query('BEGIN');

        // Create ABHA profiles table
        console.log('Creating abha_profiles table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS abha_profiles (
                id SERIAL PRIMARY KEY,
                org_id UUID NOT NULL,
                abha_number VARCHAR(50) NOT NULL,
                abha_address VARCHAR(255),
                name VARCHAR(255),
                gender VARCHAR(20),
                date_of_birth DATE,
                mobile VARCHAR(20),
                email VARCHAR(255),
                profile_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(abha_number, org_id)
            )
        `);

        // Create index on abha_number for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_abha_profiles_abha_number
            ON abha_profiles(abha_number)
        `);

        // Create index on org_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_abha_profiles_org_id
            ON abha_profiles(org_id)
        `);

        // Create ABDM transactions table
        console.log('Creating abdm_transactions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS abdm_transactions (
                id SERIAL PRIMARY KEY,
                org_id UUID NOT NULL,
                integration_id UUID,
                operation VARCHAR(100) NOT NULL,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create index on org_id for transactions
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_abdm_transactions_org_id
            ON abdm_transactions(org_id)
        `);

        // Create index on created_at for transaction history queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_abdm_transactions_created_at
            ON abdm_transactions(created_at DESC)
        `);

        // Check if integrations table exists, if not create it
        const integrationsTableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'integrations'
            )
        `);

        if (!integrationsTableCheck.rows[0].exists) {
            console.log('Creating integrations table...');
            await client.query(`
                CREATE TABLE integrations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    org_id UUID NOT NULL,
                    vendor_id VARCHAR(100) NOT NULL,
                    enabled BOOLEAN DEFAULT true,
                    environment VARCHAR(50) DEFAULT 'sandbox',
                    api_endpoint TEXT,
                    credentials JSONB NOT NULL,
                    usage_mappings JSONB,
                    health_status VARCHAR(50) DEFAULT 'inactive',
                    last_tested_at TIMESTAMP,
                    last_error TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by UUID,
                    updated_by UUID,
                    UNIQUE(org_id, vendor_id)
                )
            `);

            // Create indexes
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_integrations_org_vendor
                ON integrations(org_id, vendor_id)
            `);

            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_integrations_enabled
                ON integrations(enabled)
            `);
        } else {
            console.log('Integrations table already exists.');
        }

        // Check if integration_vendors table exists, if not create it
        const vendorsTableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'integration_vendors'
            )
        `);

        if (!vendorsTableCheck.rows[0].exists) {
            console.log('Creating integration_vendors table...');
            await client.query(`
                CREATE TABLE integration_vendors (
                    id VARCHAR(100) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT,
                    logo VARCHAR(500),
                    website VARCHAR(500),
                    documentation VARCHAR(500),
                    active BOOLEAN DEFAULT true,
                    featured BOOLEAN DEFAULT false,
                    sort_order INTEGER DEFAULT 999,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_integration_vendors_category
                ON integration_vendors(category)
            `);

            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_integration_vendors_active
                ON integration_vendors(active)
            `);
        } else {
            console.log('integration_vendors table already exists.');
        }

        // Insert ABDM vendor
        console.log('Inserting ABDM vendor...');
        await client.query(`
            INSERT INTO integration_vendors (
                id, name, category, description, website, documentation, active, featured, sort_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
                name = $2,
                category = $3,
                description = $4,
                website = $5,
                documentation = $6,
                active = $7,
                featured = $8,
                sort_order = $9,
                updated_at = NOW()
        `, [
            'abdm',
            'ABDM (Ayushman Bharat Digital Mission)',
            'hl7-fhir',
            'India\'s national digital health ecosystem. Create ABHA accounts, verify identities, and enable health data exchange across the ABDM network.',
            'https://abdm.gov.in',
            'https://sandbox.abdm.gov.in/docs',
            true,
            true,
            10
        ]);

        await client.query('COMMIT');
        console.log('✓ ABDM migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrate()
        .then(() => {
            console.log('Migration script completed.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Migration script failed:', err);
            process.exit(1);
        });
}

module.exports = { migrate };
