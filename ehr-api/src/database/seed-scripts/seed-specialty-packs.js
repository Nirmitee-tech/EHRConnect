#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

/**
 * Available Specialty Packs
 * These should match the modules registered in ehr-web/src/app/specialty-init.ts
 */
const SPECIALTY_PACKS = [
  {
    pack_slug: 'general',
    pack_version: '1.0.0',
    description: 'Primary Care & General Medicine',
    enabled_by_default: true,
  },
  {
    pack_slug: 'ob-gyn',
    pack_version: '1.0.0',
    description: 'Obstetrics, Gynecology & IVF',
    enabled_by_default: true,
  },
  {
    pack_slug: 'pediatrics',
    pack_version: '1.0.0',
    description: 'Pediatrics & Child Health',
    enabled_by_default: true,
  },
  {
    pack_slug: 'orthopedics',
    pack_version: '1.0.0',
    description: 'Orthopedic Surgery & Sports Medicine',
    enabled_by_default: false,
  },
  {
    pack_slug: 'dermatology',
    pack_version: '1.0.0',
    description: 'Dermatology & Skin Care',
    enabled_by_default: false,
  },
  {
    pack_slug: 'mental-health',
    pack_version: '1.0.0',
    description: 'Mental Health & Psychiatry',
    enabled_by_default: false,
  },
  {
    pack_slug: 'cardiology',
    pack_version: '1.0.0',
    description: 'Cardiology & Cardiovascular Care',
    enabled_by_default: false,
  },
  {
    pack_slug: 'wound-care',
    pack_version: '1.0.0',
    description: 'Wound Care & Hyperbaric Medicine',
    enabled_by_default: false,
  },
];

async function seedSpecialtyPacks() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding specialty pack settings...\n');

    await client.query('BEGIN');

    // Get all active organizations
    const orgsResult = await client.query(
      'SELECT id, name FROM organizations WHERE status = $1',
      ['active']
    );

    if (orgsResult.rows.length === 0) {
      console.log('⚠️  No active organizations found. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }

    console.log(`Found ${orgsResult.rows.length} active organization(s)\n`);

    // Get a default user for created_by/updated_by (preferably system or admin user)
    const userResult = await client.query(
      'SELECT id FROM users ORDER BY created_at LIMIT 1'
    );

    if (userResult.rows.length === 0) {
      console.log('⚠️  No users found in database. Cannot set created_by/updated_by.');
      await client.query('ROLLBACK');
      return;
    }

    const defaultUserId = userResult.rows[0].id;

    // Seed for each organization
    for (const org of orgsResult.rows) {
      console.log(`📦 Seeding specialty packs for: ${org.name}`);

      for (const pack of SPECIALTY_PACKS) {
        // Check if pack setting already exists
        const existingSetting = await client.query(
          'SELECT id, enabled FROM org_specialty_settings WHERE org_id = $1 AND pack_slug = $2',
          [org.id, pack.pack_slug]
        );

        if (existingSetting.rows.length > 0) {
          console.log(`   ⏭️  ${pack.pack_slug} - Already configured (enabled: ${existingSetting.rows[0].enabled})`);
          continue;
        }

        // Insert specialty pack setting
        const settingResult = await client.query(
          `INSERT INTO org_specialty_settings (
            org_id,
            pack_slug,
            pack_version,
            enabled,
            scope,
            scope_ref_id,
            overrides,
            created_by,
            updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id`,
          [
            org.id,
            pack.pack_slug,
            pack.pack_version,
            pack.enabled_by_default,
            'org', // Organization-wide scope
            null, // No specific location/department
            {}, // No overrides by default
            defaultUserId,
            defaultUserId,
          ]
        );

        const settingId = settingResult.rows[0].id;
        console.log(`   ✅ ${pack.pack_slug} - Enabled (${pack.description})`);

        // Create audit trail entry
        await client.query(
          `INSERT INTO specialty_pack_audits (
            org_id,
            pack_slug,
            pack_version,
            action,
            actor_id,
            scope,
            scope_ref_id,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            org.id,
            pack.pack_slug,
            pack.pack_version,
            'enabled',
            defaultUserId,
            'org',
            null,
            {
              setting_id: settingId,
              seeded_at: new Date().toISOString(),
              description: pack.description,
              reason: 'Initial specialty pack configuration via seed script',
            },
          ]
        );

        console.log(`      → Audit trail created`);
      }

      console.log('');
    }

    await client.query('COMMIT');
    console.log('✅ Specialty packs seeded successfully!\n');

    // Summary
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM org_specialty_settings) as settings,
        (SELECT COUNT(*) FROM org_specialty_settings WHERE enabled = true) as enabled,
        (SELECT COUNT(*) FROM specialty_pack_audits) as audit_entries
    `);

    console.log('📊 Summary:');
    console.log(`   Specialty Pack Settings: ${stats.rows[0].settings}`);
    console.log(`   Enabled Packs: ${stats.rows[0].enabled}`);
    console.log(`   Audit Trail Entries: ${stats.rows[0].audit_entries}`);

    // Show enabled packs per organization
    console.log('\n📋 Enabled Specialty Packs by Organization:');
    const enabledPacks = await client.query(`
      SELECT
        o.name as org_name,
        s.pack_slug,
        s.pack_version,
        s.scope,
        s.enabled
      FROM org_specialty_settings s
      JOIN organizations o ON s.org_id = o.id
      WHERE s.enabled = true
      ORDER BY o.name, s.pack_slug
    `);

    let currentOrg = null;
    for (const row of enabledPacks.rows) {
      if (currentOrg !== row.org_name) {
        currentOrg = row.org_name;
        console.log(`\n   ${currentOrg}:`);
      }
      console.log(`      • ${row.pack_slug} (v${row.pack_version}) - ${row.scope} scope`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding specialty packs:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedSpecialtyPacks()
    .then(() => {
      console.log('\n🎉 Specialty pack seed completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Specialty pack seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSpecialtyPacks };
