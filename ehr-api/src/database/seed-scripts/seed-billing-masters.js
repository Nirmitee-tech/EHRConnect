const CPT_CODES = [
  // Evaluation & Management
  { code: '99201', description: 'Office visit, new patient, straightforward', category: 'Evaluation & Management', short_description: 'New patient visit - straightforward', modifier_allowed: true, version: '2024', rvu_work: 0.93, rvu_facility: 1.45 },
  { code: '99202', description: 'Office visit, new patient, low complexity', category: 'Evaluation & Management', short_description: 'New patient visit - low', modifier_allowed: true, version: '2024', rvu_work: 1.6, rvu_facility: 2.43 },
  { code: '99203', description: 'Office visit, new patient, moderate complexity', category: 'Evaluation & Management', short_description: 'New patient visit - moderate', modifier_allowed: true, version: '2024', rvu_work: 2.6, rvu_facility: 3.5 },
  { code: '99204', description: 'Office visit, new patient, moderate to high complexity', category: 'Evaluation & Management', short_description: 'New patient visit - mod/high', modifier_allowed: true, version: '2024', rvu_work: 3.76, rvu_facility: 4.94 },
  { code: '99205', description: 'Office visit, new patient, high complexity', category: 'Evaluation & Management', short_description: 'New patient visit - high', modifier_allowed: true, version: '2024', rvu_work: 5.09, rvu_facility: 6.56 },
  { code: '99211', description: 'Office visit, established patient, minimal', category: 'Evaluation & Management', short_description: 'Established patient - minimal', modifier_allowed: true, version: '2024', rvu_work: 0.18, rvu_facility: 0.61 },
  { code: '99212', description: 'Office visit, established patient, straightforward', category: 'Evaluation & Management', short_description: 'Established patient - straightforward', modifier_allowed: true, version: '2024', rvu_work: 0.7, rvu_facility: 1.3 },
  { code: '99213', description: 'Office visit, established patient, low complexity', category: 'Evaluation & Management', short_description: 'Established patient - low', modifier_allowed: true, version: '2024', rvu_work: 1.3, rvu_facility: 1.92 },
  { code: '99214', description: 'Office visit, established patient, moderate complexity', category: 'Evaluation & Management', short_description: 'Established patient - moderate', modifier_allowed: true, version: '2024', rvu_work: 1.92, rvu_facility: 2.8 },
  { code: '99215', description: 'Office visit, established patient, high complexity', category: 'Evaluation & Management', short_description: 'Established patient - high', modifier_allowed: true, version: '2024', rvu_work: 2.8, rvu_facility: 3.86 },
  
  // Emergency Department
  { code: '99281', description: 'Emergency dept visit, self-limited/minor', category: 'Emergency', short_description: 'ED visit - minor', modifier_allowed: true, version: '2024' },
  { code: '99282', description: 'Emergency dept visit, low to moderately severe', category: 'Emergency', short_description: 'ED visit - low/mod', modifier_allowed: true, version: '2024' },
  { code: '99283', description: 'Emergency dept visit, moderate severity', category: 'Emergency', short_description: 'ED visit - moderate', modifier_allowed: true, version: '2024' },
  { code: '99284', description: 'Emergency dept visit, high severity', category: 'Emergency', short_description: 'ED visit - high', modifier_allowed: true, version: '2024' },
  { code: '99285', description: 'Emergency dept visit, high severity with threat', category: 'Emergency', short_description: 'ED visit - critical', modifier_allowed: true, version: '2024' },
  
  // Procedures
  { code: '10060', description: 'Incision and drainage of abscess', category: 'Surgery', short_description: 'I&D abscess', subcategory: 'Skin', modifier_allowed: true, version: '2024' },
  { code: '12001', description: 'Simple repair of superficial wounds', category: 'Surgery', short_description: 'Simple wound repair', subcategory: 'Integumentary', modifier_allowed: true, version: '2024' },
  { code: '29515', description: 'Application of short leg splint', category: 'Surgery', short_description: 'Short leg splint', subcategory: 'Musculoskeletal', modifier_allowed: true, version: '2024' },
  
  // Cardiology
  { code: '93000', description: 'Electrocardiogram, complete', category: 'Cardiology', short_description: 'ECG complete', modifier_allowed: true, version: '2024' },
  { code: '93005', description: 'Electrocardiogram, tracing only', category: 'Cardiology', short_description: 'ECG tracing', modifier_allowed: false, version: '2024' },
  { code: '93010', description: 'Electrocardiogram, interpretation only', category: 'Cardiology', short_description: 'ECG interpretation', modifier_allowed: false, version: '2024' },
  
  // Laboratory
  { code: '80053', description: 'Comprehensive metabolic panel', category: 'Laboratory', short_description: 'CMP', modifier_allowed: false, version: '2024' },
  { code: '80061', description: 'Lipid panel', category: 'Laboratory', short_description: 'Lipid panel', modifier_allowed: false, version: '2024' },
  { code: '81001', description: 'Urinalysis, automated with microscopy', category: 'Laboratory', short_description: 'Urinalysis automated', modifier_allowed: false, version: '2024' },
  { code: '81002', description: 'Urinalysis, non-automated without microscopy', category: 'Laboratory', short_description: 'Urinalysis basic', modifier_allowed: false, version: '2024' },
  { code: '85025', description: 'Complete blood count with differential', category: 'Laboratory', short_description: 'CBC with diff', modifier_allowed: false, version: '2024' },
  { code: '85027', description: 'Complete blood count, automated', category: 'Laboratory', short_description: 'CBC automated', modifier_allowed: false, version: '2024' },
  
  // Radiology
  { code: '70450', description: 'CT scan head/brain without contrast', category: 'Radiology', short_description: 'CT head w/o contrast', subcategory: 'CT', modifier_allowed: true, version: '2024' },
  { code: '71020', description: 'Chest x-ray, 2 views', category: 'Radiology', short_description: 'Chest x-ray 2 views', subcategory: 'X-Ray', modifier_allowed: true, version: '2024' },
  { code: '71045', description: 'Chest x-ray, single view', category: 'Radiology', short_description: 'Chest x-ray 1 view', subcategory: 'X-Ray', modifier_allowed: true, version: '2024' },
  { code: '72110', description: 'X-ray spine, lumbosacral, minimum 4 views', category: 'Radiology', short_description: 'Lumbar spine x-ray', subcategory: 'X-Ray', modifier_allowed: true, version: '2024' },
  { code: '73070', description: 'X-ray elbow, 2 views', category: 'Radiology', short_description: 'Elbow x-ray', subcategory: 'X-Ray', modifier_allowed: true, version: '2024' },
  { code: '73610', description: 'X-ray ankle, complete, minimum 3 views', category: 'Radiology', short_description: 'Ankle x-ray complete', subcategory: 'X-Ray', modifier_allowed: true, version: '2024' }
];

const ICD_CODES = [
  // Diabetes
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', short_description: 'Type 2 diabetes NOS', category: 'Endocrine, nutritional and metabolic diseases', chapter: 'IV', is_billable: true },
  { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', short_description: 'Type 2 DM w/ hyperglycemia', category: 'Endocrine, nutritional and metabolic diseases', chapter: 'IV', is_billable: true },
  { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', short_description: 'Type 1 diabetes NOS', category: 'Endocrine, nutritional and metabolic diseases', chapter: 'IV', is_billable: true },
  
  // Hypertension
  { code: 'I10', description: 'Essential (primary) hypertension', short_description: 'Essential hypertension', category: 'Diseases of the circulatory system', chapter: 'IX', is_billable: true },
  { code: 'I11.0', description: 'Hypertensive heart disease with heart failure', short_description: 'HTN heart disease w/ CHF', category: 'Diseases of the circulatory system', chapter: 'IX', is_billable: true },
  
  // Respiratory
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', short_description: 'Upper resp infection NOS', category: 'Diseases of the respiratory system', chapter: 'X', is_billable: true },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', short_description: 'Pneumonia NOS', category: 'Diseases of the respiratory system', chapter: 'X', is_billable: true },
  { code: 'J20.9', description: 'Acute bronchitis, unspecified', short_description: 'Acute bronchitis NOS', category: 'Diseases of the respiratory system', chapter: 'X', is_billable: true },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', short_description: 'Asthma NOS', category: 'Diseases of the respiratory system', chapter: 'X', is_billable: true },
  
  // Musculoskeletal
  { code: 'M54.5', description: 'Low back pain', short_description: 'Low back pain', category: 'Diseases of the musculoskeletal system', chapter: 'XIII', is_billable: true },
  { code: 'M25.511', description: 'Pain in right shoulder', short_description: 'Right shoulder pain', category: 'Diseases of the musculoskeletal system', chapter: 'XIII', is_billable: true },
  { code: 'M25.561', description: 'Pain in right knee', short_description: 'Right knee pain', category: 'Diseases of the musculoskeletal system', chapter: 'XIII', is_billable: true },
  { code: 'M79.1', description: 'Myalgia', short_description: 'Muscle pain', category: 'Diseases of the musculoskeletal system', chapter: 'XIII', is_billable: true },
  
  // Cardiovascular
  { code: 'I50.9', description: 'Heart failure, unspecified', short_description: 'Heart failure NOS', category: 'Diseases of the circulatory system', chapter: 'IX', is_billable: true },
  { code: 'I25.10', description: 'Atherosclerotic heart disease without angina pectoris', short_description: 'CAD w/o angina', category: 'Diseases of the circulatory system', chapter: 'IX', is_billable: true },
  
  // GI
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', short_description: 'GERD', category: 'Diseases of the digestive system', chapter: 'XI', is_billable: true },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', short_description: 'Gastritis w/o bleeding', category: 'Diseases of the digestive system', chapter: 'XI', is_billable: true },
  { code: 'K59.00', description: 'Constipation, unspecified', short_description: 'Constipation NOS', category: 'Diseases of the digestive system', chapter: 'XI', is_billable: true },
  
  // Mental Health
  { code: 'F41.1', description: 'Generalized anxiety disorder', short_description: 'GAD', category: 'Mental and behavioral disorders', chapter: 'V', is_billable: true },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', short_description: 'Depression NOS', category: 'Mental and behavioral disorders', chapter: 'V', is_billable: true },
  
  // General
  { code: 'R50.9', description: 'Fever, unspecified', short_description: 'Fever NOS', category: 'Symptoms, signs', chapter: 'XVIII', is_billable: true },
  { code: 'R07.9', description: 'Chest pain, unspecified', short_description: 'Chest pain NOS', category: 'Symptoms, signs', chapter: 'XVIII', is_billable: true },
  { code: 'R51', description: 'Headache', short_description: 'Headache', category: 'Symptoms, signs', chapter: 'XVIII', is_billable: true },
  { code: 'R10.9', description: 'Unspecified abdominal pain', short_description: 'Abdominal pain NOS', category: 'Symptoms, signs', chapter: 'XVIII', is_billable: true }
];

const MODIFIERS = [
  // Evaluation & Management Modifiers
  { code: '25', description: 'Significant, separately identifiable evaluation and management service by the same physician on the same day of the procedure or other service', modifier_type: 'CPT' },
  { code: '57', description: 'Decision for surgery', modifier_type: 'CPT' },
  
  // Procedural Modifiers
  { code: '50', description: 'Bilateral procedure', modifier_type: 'CPT' },
  { code: '51', description: 'Multiple procedures', modifier_type: 'CPT' },
  { code: '52', description: 'Reduced services', modifier_type: 'CPT' },
  { code: '53', description: 'Discontinued procedure', modifier_type: 'CPT' },
  { code: '59', description: 'Distinct procedural service', modifier_type: 'CPT' },
  
  // Anatomical Modifiers
  { code: 'LT', description: 'Left side', modifier_type: 'HCPCS' },
  { code: 'RT', description: 'Right side', modifier_type: 'HCPCS' },
  { code: 'E1', description: 'Upper left eyelid', modifier_type: 'HCPCS' },
  { code: 'E2', description: 'Lower left eyelid', modifier_type: 'HCPCS' },
  { code: 'E3', description: 'Upper right eyelid', modifier_type: 'HCPCS' },
  { code: 'E4', description: 'Lower right eyelid', modifier_type: 'HCPCS' },
  { code: 'F1', description: 'Left hand, second digit', modifier_type: 'HCPCS' },
  { code: 'F2', description: 'Left hand, third digit', modifier_type: 'HCPCS' },
  { code: 'F3', description: 'Left hand, fourth digit', modifier_type: 'HCPCS' },
  { code: 'F4', description: 'Left hand, fifth digit', modifier_type: 'HCPCS' },
  { code: 'F5', description: 'Right hand, thumb', modifier_type: 'HCPCS' },
  
  // Provider Modifiers
  { code: '76', description: 'Repeat procedure by same physician', modifier_type: 'CPT' },
  { code: '77', description: 'Repeat procedure by another physician', modifier_type: 'CPT' },
  { code: '78', description: 'Unplanned return to OR', modifier_type: 'CPT' },
  { code: '79', description: 'Unrelated procedure during postoperative period', modifier_type: 'CPT' },
  { code: 'AS', description: 'Physician assistant, nurse practitioner, or clinical nurse specialist services', modifier_type: 'HCPCS' },
  
  // Anesthesia Modifiers
  { code: 'AA', description: 'Anesthesia services personally furnished by anesthesiologist', modifier_type: 'anesthesia' },
  { code: 'AD', description: 'Medical supervision by physician: more than 4 concurrent procedures', modifier_type: 'anesthesia' },
  { code: 'QK', description: 'Medical direction of 2, 3, or 4 concurrent anesthesia procedures', modifier_type: 'anesthesia' },
  { code: 'QX', description: 'CRNA service with medical direction by physician', modifier_type: 'anesthesia' },
  { code: 'QY', description: 'Medical direction of 1 CRNA', modifier_type: 'anesthesia' },
  { code: 'QZ', description: 'CRNA service without medical direction', modifier_type: 'anesthesia' },
  
  // Telehealth/Telemedicine
  { code: 'GT', description: 'Via interactive audio and video telecommunication systems', modifier_type: 'HCPCS' },
  { code: 'GQ', description: 'Via asynchronous telecommunications system', modifier_type: 'HCPCS' },
  { code: '95', description: 'Synchronous telemedicine service', modifier_type: 'CPT' },
  
  // Other Common Modifiers
  { code: '22', description: 'Increased procedural services', modifier_type: 'CPT' },
  { code: '26', description: 'Professional component', modifier_type: 'CPT' },
  { code: 'TC', description: 'Technical component', modifier_type: 'HCPCS' },
  { code: '80', description: 'Assistant surgeon', modifier_type: 'CPT' },
  { code: '81', description: 'Minimum assistant surgeon', modifier_type: 'CPT' },
  { code: '82', description: 'Assistant surgeon when qualified resident not available', modifier_type: 'CPT' },
  { code: '91', description: 'Repeat clinical diagnostic laboratory test', modifier_type: 'CPT' }
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
      `INSERT INTO billing_cpt_codes (code, description, short_description, category, subcategory, modifier_allowed, 
        version, active, effective_date, rvu_work, rvu_facility, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8::date, $9, $10, NOW())
       ON CONFLICT (code) DO UPDATE
         SET description = EXCLUDED.description,
             short_description = EXCLUDED.short_description,
             category = EXCLUDED.category,
             subcategory = EXCLUDED.subcategory,
             modifier_allowed = EXCLUDED.modifier_allowed,
             version = EXCLUDED.version,
             rvu_work = EXCLUDED.rvu_work,
             rvu_facility = EXCLUDED.rvu_facility,
             active = true,
             updated_at = NOW()`,
      [
        cpt.code,
        cpt.description,
        cpt.short_description || null,
        cpt.category,
        cpt.subcategory || null,
        cpt.modifier_allowed,
        cpt.version,
        EFFECTIVE_FROM,
        cpt.rvu_work || null,
        cpt.rvu_facility || null
      ]
    );
  }

  console.log(`✅ Seeded ${CPT_CODES.length} CPT codes.`);
}

async function seedIcdCodes(pool) {
  console.log('📚 Seeding ICD codes...');

  for (const icd of ICD_CODES) {
    await pool.query(
      `INSERT INTO billing_icd_codes (code, description, short_description, category, chapter, icd_version, 
        is_billable, active, effective_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'ICD-10', $6, true, $7::date, NOW())
       ON CONFLICT (code) DO UPDATE
         SET description = EXCLUDED.description,
             short_description = EXCLUDED.short_description,
             category = EXCLUDED.category,
             chapter = EXCLUDED.chapter,
             is_billable = EXCLUDED.is_billable,
             active = true,
             updated_at = NOW()`,
      [icd.code, icd.description, icd.short_description || null, icd.category, icd.chapter || null, 
       icd.is_billable !== undefined ? icd.is_billable : true, EFFECTIVE_FROM]
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
