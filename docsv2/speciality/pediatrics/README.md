# Pediatrics & Child Health Specialty Module

## Overview

The Pediatrics specialty module provides comprehensive electronic health record (EHR) capabilities for pediatric care from birth through 18 years of age. It follows the AAP Bright Futures guidelines and supports clinical workflows across six developmental stages: newborn, infant, toddler, preschool, school-age, and adolescent.

## Features

### Core Capabilities

- **Growth Tracking**: WHO and CDC growth charts with automatic percentile calculations
- **Immunization Management**: CDC/ACIP 2024 schedule with catch-up planning
- **Well-Child Visits**: 22+ visit types per Bright Futures schedule
- **Developmental Screening**: Denver II, ASQ-3, M-CHAT assessments
- **HEADSS Assessment**: Comprehensive adolescent risk assessment (13-18 years)
- **Newborn Screening**: State newborn screening program tracking
- **Age-Stratified Vital Signs**: Automatic validation against age-appropriate ranges

### Additional Screenings

- Lead screening (12 and 24 months)
- TB risk assessment
- Autism screening (18 and 24 months)
- Behavioral assessment (ADHD, conduct disorders)
- Mental health screening (depression, anxiety)
- Substance use screening (CRAFFT for adolescents)
- Sexual health assessment (adolescents)
- Vision and hearing screening
- Injury prevention counseling

### Clinical Documentation

- Birth data and maternal record linkage
- Medications with age-appropriate dosing
- Allergies tracking
- Medical and family history
- Social determinants of health assessment
- Sports physical examinations
- Care coordination and referral management

## Quick Start

### Backend Setup

1. **Run Database Migration**:
```bash
cd ehr-api
node src/migrations/add-pediatrics-tables.js up
```

2. **Verify Specialty Pack**:
The pediatrics pack is automatically loaded from `ehr-api/specialty-packs/pediatrics/1.0.0/`

3. **Test API Endpoints**:
```bash
# Get patient demographics
curl http://localhost:8000/api/patients/{patientId}/pediatrics/demographics

# Get immunization schedule
curl http://localhost:8000/api/patients/{patientId}/pediatrics/immunizations/schedule

# Get growth records
curl http://localhost:8000/api/patients/{patientId}/pediatrics/growth
```

### Frontend Setup

The Pediatrics specialty is automatically registered when the application starts:

```typescript
// Already configured in ehr-web/src/app/specialty-init.ts
import { PediatricsSpecialty } from '@/features/specialties/pediatrics';
specialtyRegistry.register(PediatricsSpecialty);
```

### Creating a Pediatric Episode

```typescript
import { pediatricsService } from '@/features/specialties/pediatrics/services/pediatrics.service';

// Save birth demographics
await pediatricsService.saveDemographics(patientId, {
  birthWeightGrams: 3400,
  birthLengthCm: 51,
  birthHeadCircumferenceCm: 35,
  gestationalAgeWeeks: 39,
  gestationalAgeDays: 2,
  apgar1min: 8,
  apgar5min: 9,
  linkedMaternalPatientId: 'mother-patient-id'
});

// Record growth measurement
await pediatricsService.saveGrowthRecord(patientId, {
  measurementDate: '2024-12-21',
  ageMonths: 6.5,
  weightKg: 7.8,
  lengthHeightCm: 67.5,
  headCircumferenceCm: 43.2
});

// Record immunization
await pediatricsService.saveImmunization(patientId, {
  vaccineName: 'DTaP',
  administrationDate: '2024-12-21',
  doseNumber: 3,
  seriesDoses: 5,
  lotNumber: 'ABC123',
  manufacturer: 'Sanofi Pasteur'
});
```

## Age Groups

The module recognizes six developmental stages with age-specific features:

| Age Group | Age Range | Key Features |
|-----------|-----------|--------------|
| Newborn | 0-1 month | Birth data, Apgar scores, NHS tracking |
| Infant | 1-12 months | Growth monitoring, frequent well visits, vaccines |
| Toddler | 1-3 years | Language development, autism screening |
| Preschool | 3-5 years | School readiness, vision/hearing screening |
| School Age | 5-13 years | Academic performance, sports physicals |
| Adolescent | 13-18 years | HEADSS assessment, mental health, substance use |

## Clinical Workflows

### Well-Child Visit Workflow

1. Patient check-in
2. Vital signs measurement (age-appropriate validation)
3. Growth measurements (weight, height/length, head circumference)
4. Review immunization status
5. Developmental screening (as per schedule)
6. Physical examination
7. Anticipatory guidance
8. Schedule next visit

### Immunization Workflow

1. Review immunization history
2. Check CDC/ACIP 2024 schedule
3. Identify due vaccines
4. Screen contraindications
5. Provide VIS (Vaccine Information Statements)
6. Obtain consent
7. Administer vaccines
8. Document lot numbers, sites, routes
9. Monitor for adverse reactions
10. Update immunization status

### HEADSS Assessment Workflow (Ages 13-18)

1. Establish confidentiality
2. Home environment assessment
3. Education/Employment evaluation
4. Activities & peer relationships
5. Drug/Alcohol/Tobacco screening
6. Sexual health assessment
7. Suicide/Safety evaluation
8. Calculate risk level
9. Develop intervention plan
10. Make referrals if needed

## Integration Points

### Maternal Record Linkage

The module can link to maternal OB/GYN records:

- Imports birth data from delivery records
- Tracks pregnancy complications affecting newborn care
- Supports multiple birth tracking (twins, triplets)

### Care Coordination

- Referrals to pediatric subspecialties
- Early intervention services
- School accommodations
- Mental health services
- Social services

## Compliance & Standards

- **AAP Bright Futures Guidelines**: Well-child visit schedule and anticipatory guidance
- **CDC/ACIP 2024**: Immunization recommendations
- **WHO Growth Standards**: 0-2 years
- **CDC Growth Charts**: 2-20 years
- **Developmental Screening**: Denver II, ASQ-3, M-CHAT-R/F
- **State Requirements**: Newborn screening, lead screening, school physicals

## Support

For questions or issues:
- Technical Documentation: `/docsv2/speciality/pediatrics/`
- API Reference: `/docsv2/speciality/pediatrics/api-reference.md`
- Database Schema: `/docsv2/speciality/pediatrics/database-schema.md`
- Clinical Workflows: `/docsv2/speciality/pediatrics/clinical-workflows.md`

## Version

Current Version: 1.0.0

## License

See main project LICENSE file
