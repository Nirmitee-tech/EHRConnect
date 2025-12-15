# Feature Update: Get Slots for All Practitioners

## 🎯 What Changed

The `/api/public/v2/available-slots` endpoint now supports getting available time slots for **ALL practitioners** at once, not just a specific one.

---

## ✨ New Feature

### Before (Still Works)
```bash
# Get slots for a specific practitioner
GET /api/public/v2/available-slots?org_id=YOUR_ORG&practitioner_id=PRACT_ID&date=2025-10-25
```

### NEW - Get Slots for ALL Practitioners
```bash
# Simply omit the practitioner_id parameter
GET /api/public/v2/available-slots?org_id=YOUR_ORG&date=2025-10-25
```

---

## 📊 Response Format

### Single Practitioner Response (unchanged)
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "practitionerId": "pract-123",
  "practitionerName": "Dr. John Smith",
  "date": "2025-10-25",
  "workingHours": { "start": "09:00", "end": "17:00" },
  "totalSlots": 16,
  "availableSlots": [
    {
      "start": "2025-10-25T14:00:00Z",
      "end": "2025-10-25T14:30:00Z",
      "duration": 30
    }
  ]
}
```

### All Practitioners Response (NEW)
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "date": "2025-10-25",
  "totalPractitioners": 5,          // Total in system
  "workingPractitioners": 3,         // Working on this day
  "totalAvailableSlots": 48,         // Total across all doctors
  "practitioners": [
    {
      "practitionerId": "pract-123",
      "practitionerName": "Dr. Sarah Johnson",
      "specialty": "Family Medicine",
      "phone": "+1-555-999-8888",
      "workingHours": {
        "start": "09:00",
        "end": "17:00"
      },
      "totalSlots": 16,
      "availableSlots": [
        {
          "start": "2025-10-25T14:00:00Z",
          "end": "2025-10-25T14:30:00Z",
          "duration": 30
        }
      ],
      "isWorking": true
    },
    {
      "practitionerId": "pract-456",
      "practitionerName": "Dr. Michael Chen",
      "specialty": "Internal Medicine",
      "phone": "+1-555-888-7777",
      "workingHours": {
        "start": "10:00",
        "end": "18:00"
      },
      "totalSlots": 16,
      "availableSlots": [
        {
          "start": "2025-10-25T15:00:00Z",
          "end": "2025-10-25T15:30:00Z",
          "duration": 30
        }
      ],
      "isWorking": true
    }
  ]
}
```

---

## 💡 Use Cases

### Use Case 1: Show All Available Doctors
```
Voice Assistant: "What date would you like to book?"
User: "October 25th"

API Call:
GET /api/public/v2/available-slots?org_id=YOUR_ORG&date=2025-10-25

Voice Assistant: "We have 3 doctors available on October 25th:
- Dr. Sarah Johnson (Family Medicine) - 16 slots available
- Dr. Michael Chen (Internal Medicine) - 16 slots available
- Dr. Emily Rodriguez (Pediatrics) - 16 slots available

Which doctor would you prefer?"
```

### Use Case 2: Find Next Available Slot Across All Doctors
```javascript
// Get all slots for the date
const response = await fetch(
  `/api/public/v2/available-slots?org_id=${ORG_ID}&date=${date}`
);

// Find earliest slot across all practitioners
let earliestSlot = null;
let selectedDoctor = null;

response.practitioners.forEach(doc => {
  if (doc.availableSlots.length > 0) {
    const firstSlot = doc.availableSlots[0];
    if (!earliestSlot || firstSlot.start < earliestSlot) {
      earliestSlot = firstSlot.start;
      selectedDoctor = doc;
    }
  }
});

console.log(`Next available: ${earliestSlot} with ${selectedDoctor.practitionerName}`);
```

### Use Case 3: Let User Choose By Specialty
```javascript
// Get all slots
const response = await fetch(`/api/public/v2/available-slots?org_id=${ORG_ID}&date=${date}`);

// Group by specialty
const bySpecialty = {};
response.practitioners.forEach(doc => {
  const specialty = doc.specialty || 'General';
  if (!bySpecialty[specialty]) bySpecialty[specialty] = [];
  bySpecialty[specialty].push(doc);
});

// Voice: "We have Family Medicine and Internal Medicine available. Which do you prefer?"
```

---

## 🚀 Benefits

1. **Fewer API Calls** - Get all practitioners' availability in one request instead of multiple
2. **Better User Experience** - Show all options at once
3. **Flexibility** - User can choose doctor, specialty, or earliest available
4. **Performance** - Parallel processing of all practitioners server-side
5. **Backwards Compatible** - Old single-practitioner API still works exactly the same

---

## 🔧 Implementation Details

- **Smart Filtering** - Only returns practitioners who are working on that day and have available slots
- **Performance** - Uses Promise.all() for parallel slot calculation
- **Consistent Format** - Each practitioner in the array has the same format as the single-practitioner response
- **Office Hours Aware** - Respects each doctor's individual schedule
- **Appointment Conflicts** - Automatically excludes booked time slots

---

## 📝 Updated Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `org_id` | ✅ Yes | Organization ID |
| `practitioner_id` | ❌ No | If provided, returns single practitioner. If omitted, returns all. |
| `date` | ✅ Yes | Date in YYYY-MM-DD format |

---

## 🧪 Testing

```bash
# Test with your actual org ID
ORG_ID="23daaa53-3af0-44da-bc07-ad45c26ccec1"

# Get all practitioners' slots for today
curl "http://localhost:8000/api/public/v2/available-slots?org_id=$ORG_ID&date=2025-10-23"

# Should return:
# - List of all working practitioners
# - Their available slots
# - Total counts and summaries
```

**Sample Output:**
```json
{
  "success": true,
  "orgId": "23daaa53-3af0-44da-bc07-ad45c26ccec1",
  "date": "2025-10-23",
  "totalPractitioners": 3,
  "workingPractitioners": 2,
  "totalAvailableSlots": 32,
  "practitioners": [...]
}
```

---

## 📚 Documentation Updated

- ✅ `VAPI_INTEGRATION_COMPLETE.md` - Added examples and explanation
- ✅ `/integrations/vapi-docs` UI page - Updated with both options
- ✅ Code comments in `public.js` route file

---

## 🎬 VAPI Integration Example

```javascript
// In your VAPI function
async function showAvailableAppointments(date) {
  // Get all slots
  const response = await fetch(
    `http://localhost:8000/api/public/v2/available-slots?org_id=${ORG_ID}&date=${date}`
  );

  const data = await response.json();

  if (data.totalAvailableSlots === 0) {
    return "Sorry, there are no appointments available on that date.";
  }

  // Build response
  let message = `Great! We have ${data.totalAvailableSlots} slots available with ${data.workingPractitioners} doctors:\n\n`;

  data.practitioners.forEach((doc, index) => {
    message += `${index + 1}. ${doc.practitionerName}`;
    if (doc.specialty) message += ` (${doc.specialty})`;
    message += ` - ${doc.totalSlots} slots available\n`;
  });

  message += "\nWhich doctor would you like to see?";
  return message;
}
```

---

## ✅ Backwards Compatibility

**Old Code (Still Works):**
```bash
# With practitioner_id - returns single practitioner
GET /api/public/v2/available-slots?org_id=ORG&practitioner_id=PRACT&date=2025-10-25
```

**New Code:**
```bash
# Without practitioner_id - returns all practitioners
GET /api/public/v2/available-slots?org_id=ORG&date=2025-10-25
```

No breaking changes! Existing integrations continue to work.

---

## 🎉 Summary

This enhancement makes the VAPI integration more flexible and reduces the number of API calls needed. Voice assistants can now:

1. Show all available doctors at once
2. Let users choose by specialty or name
3. Find the earliest available slot across all doctors
4. Provide a better user experience with fewer round trips

**Tested and working!** ✅
