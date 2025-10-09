# Medical Codes - Official Sources & Bulk Loading Guide

## 🎯 Quick Links for Downloading Official Code Sets

### 1. **CPT Codes** (Current Procedural Terminology)
**What it is**: Medical procedures, surgeries, and services codes

#### Official Source (Paid):
- **Publisher**: American Medical Association (AMA)
- **Link**: https://www.ama-assn.org/practice-management/cpt
- **Cost**: $200-$400/year (License required)
- **Format**: CSV, PDF
- **FHIR System URI**: `http://www.ama-assn.org/go/cpt`
- **OID**: `2.16.840.1.113883.6.12`

#### Free Alternatives:
- **CMS HCPCS Codes**: https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets
- **Format**: Excel, CSV
- **Cost**: FREE ✅
- **Note**: HCPCS includes Level II codes (not all CPT codes)

---

### 2. **ICD-10-CM Codes** (International Classification of Diseases)
**What it is**: Diagnosis codes for diseases and conditions

#### Official Source (FREE!):
- **Publisher**: CDC / CMS
- **Main Link**: https://www.cms.gov/medicare/coding-billing/icd-10-codes
- **Direct Downloads**:
  - **2024 ICD-10-CM**: https://www.cms.gov/files/zip/2024-code-descriptions-tabular-order.zip
  - **2024 ICD-10-PCS**: https://www.cms.gov/files/zip/2024-icd-10-pcs-codes-file.zip
- **Format**: TXT, XML, Excel
- **Cost**: FREE ✅
- **FHIR System URI**: `http://hl7.org/fhir/sid/icd-10-cm`
- **OID**: `2.16.840.1.113883.6.90`

#### File Structure:
```
ORDER   CODE    VALID DIAGNOSIS  SHORT DESCRIPTION           LONG DESCRIPTION
1       A00     1                Cholera                     Cholera
2       A000    1                Cholera due to V. cholerae  Cholera due to Vibrio cholerae 01, biovar cholerae
```

---

### 3. **HCPCS Codes** (Healthcare Common Procedure Coding System)
**What it is**: Medical procedures, equipment, supplies, and services

#### Official Source (FREE!):
- **Publisher**: CMS (Centers for Medicare & Medicaid Services)
- **Link**: https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets
- **Direct Download**: https://www.cms.gov/files/zip/2024-alpha-numeric-hcpcs-file.zip
- **Format**: Excel, CSV
- **Cost**: FREE ✅
- **FHIR System URI**: `http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets`
- **OID**: `2.16.840.1.113883.6.285`

---

### 4. **LOINC Codes** (Logical Observation Identifiers Names and Codes)
**What it is**: Lab tests, clinical observations, and measurements

#### Official Source (FREE!):
- **Publisher**: Regenstrief Institute
- **Link**: https://loinc.org/downloads/
- **Account Required**: Yes (Free registration)
- **Format**: CSV, Access DB, Excel
- **Cost**: FREE ✅
- **FHIR System URI**: `http://loinc.org`
- **OID**: `2.16.840.1.113883.6.1`

#### Download Steps:
1. Register at https://loinc.org/
2. Go to Downloads section
3. Download LOINC Table File (CSV)
4. Extract and use

---

### 5. **SNOMED CT** (Systematized Nomenclature of Medicine Clinical Terms)
**What it is**: Comprehensive clinical terminology (diseases, procedures, anatomy)

#### Official Source (FREE with UMLS license):
- **Publisher**: SNOMED International / NLM
- **Link**: https://www.nlm.nih.gov/healthit/snomedct/index.html
- **UMLS License**: https://uts.nlm.nih.gov/uts/ (Free but requires application)
- **Format**: RF2 Files (Tab-delimited)
- **Cost**: FREE ✅ (with UMLS account)
- **FHIR System URI**: `http://snomed.info/sct`
- **OID**: `2.16.840.1.113883.6.96`

---

### 6. **RxNorm** (Medication Codes)
**What it is**: Normalized names for medications

#### Official Source (FREE!):
- **Publisher**: National Library of Medicine
- **Link**: https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html
- **Format**: RRF files, MySQL dump
- **Cost**: FREE ✅
- **FHIR System URI**: `http://www.nlm.nih.gov/research/umls/rxnorm`
- **OID**: `2.16.840.1.113883.6.88`

---

### 7. **NDC Codes** (National Drug Codes)
**What it is**: FDA drug product identifiers

#### Official Source (FREE!):
- **Publisher**: FDA
- **Link**: https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory
- **Direct Download**: https://www.fda.gov/media/169825/download
- **Format**: Excel, TXT
- **Cost**: FREE ✅
- **FHIR System URI**: `http://hl7.org/fhir/sid/ndc`
- **OID**: `2.16.840.1.113883.6.69`

---

## 📊 File Format Examples

### CPT Code Format (CSV):
```csv
code,description,category
99201,Office visit - new patient - level 1,Office Visits
99202,Office visit - new patient - level 2,Office Visits
99211,Office visit - established patient - level 1,Office Visits
```

### ICD-10-CM Format (TXT):
```
A00.0   Cholera due to Vibrio cholerae 01, biovar cholerae
A00.1   Cholera due to Vibrio cholerae 01, biovar eltor
A00.9   Cholera, unspecified
```

### HCPCS Format (Excel):
| HCPCS Code | Long Description | Short Description |
|------------|------------------|-------------------|
| A4206 | Syringe with needle, sterile 1 cc or less, each | Syringe w/ needle 1cc |
| A4207 | Syringe with needle, sterile 2 cc, each | Syringe w/ needle 2cc |

---

## 🚀 How to Bulk Upload in EHRConnect

### Step 1: Download Official Files
Choose your code system from the links above and download.

### Step 2: Prepare CSV File
Convert to CSV format with these columns:
```csv
code_type,code,description,category
cpt,99213,Office visit established patient 20-29 min,Office Visits
icd10,E11.9,Type 2 diabetes mellitus without complications,Diabetes
hcpcs,A4206,Syringe with needle sterile 1cc,Supplies
```

### Step 3: Upload via UI
1. Go to **Billing → Masters → Medical Codes**
2. Click **"Bulk Upload"** button
3. Select your CSV/Excel/TXT file
4. Choose code type filter (or leave as 'all')
5. Upload and wait for processing

### Step 4: Verify
- Check the stats cards for counts
- Search for specific codes
- Filter by code type

---

## 🔧 API Endpoint for Bulk Upload

```bash
POST /api/billing/masters/codes/bulk-upload
Content-Type: multipart/form-data

{
  "file": [binary file],
  "code_type": "cpt|icd10|hcpcs|custom"
}
```

---

## 📝 FHIR R4 Compliance

All uploaded codes maintain FHIR R4 compliance:

### CodeSystem Resource Structure:
```json
{
  "resourceType": "CodeSystem",
  "id": "icd-10-cm",
  "url": "http://hl7.org/fhir/sid/icd-10-cm",
  "version": "2024",
  "name": "ICD10CM",
  "status": "active",
  "content": "complete",
  "concept": [
    {
      "code": "E11.9",
      "display": "Type 2 diabetes mellitus without complications",
      "definition": "Full ICD-10-CM description"
    }
  ]
}
```

### ValueSet Example (Subset):
```json
{
  "resourceType": "ValueSet",
  "id": "diabetes-diagnosis-codes",
  "url": "http://ehrconnect.com/fhir/ValueSet/diabetes-diagnosis",
  "name": "DiabetesDiagnosisCodes",
  "status": "active",
  "compose": {
    "include": [
      {
        "system": "http://hl7.org/fhir/sid/icd-10-cm",
        "concept": [
          {"code": "E10.9", "display": "Type 1 diabetes mellitus"},
          {"code": "E11.9", "display": "Type 2 diabetes mellitus"}
        ]
      }
    ]
  }
}
```

---

## ⚠️ Important Notes

### License Requirements:
- **CPT**: Requires AMA license for full set (paid)
- **ICD-10**: Public domain (free)
- **HCPCS**: Public domain (free)
- **LOINC**: Free but requires registration
- **SNOMED CT**: Free with UMLS license (requires application)

### Update Frequency:
- **CPT**: Annual (January 1)
- **ICD-10-CM**: Annual (October 1)
- **HCPCS**: Quarterly
- **LOINC**: Biannual
- **SNOMED CT**: Biannual

### Best Practices:
1. Download official files annually
2. Keep old codes for historical claims
3. Mark expired codes as inactive
4. Use effective/termination dates
5. Maintain code categories for organization

---

## 🔗 Additional Resources

- **FHIR Terminology Service**: https://terminology.hl7.org/
- **UMLS Metathesaurus**: https://www.nlm.nih.gov/research/umls/
- **WHO ICD**: https://icd.who.int/
- **CMS Coding**: https://www.cms.gov/medicare/coding-billing

---

**Last Updated**: 2025-10-08
**Maintained By**: EHRConnect Development Team
