const { Pool } = require('pg');
require('dotenv').config();

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

async function seedLocations() {
  console.log('🏥 Seeding default locations...');

  try {
    // Get all organizations
    const { rows: orgs } = await pool.query('SELECT id, name FROM organizations');

    if (orgs.length === 0) {
      console.log('⚠️  No organizations found. Please create organizations first.');
      return;
    }

    const locations = [
      {
        name: 'Main Facility',
        code: 'MAIN01',
        location_type: 'clinic',
        address: {
          line: ['123 Healthcare Blvd'],
          city: 'Medical City',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        },
        timezone: 'America/Los_Angeles',
        contact_email: 'main@healthcare.com',
        contact_phone: '+1-555-123-4567'
      },
      {
        name: 'Pharmacy',
        code: 'PHARM01',
        location_type: 'pharmacy',
        address: {
          line: ['123 Healthcare Blvd', 'Building B'],
          city: 'Medical City',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        },
        timezone: 'America/Los_Angeles',
        contact_email: 'pharmacy@healthcare.com',
        contact_phone: '+1-555-123-4568'
      },
      {
        name: 'Diagnostic Center',
        code: 'DIAG01',
        location_type: 'diagnostic_center',
        address: {
          line: ['125 Healthcare Blvd'],
          city: 'Medical City',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        },
        timezone: 'America/Los_Angeles',
        contact_email: 'diagnostics@healthcare.com',
        contact_phone: '+1-555-123-4569'
      }
    ];

    for (const org of orgs) {
      console.log(`  Creating locations for: ${org.name}`);

      for (const location of locations) {
        // Check if location already exists
        const { rows: existing } = await pool.query(
          'SELECT id FROM locations WHERE org_id = $1 AND code = $2',
          [org.id, location.code]
        );

        if (existing.length > 0) {
          console.log(`    ⏭️  ${location.name} already exists`);
          continue;
        }

        await pool.query(
          `INSERT INTO locations (org_id, name, code, location_type, address, timezone, contact_email, contact_phone, active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
          [
            org.id,
            location.name,
            location.code,
            location.location_type,
            JSON.stringify(location.address),
            location.timezone,
            location.contact_email,
            location.contact_phone
          ]
        );

        console.log(`    ✅ Created: ${location.name}`);
      }
    }

    console.log('✅ Locations seeded successfully\n');
  } catch (error) {
    console.error('❌ Error seeding locations:', error.message);
    throw error;
  }
}

async function seedInventoryCategories() {
  console.log('📦 Seeding inventory categories...');

  try {
    // Get all organizations
    const { rows: orgs } = await pool.query('SELECT id, name FROM organizations');

    const categories = [
      {
        name: 'Medications',
        description: 'Pharmaceutical drugs and medications'
      },
      {
        name: 'Medical Supplies',
        description: 'General medical supplies and consumables'
      },
      {
        name: 'Surgical Instruments',
        description: 'Surgical tools and instruments'
      },
      {
        name: 'Laboratory Supplies',
        description: 'Lab equipment and testing supplies'
      },
      {
        name: 'Personal Protective Equipment',
        description: 'PPE including masks, gloves, gowns'
      },
      {
        name: 'Diagnostic Equipment',
        description: 'Diagnostic tools and equipment'
      },
      {
        name: 'Wound Care',
        description: 'Bandages, dressings, and wound care supplies'
      },
      {
        name: 'IV Supplies',
        description: 'Intravenous supplies and equipment'
      }
    ];

    for (const org of orgs) {
      console.log(`  Creating categories for: ${org.name}`);

      for (const category of categories) {
        // Check if category already exists
        const { rows: existing } = await pool.query(
          'SELECT id FROM inventory_categories WHERE org_id = $1 AND LOWER(name) = LOWER($2)',
          [org.id, category.name]
        );

        if (existing.length > 0) {
          console.log(`    ⏭️  ${category.name} already exists`);
          continue;
        }

        await pool.query(
          `INSERT INTO inventory_categories (org_id, name, description, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, true, NOW(), NOW())`,
          [org.id, category.name, category.description]
        );

        console.log(`    ✅ Created: ${category.name}`);
      }
    }

    console.log('✅ Inventory categories seeded successfully\n');
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    throw error;
  }
}

async function seedSuppliers() {
  console.log('🚚 Seeding suppliers...');

  try {
    // Get all organizations
    const { rows: orgs } = await pool.query('SELECT id, name FROM organizations');

    const suppliers = [
      {
        name: 'MedSupply Corp',
        code: 'MEDSUP001',
        contact_name: 'John Smith',
        contact_phone: '+1-555-234-5678',
        contact_email: 'orders@medsupply.com',
        address: {
          line: ['456 Supply Ave'],
          city: 'Supply City',
          state: 'CA',
          postalCode: '90211',
          country: 'US'
        },
        notes: 'Primary medical supplies vendor'
      },
      {
        name: 'PharmaDirect',
        code: 'PHARM001',
        contact_name: 'Sarah Johnson',
        contact_phone: '+1-555-345-6789',
        contact_email: 'orders@pharmadirect.com',
        address: {
          line: ['789 Pharma Blvd'],
          city: 'Pharma City',
          state: 'CA',
          postalCode: '90212',
          country: 'US'
        },
        notes: 'Pharmaceutical supplier'
      },
      {
        name: 'LabEquip Solutions',
        code: 'LABEQUIP001',
        contact_name: 'Michael Davis',
        contact_phone: '+1-555-456-7890',
        contact_email: 'sales@labequip.com',
        address: {
          line: ['321 Lab Street'],
          city: 'Tech City',
          state: 'CA',
          postalCode: '90213',
          country: 'US'
        },
        notes: 'Laboratory equipment and supplies'
      }
    ];

    for (const org of orgs) {
      console.log(`  Creating suppliers for: ${org.name}`);

      for (const supplier of suppliers) {
        // Check if supplier already exists
        const { rows: existing } = await pool.query(
          'SELECT id FROM inventory_suppliers WHERE org_id = $1 AND code = $2',
          [org.id, supplier.code]
        );

        if (existing.length > 0) {
          console.log(`    ⏭️  ${supplier.name} already exists`);
          continue;
        }

        await pool.query(
          `INSERT INTO inventory_suppliers (org_id, name, code, contact_name, contact_phone, contact_email, address, notes, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())`,
          [
            org.id,
            supplier.name,
            supplier.code,
            supplier.contact_name,
            supplier.contact_phone,
            supplier.contact_email,
            JSON.stringify(supplier.address),
            supplier.notes
          ]
        );

        console.log(`    ✅ Created: ${supplier.name}`);
      }
    }

    console.log('✅ Suppliers seeded successfully\n');
  } catch (error) {
    console.error('❌ Error seeding suppliers:', error.message);
    throw error;
  }
}

async function seedAll() {
  console.log('🌱 Starting inventory masters seed...\n');

  try {
    await seedLocations();
    await seedInventoryCategories();
    await seedSuppliers();

    console.log('✨ All inventory masters seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedAll();
