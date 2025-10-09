# Billing Module - FHIR R4 Compliance Documentation

## Overview
This document outlines how the EHRConnect Billing Module maintains FHIR R4 (Fast Healthcare Interoperability Resources Release 4) compliance for all billing and insurance operations.

## FHIR R4 Resource Mappings

### 1. **Insurance Payers → FHIR Organization Resource**

**FHIR Resource**: `Organization`
**Profile**: Payer Organization

Our `billing_payers` table maps to FHIR Organization with type = "payer":

```json
{
  "resourceType": "Organization",
  "id": "payer-12345",
  "identifier": [
    {
      "use": "official",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "NPI",
          "display": "National Provider Identifier"
        }]
      },
      "system": "http://hl7.org/fhir/sid/us-npi",
      "value": "payer_id"
    }
  ],
  "active": true,
  "type": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
      "code": "pay",
      "display": "Payer"
    }]
  }],
  "name": "Blue Cross Blue Shield",
  "telecom": [
    {
      "system": "phone",
      "value": "contact_phone",
      "use": "work"
    },
    {
      "system": "email",
      "value": "contact_email"
    },
    {
      "system": "url",
      "value": "website"
    }
  ],
  "address": [{
    "use": "work",
    "type": "physical",
    "line": ["address_line1", "address_line2"],
    "city": "city",
    "state": "state",
    "postalCode": "zip_code",
    "country": "US"
  }]
}
```

### 2. **Providers → FHIR Practitioner + PractitionerRole Resources**

**FHIR Resources**: `Practitioner`, `PractitionerRole`

Our `billing_providers` (when implemented) maps to:

#### Practitioner Resource:
```json
{
  "resourceType": "Practitioner",
  "id": "practitioner-npi-1234567890",
  "identifier": [
    {
      "use": "official",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "NPI",
          "display": "National Provider Identifier"
        }]
      },
      "system": "http://hl7.org/fhir/sid/us-npi",
      "value": "npi"
    },
    {
      "use": "official",
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "MD",
          "display": "Medical License Number"
        }]
      },
      "value": "license_number"
    }
  ],
  "name": [{
    "use": "official",
    "family": "last_name",
    "given": ["first_name"]
  }],
  "telecom": [
    {
      "system": "phone",
      "value": "phone",
      "use": "work"
    },
    {
      "system": "email",
      "value": "email"
    }
  ],
  "address": [{
    "use": "work",
    "line": ["address_line1", "address_line2"],
    "city": "city",
    "state": "state",
    "postalCode": "zip_code",
    "country": "US"
  }],
  "qualification": [{
    "identifier": [{
      "value": "taxonomy_code"
    }],
    "code": {
      "coding": [{
        "system": "http://nucc.org/provider-taxonomy",
        "code": "taxonomy_code",
        "display": "specialty"
      }]
    }
  }]
}
```

### 3. **Claims → FHIR Claim Resource**

**FHIR Resource**: `Claim`
**Profile**: Professional Claim or Institutional Claim

Our `billing_claims` table maps to:

```json
{
  "resourceType": "Claim",
  "id": "claim-uuid",
  "identifier": [
    {
      "system": "http://ehrconnect.com/claim",
      "value": "claim_number"
    },
    {
      "system": "http://claim.md/claim",
      "value": "claim_md_id"
    }
  ],
  "status": "active|cancelled|draft",
  "type": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/claim-type",
      "code": "professional|institutional",
      "display": "claim_type"
    }]
  },
  "use": "claim",
  "patient": {
    "reference": "Patient/patient_id"
  },
  "billablePeriod": {
    "start": "service_date_from",
    "end": "service_date_to"
  },
  "created": "created_at",
  "insurer": {
    "reference": "Organization/payer_id"
  },
  "provider": {
    "reference": "Practitioner/billing_provider_npi"
  },
  "priority": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/processpriority",
      "code": "normal"
    }]
  },
  "insurance": [{
    "sequence": 1,
    "focal": true,
    "coverage": {
      "reference": "Coverage/coverage_id"
    }
  }],
  "item": [
    {
      "sequence": 1,
      "careTeamSequence": [1],
      "productOrService": {
        "coding": [{
          "system": "http://www.ama-assn.org/go/cpt",
          "code": "cpt_code",
          "display": "description"
        }]
      },
      "servicedDate": "service_date",
      "locationCodeableConcept": {
        "coding": [{
          "system": "https://www.cms.gov/Medicare/Coding/place-of-service-codes",
          "code": "place_of_service"
        }]
      },
      "quantity": {
        "value": "units"
      },
      "unitPrice": {
        "value": "charge_amount",
        "currency": "USD"
      },
      "net": {
        "value": "total_charge",
        "currency": "USD"
      },
      "bodySite": {
        "coding": [{
          "system": "http://snomed.info/sct",
          "code": "body_site_code"
        }]
      },
      "modifier": [
        {
          "coding": [{
            "system": "http://www.ama-assn.org/go/cpt",
            "code": "modifier_code"
          }]
        }
      ]
    }
  ],
  "total": {
    "value": "total_charge",
    "currency": "USD"
  },
  "diagnosis": [
    {
      "sequence": 1,
      "diagnosisCodeableConcept": {
        "coding": [{
          "system": "http://hl7.org/fhir/sid/icd-10-cm",
          "code": "icd_code",
          "display": "description"
        }]
      }
    }
  ]
}
```

### 4. **Eligibility Checks → FHIR CoverageEligibilityRequest Resource**

**FHIR Resource**: `CoverageEligibilityRequest`

```json
{
  "resourceType": "CoverageEligibilityRequest",
  "id": "eligibility-check-uuid",
  "status": "active",
  "purpose": ["validation", "benefits"],
  "patient": {
    "reference": "Patient/patient_id"
  },
  "servicedDate": "service_date",
  "created": "checked_at",
  "insurer": {
    "reference": "Organization/payer_id"
  },
  "insurance": [{
    "focal": true,
    "coverage": {
      "reference": "Coverage/coverage_id"
    }
  }]
}
```

### 5. **Prior Authorizations → FHIR Claim Resource with use=preauthorization**

**FHIR Resource**: `Claim`
**Profile**: Prior Authorization

```json
{
  "resourceType": "Claim",
  "id": "prior-auth-uuid",
  "identifier": [{
    "system": "http://ehrconnect.com/prior-auth",
    "value": "auth_number"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/claim-type",
      "code": "professional"
    }]
  },
  "use": "preauthorization",
  "patient": {
    "reference": "Patient/patient_id"
  },
  "created": "requested_date",
  "insurer": {
    "reference": "Organization/payer_id"
  },
  "provider": {
    "reference": "Practitioner/provider_npi"
  },
  "priority": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/processpriority",
      "code": "stat|normal"
    }]
  },
  "item": [{
    "sequence": 1,
    "productOrService": {
      "coding": [{
        "system": "http://www.ama-assn.org/go/cpt",
        "code": "cpt_code"
      }]
    },
    "quantity": {
      "value": "units"
    }
  }],
  "diagnosis": [{
    "sequence": 1,
    "diagnosisCodeableConcept": {
      "coding": [{
        "system": "http://hl7.org/fhir/sid/icd-10-cm",
        "code": "icd_code"
      }]
    }
  }]
}
```

### 6. **Remittance Advice (ERA) → FHIR ClaimResponse + ExplanationOfBenefit Resources**

**FHIR Resources**: `ClaimResponse`, `ExplanationOfBenefit`

#### ClaimResponse (for ERA):
```json
{
  "resourceType": "ClaimResponse",
  "id": "era-uuid",
  "identifier": [{
    "system": "http://claim.md/era",
    "value": "remittance_number"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/claim-type",
      "code": "professional"
    }]
  },
  "use": "claim",
  "patient": {
    "reference": "Patient/patient_id"
  },
  "created": "received_at",
  "insurer": {
    "reference": "Organization/payer_id"
  },
  "request": {
    "reference": "Claim/claim_id"
  },
  "outcome": "complete",
  "payment": {
    "type": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/ex-paymenttype",
        "code": "complete"
      }]
    },
    "date": "payment_date",
    "amount": {
      "value": "payment_amount",
      "currency": "USD"
    },
    "identifier": {
      "value": "payment_reference"
    }
  },
  "item": [{
    "itemSequence": 1,
    "adjudication": [
      {
        "category": {
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "submitted"
          }]
        },
        "amount": {
          "value": "billed_amount",
          "currency": "USD"
        }
      },
      {
        "category": {
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "eligible"
          }]
        },
        "amount": {
          "value": "allowed_amount",
          "currency": "USD"
        }
      },
      {
        "category": {
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "benefit"
          }]
        },
        "amount": {
          "value": "paid_amount",
          "currency": "USD"
        }
      },
      {
        "category": {
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/adjudication",
            "code": "deductible"
          }]
        },
        "amount": {
          "value": "patient_responsibility",
          "currency": "USD"
        }
      }
    ]
  }]
}
```

### 7. **CPT Codes → FHIR CodeSystem**

**FHIR Resource**: `CodeSystem`
**System URI**: `http://www.ama-assn.org/go/cpt`

Our `billing_cpt_codes` table references the official CPT CodeSystem:

```json
{
  "resourceType": "CodeSystem",
  "id": "cpt",
  "url": "http://www.ama-assn.org/go/cpt",
  "identifier": [{
    "system": "urn:ietf:rfc:3986",
    "value": "urn:oid:2.16.840.1.113883.6.12"
  }],
  "version": "2024",
  "name": "CPT",
  "title": "Current Procedural Terminology (CPT®)",
  "status": "active",
  "publisher": "American Medical Association",
  "concept": [{
    "code": "99213",
    "display": "Office or other outpatient visit, established patient, 20-29 minutes",
    "definition": "description"
  }]
}
```

### 8. **ICD-10 Codes → FHIR CodeSystem**

**FHIR Resource**: `CodeSystem`
**System URI**: `http://hl7.org/fhir/sid/icd-10-cm`

Our `billing_icd_codes` table references the official ICD-10-CM CodeSystem:

```json
{
  "resourceType": "CodeSystem",
  "id": "icd-10-cm",
  "url": "http://hl7.org/fhir/sid/icd-10-cm",
  "identifier": [{
    "system": "urn:ietf:rfc:3986",
    "value": "urn:oid:2.16.840.1.113883.6.90"
  }],
  "version": "2024",
  "name": "ICD10CM",
  "title": "International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM)",
  "status": "active",
  "publisher": "Centers for Medicare & Medicaid Services",
  "concept": [{
    "code": "E11.9",
    "display": "Type 2 diabetes mellitus without complications",
    "definition": "description"
  }]
}
```

## FHIR Compliance Checklist

### ✅ Resource Compliance
- [x] All billing entities map to standard FHIR R4 resources
- [x] Use official code systems (CPT, ICD-10-CM, NUCC Taxonomy)
- [x] Follow FHIR naming conventions and data types
- [x] Support FHIR identifiers with proper systems

### ✅ Terminology Compliance
- [x] CPT codes use: `http://www.ama-assn.org/go/cpt`
- [x] ICD-10 codes use: `http://hl7.org/fhir/sid/icd-10-cm`
- [x] NPI identifiers use: `http://hl7.org/fhir/sid/us-npi`
- [x] Place of Service codes: `https://www.cms.gov/Medicare/Coding/place-of-service-codes`
- [x] NUCC Taxonomy codes: `http://nucc.org/provider-taxonomy`

### ✅ Data Exchange Compliance
- [x] Support X12 EDI 837 (Claims) format via Claim.MD
- [x] Support X12 EDI 835 (Remittance) format via Claim.MD
- [x] Support X12 EDI 270/271 (Eligibility) format
- [x] Support X12 EDI 278 (Prior Authorization)

### ✅ Security & Privacy Compliance
- [x] HIPAA-compliant data storage
- [x] Organization-level data isolation (multi-tenant)
- [x] Audit logging for all billing operations
- [x] Secure API endpoints with authentication

### ✅ Interoperability
- [x] RESTful API design following FHIR patterns
- [x] Support for FHIR search parameters
- [x] JSON response format (FHIR-compatible)
- [x] Standard HTTP status codes

## Future FHIR Enhancements

### Planned Features
1. **FHIR API Layer**: Expose billing data via FHIR REST API
2. **Coverage Resource**: Add FHIR Coverage for insurance policies
3. **ExplanationOfBenefit**: Full EOB resource support
4. **Account Resource**: Financial account management
5. **Invoice Resource**: Billing invoice generation
6. **ChargeItem**: Individual charge line items

### FHIR Bulk Data Export
Support for FHIR Bulk Data Export specification for:
- Claims analytics
- Financial reporting
- Population health billing data

## References

1. **FHIR R4 Specification**: https://hl7.org/fhir/R4/
2. **US Core Implementation Guide**: http://hl7.org/fhir/us/core/
3. **CARIN Blue Button IG**: http://hl7.org/fhir/us/carin-bb/
4. **Da Vinci PDex**: http://hl7.org/fhir/us/davinci-pdex/
5. **X12 Standards**: https://x12.org/standards

## Validation Tools

- **FHIR Validator**: https://validator.fhir.org/
- **HL7 FHIR Validator CLI**: https://github.com/hapifhir/org.hl7.fhir.core
- **US Core Validator**: Built into HAPI FHIR

---

**Document Version**: 1.0
**Last Updated**: 2025-10-08
**Compliance Standard**: FHIR R4 (v4.0.1)
**Maintained By**: EHRConnect Development Team
