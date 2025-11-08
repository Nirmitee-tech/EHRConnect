# Enhanced Patient Search - Multiple Criteria Support

## 🎯 Overview

The `/api/public/v2/check-patient` endpoint now supports **multiple search criteria** to find patients flexibly during voice calls.

---

## ✨ Supported Search Parameters

| Parameter | Type | Match Type | Example | Use Case |
|-----------|------|------------|---------|----------|
| `phone` | string | Partial | `555-1234` or `5551234` | Search by any phone number |
| `email` | string | Exact | `john@example.com` | Search by email address |
| `name` | string | Partial | `John Smith` | Search by full name |
| `family` | string | Partial | `Smith` | Search by last name only |
| `given` | string | Partial | `John` | Search by first name only |
| `birthdate` | string | Exact | `1990-01-15` | Search by date of birth (YYYY-MM-DD) |
| `identifier` | string | Partial | `MRN12345` or `342` | Search by patient ID/MRN |

---

## 🔍 Search Examples

### 1. Search by Phone (Most Common for Voice Calls)
```bash
GET /api/public/v2/check-patient?org_id=YOUR_ORG&phone=555-1234
```

**Works with:**
- Full number: `5551234567`
- Partial: `555-1234`
- Just digits: `5551234`
- With formatting: `(555) 123-4567`

### 2. Search by Email
```bash
GET /api/public/v2/check-patient?org_id=YOUR_ORG&email=john@example.com
```

### 3. Search by Name
```bash
# Full name
GET /api/public/v2/check-patient?org_id=YOUR_ORG&name=John+Smith

# Last name only
GET /api/public/v2/check-patient?org_id=YOUR_ORG&family=Smith

# First name only
GET /api/public/v2/check-patient?org_id=YOUR_ORG&given=John
```

### 4. Search by Birth Date
```bash
GET /api/public/v2/check-patient?org_id=YOUR_ORG&birthdate=1990-01-15
```

### 5. Search by Patient Identifier/MRN
```bash
GET /api/public/v2/check-patient?org_id=YOUR_ORG&identifier=342
```

### 6. **Combined Search** (More Precise)
```bash
# Name + Birth Date (verify identity)
GET /api/public/v2/check-patient?org_id=YOUR_ORG&family=Smith&birthdate=1990-01-15

# Phone + Name (double check)
GET /api/public/v2/check-patient?org_id=YOUR_ORG&phone=555-1234&given=John

# Multiple criteria for accuracy
GET /api/public/v2/check-patient?org_id=YOUR_ORG&phone=555-1234&family=Smith&birthdate=1990-01-15
```

---

## 📊 Response Format

### Single Match Found
```json
{
  "success": true,
  "exists": true,
  "count": 1,
  "patients": [
    {
      "id": "08ccfa29-678f-4820-b78c-f875e2f85c82",
      "name": "John Smith",
      "phone": "555-123-4567",
      "email": "john@example.com",
      "birthDate": "1990-01-15",
      "gender": "male",
      "identifier": "MRN12345",
      "address": {
        "line": "123 Main St",
        "city": "Springfield",
        "state": "IL",
        "postalCode": "62701"
      }
    }
  ],
  "patient": {
    "id": "08ccfa29-678f-4820-b78c-f875e2f85c82",
    "name": "John Smith",
    "phone": "555-123-4567",
    ...
  }
}
```

### Multiple Matches Found
```json
{
  "success": true,
  "exists": true,
  "count": 2,
  "patients": [
    {
      "id": "patient-123",
      "name": "John Smith",
      "birthDate": "1990-01-15",
      ...
    },
    {
      "id": "patient-456",
      "name": "John Smith Jr.",
      "birthDate": "2015-05-20",
      ...
    }
  ],
  "patient": {
    // First match for backwards compatibility
  }
}
```

### No Match Found
```json
{
  "success": true,
  "exists": false,
  "count": 0,
  "message": "No patients found matching the criteria. You may create a new patient.",
  "searchCriteria": {
    "phone": "555-1234",
    "family": "Smith"
  }
}
```

### Error - No Search Parameters
```json
{
  "success": false,
  "error": "At least one search parameter must be provided",
  "supportedParams": {
    "phone": "Patient phone number (partial match)",
    "email": "Patient email (exact match)",
    "name": "Full name search (partial match)",
    "family": "Family/last name (partial match)",
    "given": "Given/first name (partial match)",
    "birthdate": "Birth date (YYYY-MM-DD)",
    "identifier": "Patient identifier/MRN"
  }
}
```

---

## 🎭 VAPI Integration Examples

### Scenario 1: Basic Phone Lookup
```javascript
// User calls in, caller ID captured
const callerPhone = context.caller.phoneNumber; // "555-123-4567"

const response = await fetch(
  `http://localhost:8000/api/public/v2/check-patient?org_id=${ORG_ID}&phone=${callerPhone}`
);

const data = await response.json();

if (data.exists) {
  return `Welcome back, ${data.patient.name}! I have your information on file.`;
} else {
  return `I don't see you in our system. Can I get your name to create a new record?`;
}
```

### Scenario 2: Verify Identity with Multiple Fields
```javascript
// User called, assistant asks for verification
const phone = await askForPhone();
const birthdate = await askForBirthdate(); // "What's your date of birth?"

const response = await fetch(
  `http://localhost:8000/api/public/v2/check-patient?org_id=${ORG_ID}&phone=${phone}&birthdate=${birthdate}`
);

const data = await response.json();

if (data.count === 1) {
  // Exact match - verified!
  return `Perfect! I found your record, ${data.patient.name}.`;
} else if (data.count > 1) {
  // Multiple matches - need more info
  return `I found multiple patients. Can you provide your last name?`;
} else {
  // No match
  return `I couldn't find your record. Let's create a new one.`;
}
```

### Scenario 3: Handle Multiple Matches
```javascript
const response = await fetch(
  `http://localhost:8000/api/public/v2/check-patient?org_id=${ORG_ID}&family=Smith&birthdate=1990-01-15`
);

const data = await response.json();

if (data.count > 1) {
  // Multiple John Smiths with same birthdate - unlikely but possible
  const options = data.patients.map((p, i) =>
    `${i+1}. ${p.name}, ${p.phone}, ${p.address?.city}`
  ).join('\n');

  return `I found ${data.count} patients:\n${options}\n\nWhich one is you?`;
}
```

### Scenario 4: Progressive Search (Start Broad, Narrow Down)
```javascript
async function findPatient() {
  // Step 1: Try phone
  let response = await checkPatient({ phone: userPhone });

  if (response.count === 1) return response.patient;

  if (response.count > 1) {
    // Step 2: Add name to narrow down
    const name = await ask("What's your last name?");
    response = await checkPatient({ phone: userPhone, family: name });

    if (response.count === 1) return response.patient;

    if (response.count > 1) {
      // Step 3: Add birthdate for final verification
      const dob = await ask("What's your date of birth?");
      response = await checkPatient({ phone: userPhone, family: name, birthdate: dob });
      return response.patient;
    }
  }

  return null; // Not found
}
```

---

## 💡 Best Practices

### 1. **Phone-First Strategy** (Recommended for Voice Calls)
Most voice systems capture caller ID automatically:
```javascript
// Start with phone, add more criteria if needed
const search = { phone: callerPhone };

const result = await checkPatient(search);

if (result.count > 1) {
  // Ask for clarification
  const lastName = await ask("For verification, what's your last name?");
  search.family = lastName;
  // Search again with more criteria
}
```

### 2. **Identity Verification**
For sensitive operations, verify with multiple fields:
```javascript
// High security: require 2-3 matching fields
const verified = await checkPatient({
  phone: userPhone,
  birthdate: userDOB,
  family: userLastName
});

if (verified.count === 1) {
  // Proceed with confidence
}
```

### 3. **Fuzzy Matching**
All text searches are **partial match** - forgiving of typos:
- "Smith" matches "Smith", "Smithson", "Blacksmith"
- "555" matches any number containing 555
- Use combined criteria to narrow results

### 4. **Handle Edge Cases**
```javascript
const result = await checkPatient({ phone: userPhone });

if (result.count === 0) {
  // Create new patient
  return handleNewPatient();
} else if (result.count === 1) {
  // Perfect match
  return result.patient;
} else {
  // Multiple matches - disambiguate
  return askForMoreInfo(result.patients);
}
```

---

## 🔄 Migration from Old Endpoint

### Old Way (Still Works)
```bash
GET /api/public/v2/check-patient?org_id=XXX&phone=555-1234
```

### New Capabilities (Enhanced)
```bash
# All of these now work:
GET /api/public/v2/check-patient?org_id=XXX&name=John+Smith
GET /api/public/v2/check-patient?org_id=XXX&email=john@example.com
GET /api/public/v2/check-patient?org_id=XXX&birthdate=1990-01-15
GET /api/public/v2/check-patient?org_id=XXX&identifier=MRN12345

# Combined searches:
GET /api/public/v2/check-patient?org_id=XXX&phone=555-1234&family=Smith
GET /api/public/v2/check-patient?org_id=XXX&name=John&birthdate=1990-01-15
```

**Backwards Compatibility:** ✅ 100% compatible
- Old code continues to work
- Response includes `patient` field (single, first match)
- New `patients` array available for multiple matches
- New `count` field shows total matches

---

## 🧪 Testing

```bash
ORG_ID="your-org-id-here"

# Test 1: Phone search
curl "http://localhost:8000/api/public/v2/check-patient?org_id=$ORG_ID&phone=2323"

# Test 2: Name search
curl "http://localhost:8000/api/public/v2/check-patient?org_id=$ORG_ID&name=Branden"

# Test 3: Family name
curl "http://localhost:8000/api/public/v2/check-patient?org_id=$ORG_ID&family=Holland"

# Test 4: Birth date
curl "http://localhost:8000/api/public/v2/check-patient?org_id=$ORG_ID&birthdate=1985-09-08"

# Test 5: Combined (most specific)
curl "http://localhost:8000/api/public/v2/check-patient?org_id=$ORG_ID&family=Holland&birthdate=1985-09-08"

# Test 6: No params (should error with helpful message)
curl "http://localhost:8000/api/public/v2/check-patient?org_id=$ORG_ID"
```

---

## 📊 Match Logic

### AND Logic (All criteria must match)
```bash
# Both phone AND name must match
?phone=555&family=Smith
```

### Partial vs Exact Matching

| Field | Match Type | Example |
|-------|------------|---------|
| phone | Partial (digits only) | "555" matches "555-1234" |
| email | Exact | Must match exactly |
| name/family/given | Partial (case insensitive) | "smith" matches "Smith" |
| birthdate | Exact | Must match exactly |
| identifier | Partial | "342" matches "MRN-342" |

---

## ✅ Summary

**New Search Options:**
- ✅ Phone (partial match, strips formatting)
- ✅ Email (exact match)
- ✅ Full name (partial match)
- ✅ Family/last name (partial match)
- ✅ Given/first name (partial match)
- ✅ Birth date (exact match)
- ✅ Patient identifier/MRN (partial match)
- ✅ **Combined searches** (AND logic)
- ✅ **Multiple results** returned as array
- ✅ **Backwards compatible** with old code

**Benefits:**
- More flexible patient lookup
- Better identity verification
- Handle multiple matches gracefully
- Support for various voice call scenarios
- Fuzzy matching for user errors

**Perfect for VAPI integration!** 🎉
