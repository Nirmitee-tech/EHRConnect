'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the first organization to seed departments
    const [organizations] = await queryInterface.sequelize.query(
      `SELECT id FROM organizations LIMIT 1`
    );

    if (organizations.length === 0) {
      console.log('No organizations found. Skipping department seeding.');
      return;
    }

    const orgId = organizations[0].id;

    // Common healthcare departments
    const departments = [
      {
        name: 'Emergency Department',
        code: 'ER',
        department_type: 'emergency',
        org_id: orgId,
      },
      {
        name: 'Outpatient Department',
        code: 'OPD',
        department_type: 'opd',
        org_id: orgId,
      },
      {
        name: 'Inpatient Department',
        code: 'IPD',
        department_type: 'ipd',
        org_id: orgId,
      },
      {
        name: 'Intensive Care Unit',
        code: 'ICU',
        department_type: 'icu',
        org_id: orgId,
      },
      {
        name: 'Laboratory',
        code: 'LAB',
        department_type: 'lab',
        org_id: orgId,
      },
      {
        name: 'Radiology',
        code: 'RAD',
        department_type: 'radiology',
        org_id: orgId,
      },
      {
        name: 'Pharmacy',
        code: 'PHARM',
        department_type: 'pharmacy',
        org_id: orgId,
      },
      {
        name: 'Billing Department',
        code: 'BILL',
        department_type: 'admin',
        org_id: orgId,
      },
      {
        name: 'Medical Records',
        code: 'MR',
        department_type: 'admin',
        org_id: orgId,
      },
      {
        name: 'Surgery',
        code: 'SURG',
        department_type: 'surgery',
        org_id: orgId,
      },
    ];

    // Check if departments already exist
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM departments WHERE org_id = '${orgId}'`
    );

    if (existing[0].count > 0) {
      console.log('Departments already exist. Skipping seeding.');
      return;
    }

    // Insert departments
    for (const dept of departments) {
      await queryInterface.sequelize.query(`
        INSERT INTO departments (org_id, name, code, department_type, active, created_at, updated_at)
        VALUES (
          '${dept.org_id}',
          '${dept.name}',
          '${dept.code}',
          '${dept.department_type}',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING
      `);
    }

    console.log(`✅ Seeded ${departments.length} departments for organization ${orgId}`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM departments WHERE department_type IN ('emergency', 'opd', 'ipd', 'icu', 'lab', 'radiology', 'pharmacy', 'admin', 'surgery')
    `);
  }
};
