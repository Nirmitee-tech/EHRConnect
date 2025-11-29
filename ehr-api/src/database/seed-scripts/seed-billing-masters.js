const CPT_CODES = [
  {
    code: '99213',
    description: 'Office or other outpatient visit for the evaluation and management of an established patient, low complexity',
    category: 'Evaluation & Management',
    modifier_allowed: true,
    version: '2024'
  },
  {
    code: '99214',
    description: 'Office or other outpatient visit for the evaluation and management of an established patient, moderate complexity',
    category: 'Evaluation & Management',
    modifier_allowed: true,
    version: '2024'
  },
  {
    code: '93000',
    description: 'Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report',
    category: 'Cardiology',
    modifier_allowed: true,
    version: '2024'
  },
  {
    code: '81002',
    description: 'Urinalysis; by dip stick or tablet reagent for bilirubin, glucose, hemoglobin, ketones, leukocytes, nitrite, pH, protein, specific gravity, urobilinogen, any number of these constituents; non-automated, without microscopy',
    category: 'Laboratory',
    modifier_allowed: false,
    version: '2024'
  }
];

const ICD_CODES = [
  {
    code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    category: 'Endocrine, nutritional and metabolic diseases'
  },
  {
    code: 'I10',
    description: 'Essential (primary) hypertension',
    category: 'Diseases of the circulatory system'
  },
  {
    code: 'J06.9',
    description: 'Acute upper respiratory infection, unspecified',
    category: 'Diseases of the respiratory system'
  },
  {
    code: 'M54.5',
    description: 'Low back pain',
    category: 'Diseases of the musculoskeletal system'
  }
];

const MODIFIERS = [
  {
    code: '25',
    description: 'Significant, separately identifiable evaluation and management service by the same physician on the same day of the procedure or other service',
    modifier_type: 'CPT'
  },
  {
    code: '59',
    description: 'Distinct procedural service',
    modifier_type: 'CPT'
  },
  {
    code: 'GT',
    description: 'Via interactive audio and video telecommunication systems',
    modifier_type: 'HCPCS'
  }
];

const PAYERS = [
  {
    name: 'Centers for Medicare & Medicaid Services',
    payer_id: 'CMS001',
    payer_type: 'medicare',
    claim_submission_method: 'electronic',
    requires_prior_auth: true,
    era_supported: true,
    address: {
      line: ['7500 Security Blvd'],
      city: 'Baltimore',
      state: 'MD',
      postalCode: '21244',
      country: 'US'
    },
    contact_email: 'support@cms.gov',
    contact_phone: '+1-800-633-4227'
  },
  {
    name: 'Blue Cross Blue Shield',
    payer_id: 'BCBS001',
    payer_type: 'commercial',
    claim_submission_method: 'electronic',
    requires_prior_auth: true,
    era_supported: true,
    address: {
      line: ['225 North Michigan Ave'],
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'US'
    },
    contact_email: 'edi-support@bcbs.com',
    contact_phone: '+1-800-676-2583'
  },
  {
    name: 'Aetna',
    payer_id: 'AET001',
    payer_type: 'commercial',
    claim_submission_method: 'electronic',
    requires_prior_auth: false,
    era_supported: true,
    address: {
      line: ['151 Farmington Ave'],
      city: 'Hartford',
      state: 'CT',
      postalCode: '06156',
      country: 'US'
    },
    contact_email: 'edi@aetna.com',
    contact_phone: '+1-800-624-0756'
  }
];

const FEE_SCHEDULES = [
  {
    cpt_code: '99213',
    amount: 95.0,
    payer_id: null,
    metadata: { description: 'Default office visit (established patient)' }
  },
  {
    cpt_code: '99213',
    amount: 85.0,
    payer_id: 'CMS001',
    metadata: { description: 'Medicare physician fee schedule' }
  },
  {
    cpt_code: '99214',
    amount: 140.0,
    payer_id: null,
    metadata: { description: 'Default moderate-complexity visit' }
  },
  {
    cpt_code: '93000',
    amount: 60.0,
    payer_id: null,
    metadata: { description: 'Default ECG with interpretation' }
  },
  {
    cpt_code: '93000',
    amount: 55.0,
    payer_id: 'CMS001',
    metadata: { description: 'Medicare ECG rate' }
  },
  {
    cpt_code: '81002',
    amount: 15.0,
    payer_id: null,
    metadata: { description: 'Default urinalysis dipstick' }
  }
];

const EFFECTIVE_FROM = '2024-01-01';

async function seedCptCodes(pool) {
  console.log('🧾 Seeding CPT codes...');

  for (const cpt of CPT_CODES) {
    await pool.query(
      `INSERT INTO billing_cpt_codes (code, description, category, modifier_allowed, version, active, effective_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6::date, NOW())
       ON CONFLICT (code) DO UPDATE
         SET description = EXCLUDED.description,
             category = EXCLUDED.category,
             modifier_allowed = EXCLUDED.modifier_allowed,
             version = EXCLUDED.version,
             active = true,
             updated_at = NOW()`,
      [
        cpt.code,
        cpt.description,
        cpt.category,
        cpt.modifier_allowed,
        cpt.version,
        EFFECTIVE_FROM
      ]
    );
  }

  console.log(`✅ Seeded ${CPT_CODES.length} CPT codes.`);
}

async function seedIcdCodes(pool) {
  console.log('📚 Seeding ICD codes...');

  for (const icd of ICD_CODES) {
    await pool.query(
      `INSERT INTO billing_icd_codes (code, description, category, icd_version, active, effective_date, updated_at)
       VALUES ($1, $2, $3, 'ICD-10', true, $4::date, NOW())
       ON CONFLICT (code) DO UPDATE
         SET description = EXCLUDED.description,
             category = EXCLUDED.category,
             active = true,
             updated_at = NOW()`,
      [icd.code, icd.description, icd.category, EFFECTIVE_FROM]
    );
  }

  console.log(`✅ Seeded ${ICD_CODES.length} ICD-10 codes.`);
}

async function seedModifiers(pool) {
  console.log('🔖 Seeding billing modifiers...');

  for (const modifier of MODIFIERS) {
    await pool.query(
      `INSERT INTO billing_modifiers (code, description, modifier_type, active, updated_at)
       VALUES ($1, $2, $3, true, NOW())
       ON CONFLICT (code) DO UPDATE
         SET description = EXCLUDED.description,
             modifier_type = EXCLUDED.modifier_type,
             active = true,
             updated_at = NOW()`,
      [modifier.code, modifier.description, modifier.modifier_type]
    );
  }

  console.log(`✅ Seeded ${MODIFIERS.length} modifiers.`);
}

async function seedPayers(pool) {
  console.log('🏦 Seeding payers...');

  const payerMap = new Map();

  for (const payer of PAYERS) {
    const result = await pool.query(
      `INSERT INTO billing_payers (
         name, payer_id, payer_type, address, contact_email, contact_phone,
         claim_submission_method, requires_prior_auth, era_supported, active, settings, metadata, updated_at
       )
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, true, '{}'::jsonb, '{}'::jsonb, NOW())
       ON CONFLICT (payer_id) DO UPDATE
         SET name = EXCLUDED.name,
             payer_type = EXCLUDED.payer_type,
             address = EXCLUDED.address,
             contact_email = EXCLUDED.contact_email,
             contact_phone = EXCLUDED.contact_phone,
             claim_submission_method = EXCLUDED.claim_submission_method,
             requires_prior_auth = EXCLUDED.requires_prior_auth,
             era_supported = EXCLUDED.era_supported,
             active = true,
             updated_at = NOW()
       RETURNING id, payer_id`,
      [
        payer.name,
        payer.payer_id,
        payer.payer_type,
        JSON.stringify(payer.address),
        payer.contact_email,
        payer.contact_phone,
        payer.claim_submission_method,
        payer.requires_prior_auth,
        payer.era_supported
      ]
    );

    const { id, payer_id } = result.rows[0];
    payerMap.set(payer_id, id);
  }

  console.log(`✅ Seeded ${payerMap.size} payers.`);
  return payerMap;
}

async function seedFeeSchedules(pool, payerMap) {
  console.log('💵 Seeding fee schedules...');

  const { rows: organizations } = await pool.query('SELECT id, name FROM organizations ORDER BY name');

  if (organizations.length === 0) {
    console.log('⚠️  No organizations found. Skipping fee schedule seeding.');
    return;
  }

  for (const org of organizations) {
    console.log(`  • Processing organization: ${org.name}`);

    for (const schedule of FEE_SCHEDULES) {
      const payerId = schedule.payer_id ? payerMap.get(schedule.payer_id) : null;

      await pool.query(
        `INSERT INTO billing_fee_schedules (org_id, payer_id, cpt_code, amount, effective_from, active, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5::date, true, $6::jsonb, NOW(), NOW())
         ON CONFLICT (org_id, payer_id, cpt_code, effective_from) DO UPDATE
           SET amount = EXCLUDED.amount,
               active = true,
               metadata = EXCLUDED.metadata,
               updated_at = NOW()`,
        [
          org.id,
          payerId || null,
          schedule.cpt_code,
          schedule.amount,
          EFFECTIVE_FROM,
          JSON.stringify(schedule.metadata || {})
        ]
      );
    }
  }

  console.log('✅ Fee schedules seeded for all organizations.');
}

async function seedBillingMasters(pool) {
  console.log('\n🚀 Starting billing master seeding...');
  await seedCptCodes(pool);
  await seedIcdCodes(pool);
  await seedModifiers(pool);
  const payerMap = await seedPayers(pool);
  await seedFeeSchedules(pool, payerMap);
  console.log('🎉 Billing master data seeding completed!\n');
}

module.exports = {
  seedBillingMasters
};
