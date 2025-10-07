#!/usr/bin/env node

/**
 * Seed Default System Roles
 *
 * This script creates/updates all default system roles with proper permissions
 * Run this after database migration to populate default roles
 */

const { query } = require('../database/connection');
require('dotenv').config();

// Default System Roles with Complete Permission Sets
const DEFAULT_ROLES = [
  {
    key: 'PLATFORM_ADMIN',
    name: 'Platform Administrator',
    description: 'Nirmitee super-admin with full platform access. Can manage all organizations and system-level settings.',
    scope_level: 'PLATFORM',
    permissions: ['platform:*'],
    is_system: true,
  },
  {
    key: 'ORG_OWNER',
    name: 'Organization Owner',
    description: 'Complete control over the organization including billing, settings, and all clinical operations.',
    scope_level: 'ORG',
    permissions: [
      'org:*',
      'locations:*',
      'departments:*',
      'staff:*',
      'roles:*',
      'permissions:*',
      'settings:*',
      'patients:*',
      'appointments:*',
      'encounters:*',
      'observations:*',
      'diagnoses:*',
      'procedures:*',
      'medications:*',
      'allergies:*',
      'immunizations:*',
      'clinical_notes:*',
      'prescriptions:*',
      'lab_orders:*',
      'lab_results:*',
      'imaging_orders:*',
      'imaging_results:*',
      'reports:*',
      'billing:*',
      'invoices:*',
      'payments:*',
      'claims:*',
      'audit:*',
      'integrations:*',
      'notifications:*',
    ],
    is_system: true,
  },
  {
    key: 'ORG_ADMIN',
    name: 'Organization Administrator',
    description: 'Manage organization settings, locations, staff, and view all clinical data.',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'org:edit',
      'locations:*',
      'departments:*',
      'staff:*',
      'roles:read',
      'roles:edit',
      'settings:*',
      'patients:read',
      'appointments:read',
      'encounters:read',
      'reports:read',
      'reports:export',
      'billing:read',
      'audit:read',
    ],
    is_system: true,
  },
  {
    key: 'DOCTOR',
    name: 'Doctor',
    description: 'Full clinical access for physicians. Can diagnose, prescribe, order tests, and manage patient care.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:create',
      'patients:edit',
      'patient_demographics:*',
      'patient_history:read',
      'appointments:read',
      'appointments:create',
      'appointments:edit',
      'encounters:*',
      'observations:*',
      'diagnoses:*',
      'procedures:*',
      'medications:*',
      'allergies:*',
      'immunizations:*',
      'clinical_notes:*',
      'prescriptions:*',
      'lab_orders:*',
      'lab_results:read',
      'lab_results:approve',
      'imaging_orders:*',
      'imaging_results:read',
      'imaging_results:approve',
      'reports:read',
      'reports:print',
      'reports:send',
      'forms:*',
    ],
    is_system: true,
  },
  {
    key: 'CLINICIAN',
    name: 'Clinician',
    description: 'Clinical workflow access for general practitioners and specialists.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:create',
      'patients:edit',
      'patient_demographics:read',
      'patient_demographics:edit',
      'appointments:read',
      'appointments:edit',
      'encounters:*',
      'observations:*',
      'diagnoses:*',
      'procedures:*',
      'medications:read',
      'medications:create',
      'medications:submit',
      'allergies:*',
      'immunizations:*',
      'clinical_notes:*',
      'prescriptions:create',
      'prescriptions:submit',
      'prescriptions:print',
      'lab_orders:*',
      'lab_results:read',
      'imaging_orders:*',
      'imaging_results:read',
      'reports:read',
      'reports:print',
    ],
    is_system: true,
  },
  {
    key: 'NURSE',
    name: 'Nurse',
    description: 'Patient care and vitals management. Can record observations, administer medications, and assist doctors.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'patient_history:read',
      'appointments:read',
      'appointments:edit',
      'encounters:read',
      'encounters:edit',
      'observations:*',
      'medications:read',
      'medications:submit',
      'allergies:read',
      'allergies:edit',
      'immunizations:read',
      'immunizations:create',
      'clinical_notes:read',
      'clinical_notes:create',
      'prescriptions:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'forms:read',
      'forms:create',
    ],
    is_system: true,
  },
  {
    key: 'FRONT_DESK',
    name: 'Front Desk',
    description: 'Patient registration, appointment scheduling, and check-in/check-out.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:create',
      'patients:edit',
      'patient_demographics:*',
      'appointments:*',
      'encounters:read',
      'billing:read',
      'billing:create',
      'invoices:read',
      'invoices:create',
      'payments:read',
      'payments:create',
      'insurance:read',
      'reports:read',
      'reports:print',
    ],
    is_system: true,
  },
  {
    key: 'LAB_TECHNICIAN',
    name: 'Lab Technician',
    description: 'Laboratory order processing and result entry.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'lab_orders:read',
      'lab_results:create',
      'lab_results:edit',
      'lab_results:submit',
      'reports:read',
      'reports:print',
    ],
    is_system: true,
  },
  {
    key: 'RADIOLOGIST',
    name: 'Radiologist',
    description: 'Imaging order review and result reporting.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'patient_history:read',
      'imaging_orders:read',
      'imaging_results:create',
      'imaging_results:edit',
      'imaging_results:submit',
      'imaging_results:approve',
      'reports:read',
      'reports:create',
      'reports:print',
    ],
    is_system: true,
  },
  {
    key: 'PHARMACIST',
    name: 'Pharmacist',
    description: 'Medication dispensing and prescription verification.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'prescriptions:read',
      'prescriptions:approve',
      'prescriptions:reject',
      'prescriptions:print',
      'medications:read',
      'allergies:read',
      'reports:read',
      'reports:print',
    ],
    is_system: true,
  },
  {
    key: 'BILLING_CLERK',
    name: 'Billing Clerk',
    description: 'Billing, invoicing, and payment processing.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'appointments:read',
      'encounters:read',
      'billing:*',
      'invoices:*',
      'payments:*',
      'insurance:read',
      'insurance:edit',
      'claims:create',
      'claims:edit',
      'claims:submit',
      'reports:read',
      'reports:export',
      'reports:print',
    ],
    is_system: true,
  },
  {
    key: 'AUDITOR',
    name: 'Auditor',
    description: 'Read-only access for compliance, auditing, and reporting.',
    scope_level: 'ORG',
    permissions: [
      'audit:read',
      'org:read',
      'locations:read',
      'departments:read',
      'staff:read',
      'patients:read',
      'patient_demographics:read',
      'appointments:read',
      'encounters:read',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'clinical_notes:read',
      'prescriptions:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'billing:read',
      'invoices:read',
      'payments:read',
      'reports:read',
      'reports:export',
    ],
    is_system: true,
  },
  {
    key: 'VIEWER',
    name: 'Viewer',
    description: 'Basic read-only access to patient information.',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'appointments:read',
      'encounters:read',
      'observations:read',
      'reports:read',
    ],
    is_system: true,
  },
];

async function seedRoles() {
  console.log('==============================================');
  console.log('Seeding Default System Roles');
  console.log('==============================================\n');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    for (const role of DEFAULT_ROLES) {
      console.log(`Processing: ${role.name} (${role.key})`);
      console.log(`  Scope: ${role.scope_level}`);
      console.log(`  Permissions: ${role.permissions.length}`);

      try {
        // Check if role exists
        const existingRole = await query(
          'SELECT id, permissions FROM roles WHERE key = $1 AND is_system = true',
          [role.key]
        );

        if (existingRole.rows.length > 0) {
          // Update existing role
          await query(
            `UPDATE roles
             SET name = $1,
                 description = $2,
                 scope_level = $3,
                 permissions = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE key = $5 AND is_system = true`,
            [
              role.name,
              role.description,
              role.scope_level,
              JSON.stringify(role.permissions),
              role.key,
            ]
          );
          console.log('  ✓ Updated existing role\n');
          updated++;
        } else {
          // Insert new role
          await query(
            `INSERT INTO roles (key, name, description, scope_level, permissions, is_system)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              role.key,
              role.name,
              role.description,
              role.scope_level,
              JSON.stringify(role.permissions),
              role.is_system,
            ]
          );
          console.log('  ✓ Created new role\n');
          inserted++;
        }
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}\n`);
        skipped++;
      }
    }

    console.log('==============================================');
    console.log('Seeding Complete!');
    console.log('==============================================');
    console.log(`✓ Inserted: ${inserted}`);
    console.log(`✓ Updated: ${updated}`);
    console.log(`✗ Skipped: ${skipped}`);
    console.log(`Total: ${DEFAULT_ROLES.length}\n`);

    // Show summary
    const result = await query(
      'SELECT key, name, scope_level, jsonb_array_length(permissions) as perm_count FROM roles WHERE is_system = true ORDER BY name'
    );

    console.log('Current System Roles:');
    console.log('─────────────────────────────────────────────');
    result.rows.forEach(r => {
      console.log(`${r.name.padEnd(30)} | ${r.scope_level.padEnd(12)} | ${r.perm_count} permissions`);
    });
    console.log('─────────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run seeder
console.log('Starting role seeder...\n');
seedRoles();
