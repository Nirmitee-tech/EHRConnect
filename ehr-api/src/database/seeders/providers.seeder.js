const providers = [
  {
    npi: '1234567890',
    first_name: 'Sarah',
    last_name: 'Johnson',
    specialty: 'Internal Medicine',
    taxonomy_code: '207R00000X',
    license_number: 'CA-IM-98765',
    email: 'sarah.johnson@healthcenter.com',
    phone: '(555) 123-4567',
    address_line1: '123 Medical Plaza',
    address_line2: 'Suite 200',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94102'
  },
  {
    npi: '2345678901',
    first_name: 'Michael',
    last_name: 'Chen',
    specialty: 'Cardiology',
    taxonomy_code: '207RC0000X',
    license_number: 'CA-CD-87654',
    email: 'michael.chen@healthcenter.com',
    phone: '(555) 234-5678',
    address_line1: '456 Heart Care Center',
    address_line2: null,
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90001'
  },
  {
    npi: '3456789012',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    specialty: 'Pediatrics',
    taxonomy_code: '208000000X',
    license_number: 'CA-PD-76543',
    email: 'emily.rodriguez@healthcenter.com',
    phone: '(555) 345-6789',
    address_line1: '789 Children\'s Hospital',
    address_line2: 'Building A',
    city: 'San Diego',
    state: 'CA',
    zip_code: '92101'
  },
  {
    npi: '4567890123',
    first_name: 'David',
    last_name: 'Thompson',
    specialty: 'Orthopedic Surgery',
    taxonomy_code: '207X00000X',
    license_number: 'CA-OS-65432',
    email: 'david.thompson@healthcenter.com',
    phone: '(555) 456-7890',
    address_line1: '321 Bone & Joint Institute',
    address_line2: 'Floor 3',
    city: 'Sacramento',
    state: 'CA',
    zip_code: '95814'
  },
  {
    npi: '5678901234',
    first_name: 'Jennifer',
    last_name: 'Lee',
    specialty: 'Dermatology',
    taxonomy_code: '207N00000X',
    license_number: 'CA-DR-54321',
    email: 'jennifer.lee@healthcenter.com',
    phone: '(555) 567-8901',
    address_line1: '555 Skin Care Medical Center',
    address_line2: null,
    city: 'San Jose',
    state: 'CA',
    zip_code: '95110'
  },
  {
    npi: '6789012345',
    first_name: 'Robert',
    last_name: 'Williams',
    specialty: 'Family Medicine',
    taxonomy_code: '207Q00000X',
    license_number: 'CA-FM-43210',
    email: 'robert.williams@healthcenter.com',
    phone: '(555) 678-9012',
    address_line1: '888 Community Health Plaza',
    address_line2: 'Suite 100',
    city: 'Oakland',
    state: 'CA',
    zip_code: '94601'
  },
  {
    npi: '7890123456',
    first_name: 'Maria',
    last_name: 'Garcia',
    specialty: 'Obstetrics & Gynecology',
    taxonomy_code: '207V00000X',
    license_number: 'CA-OG-32109',
    email: 'maria.garcia@healthcenter.com',
    phone: '(555) 789-0123',
    address_line1: '999 Women\'s Health Center',
    address_line2: null,
    city: 'Fresno',
    state: 'CA',
    zip_code: '93701'
  },
  {
    npi: '8901234567',
    first_name: 'James',
    last_name: 'Anderson',
    specialty: 'Emergency Medicine',
    taxonomy_code: '207P00000X',
    license_number: 'CA-EM-21098',
    email: 'james.anderson@healthcenter.com',
    phone: '(555) 890-1234',
    address_line1: '111 Emergency Medical Plaza',
    address_line2: 'ER Wing',
    city: 'Long Beach',
    state: 'CA',
    zip_code: '90801'
  },
  {
    npi: '9012345678',
    first_name: 'Lisa',
    last_name: 'Patel',
    specialty: 'Psychiatry',
    taxonomy_code: '2084P0800X',
    license_number: 'CA-PS-10987',
    email: 'lisa.patel@healthcenter.com',
    phone: '(555) 901-2345',
    address_line1: '222 Mental Health Facility',
    address_line2: 'Suite 400',
    city: 'Riverside',
    state: 'CA',
    zip_code: '92501'
  },
  {
    npi: '0123456789',
    first_name: 'Christopher',
    last_name: 'Brown',
    specialty: 'Radiology',
    taxonomy_code: '2085R0202X',
    license_number: 'CA-RD-09876',
    email: 'christopher.brown@healthcenter.com',
    phone: '(555) 012-3456',
    address_line1: '333 Imaging Center',
    address_line2: null,
    city: 'Anaheim',
    state: 'CA',
    zip_code: '92801'
  },
  {
    npi: '1357924680',
    first_name: 'Amanda',
    last_name: 'Martinez',
    specialty: 'Endocrinology',
    taxonomy_code: '207RE0101X',
    license_number: 'CA-EN-98760',
    email: 'amanda.martinez@healthcenter.com',
    phone: '(555) 135-7924',
    address_line1: '444 Diabetes & Thyroid Clinic',
    address_line2: 'Floor 2',
    city: 'Santa Ana',
    state: 'CA',
    zip_code: '92701'
  },
  {
    npi: '2468013579',
    first_name: 'Daniel',
    last_name: 'Kim',
    specialty: 'Neurology',
    taxonomy_code: '2084N0400X',
    license_number: 'CA-NE-87650',
    email: 'daniel.kim@healthcenter.com',
    phone: '(555) 246-8013',
    address_line1: '555 Brain & Spine Institute',
    address_line2: null,
    city: 'Irvine',
    state: 'CA',
    zip_code: '92602'
  },
  {
    npi: '3691470258',
    first_name: 'Rachel',
    last_name: 'Taylor',
    specialty: 'Oncology',
    taxonomy_code: '207RX0202X',
    license_number: 'CA-ON-76540',
    email: 'rachel.taylor@healthcenter.com',
    phone: '(555) 369-1470',
    address_line1: '666 Cancer Treatment Center',
    address_line2: 'Building C',
    city: 'Bakersfield',
    state: 'CA',
    zip_code: '93301'
  },
  {
    npi: '8024691357',
    first_name: 'Kevin',
    last_name: 'Nguyen',
    specialty: 'Ophthalmology',
    taxonomy_code: '207W00000X',
    license_number: 'CA-OP-65430',
    email: 'kevin.nguyen@healthcenter.com',
    phone: '(555) 802-4691',
    address_line1: '777 Eye Care Associates',
    address_line2: 'Suite 300',
    city: 'Stockton',
    state: 'CA',
    zip_code: '95201'
  },
  {
    npi: '9753108642',
    first_name: 'Nicole',
    last_name: 'Davis',
    specialty: 'Anesthesiology',
    taxonomy_code: '207L00000X',
    license_number: 'CA-AN-54320',
    email: 'nicole.davis@healthcenter.com',
    phone: '(555) 975-3108',
    address_line1: '888 Surgical Care Center',
    address_line2: 'Operating Room Wing',
    city: 'Modesto',
    state: 'CA',
    zip_code: '95350'
  }
];

async function seedProviders(pool) {
  console.log('Seeding providers...');

  for (const provider of providers) {
    try {
      await pool.query(
        `INSERT INTO billing_providers
        (npi, first_name, last_name, specialty, taxonomy_code, license_number,
         email, phone, address_line1, address_line2, city, state, zip_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (npi) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          specialty = EXCLUDED.specialty,
          taxonomy_code = EXCLUDED.taxonomy_code,
          license_number = EXCLUDED.license_number,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          address_line1 = EXCLUDED.address_line1,
          address_line2 = EXCLUDED.address_line2,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          zip_code = EXCLUDED.zip_code`,
        [
          provider.npi,
          provider.first_name,
          provider.last_name,
          provider.specialty,
          provider.taxonomy_code,
          provider.license_number,
          provider.email,
          provider.phone,
          provider.address_line1,
          provider.address_line2,
          provider.city,
          provider.state,
          provider.zip_code
        ]
      );
      console.log(`✓ Seeded provider: Dr. ${provider.first_name} ${provider.last_name}`);
    } catch (error) {
      console.error(`✗ Failed to seed provider ${provider.npi}:`, error.message);
    }
  }

  console.log('Provider seeding completed!');
}

module.exports = { seedProviders };
