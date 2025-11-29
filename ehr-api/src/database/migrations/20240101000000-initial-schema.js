const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

/**
 * Properly split SQL file into individual statements
 * Handles functions, triggers, parentheses, and other complex SQL constructs
 */
function splitSQLStatements(sql) {
    const statements = [];
    let current = '';
    let inFunction = false;
    let dollarQuoteTag = null;
    let parenDepth = 0;

    const lines = sql.split('\n');

    for (let line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments at the start of a statement
        if (!current && (trimmed === '' || trimmed.startsWith('--'))) {
            continue;
        }

        // Check for dollar-quoted strings (used in functions)
        const dollarMatches = line.match(/\$([a-zA-Z_]*)\$/g);
        if (dollarMatches) {
            for (const match of dollarMatches) {
                if (!dollarQuoteTag) {
                    dollarQuoteTag = match;
                    inFunction = true;
                } else if (match === dollarQuoteTag) {
                    dollarQuoteTag = null;
                    inFunction = false;
                }
            }
        }

        // Track parentheses depth (only when not in a function)
        if (!inFunction) {
            for (const char of line) {
                if (char === '(') parenDepth++;
                if (char === ')') parenDepth--;
            }
        }

        current += line + '\n';

        // If we're not in a function, parentheses are balanced, and line ends with semicolon
        if (!inFunction && parenDepth === 0 && trimmed.endsWith(';')) {
            statements.push(current.trim());
            current = '';
        }
    }

    // Add any remaining content
    if (current.trim()) {
        statements.push(current.trim());
    }

    return statements.filter(s => s.length > 0 && !s.match(/^--/));
}

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const schemaPath = path.resolve(__dirname, '../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Create a new pg pool using the same config as Sequelize
        const config = queryInterface.sequelize.config;
        const pool = new Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.username,
            password: config.password,
        });

        try {
            console.log('🔄 Parsing schema.sql...');
            const statements = splitSQLStatements(schemaSql);
            console.log(`📊 Found ${statements.length} SQL statements to execute`);

            const client = await pool.connect();

            try {
                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];
                    try {
                        await client.query(statement);
                        // Log progress for long-running migrations
                        if (i % 10 === 0) {
                            console.log(`   Executed ${i + 1}/${statements.length} statements...`);
                        }
                    } catch (error) {
                        console.error(`\n❌ Error executing statement ${i + 1}:`);
                        console.error('=== FULL STATEMENT ===');
                        console.error(statement);
                        console.error('=== ERROR ===');
                        console.error(error.message);
                        throw error;
                    }
                }

                console.log('✅ Schema created successfully');
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Schema creation failed:', error.message);
            throw error;
        } finally {
            await pool.end();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const config = queryInterface.sequelize.config;
        const pool = new Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.username,
            password: config.password,
        });

        try {
            console.log('🔄 Dropping schema...');
            const client = await pool.connect();

            try {
                // Drop views first
                await client.query('DROP VIEW IF EXISTS inventory_item_stock_summary CASCADE;');
                await client.query('DROP VIEW IF EXISTS v_organization_summary CASCADE;');
                await client.query('DROP VIEW IF EXISTS v_pending_invitations CASCADE;');
                await client.query('DROP VIEW IF EXISTS v_active_staff CASCADE;');

                // Drop tables in reverse order
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

                // Drop functions
                await client.query('DROP FUNCTION IF EXISTS current_org_id() CASCADE;');
                await client.query('DROP FUNCTION IF EXISTS validate_location_assignment() CASCADE;');
                await client.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');
                await client.query('DROP FUNCTION IF EXISTS set_audit_event_category() CASCADE;');
                await client.query('DROP FUNCTION IF EXISTS set_inventory_updated_at() CASCADE;');

                console.log('✅ Schema dropped successfully');
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Schema drop failed:', error.message);
            throw error;
        } finally {
            await pool.end();
        }
    }
};
