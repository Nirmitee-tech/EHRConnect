# Phase 2.3: OB/GYN Pack - Testing Guide

## 🧪 Complete Testing Walkthrough

### Prerequisites
- ✅ Phase 2.1 complete (Episode system)
- ✅ Phase 2.2 complete (Specialty infrastructure)
- ✅ Backend running on port 8000
- ✅ Frontend running on port 3000

---

## Test 1: Backend Pack Loading

### Start Backend
```bash
cd ehr-api
npm run dev
```

### Verify Pack Loads
Look for this in console:
```
✅ Loaded specialty pack: ob-gyn v1.0.0
```

### Test Pack API
```bash
# Get all packs
curl http://localhost:8000/api/specialties/packs \
  -H "x-org-id: YOUR_ORG_ID"

# Get OB/GYN pack specifically
curl http://localhost:8000/api/specialties/packs/ob-gyn \
  -H "x-org-id: YOUR_ORG_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "pack": {
    "slug": "ob-gyn",
    "version": "1.0.0",
    "name": "OB/GYN & Prenatal Care",
    "navigation": {
      "sections": [...]
    }
  }
}
```

---

## Test 2: Enable OB/GYN Pack

### Option A: Via Admin UI
1. Navigate to `http://localhost:3000/admin/specialties`
2. Find "OB/GYN & Prenatal Care" card
3. Click "Enable"
4. Verify success message

### Option B: Via API
```bash
curl -X PUT http://localhost:8000/api/admin/orgs/YOUR_ORG_ID/specialties \
  -H "Content-Type: application/json" \
  -H "x-org-id: YOUR_ORG_ID" \
  -H "x-user-id: YOUR_USER_ID" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{
    "enable": [{ "slug": "ob-gyn", "version": "1.0.0" }],
    "disable": []
  }'
```

---

## Test 3: Frontend Module Registration

### Start Frontend
```bash
cd ehr-web
npm run dev
```

### Check Console
Look for:
```
🚀 Initializing specialty modules...
✅ Registered specialty module: OB/GYN & Prenatal Care (ob-gyn)
✅ Registered 1 specialty module(s):
   - OB/GYN & Prenatal Care (ob-gyn): 2 components
```

---

## Test 4: Sidebar Navigation

### Navigate to Patient Page
Go to any patient detail page (e.g., `/patients/test-123`)

### Check Sidebar Dropdown
Click the dropdown at top of sidebar

**Should see:**
```
┌──────────────────────────┐
│ All Sections             │
│ Clinical                 │
│ Admin                    │
│ Financial                │
│ ────────────────────────│
│ OB/GYN & Prenatal Care   │ ← NEW!
└──────────────────────────┘
```

### Select OB/GYN
Click "OB/GYN & Prenatal Care"

**Navigation should show:**
- Dashboard
- Prenatal Overview ⭐
- Prenatal Flowsheet ⭐
- Ultrasounds ⭐
- Labor & Delivery ⭐
- Postpartum Care ⭐
- Medications
- Lab Results
- Visit Details

---

## Test 5: Create Prenatal Episode

### Via Browser Console
```javascript
// Open DevTools console on patient page
const createEpisode = async () => {
  const response = await fetch('http://localhost:8000/api/patients/test-123/episodes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-org-id': 'YOUR_ORG_ID',
      'x-user-id': 'YOUR_USER_ID'
    },
    body: JSON.stringify({
      specialtySlug: 'ob-gyn',
      status: 'active',
      metadata: {
        lmp: '2024-06-01',
        edd: '2025-03-08',
        gravida: 2,
        para: 1,
        highRisk: false,
        gestationalAge: 28
      }
    })
  });

  const data = await response.json();
  console.log('Created episode:', data);
};

createEpisode();
```

**Expected:**
```json
{
  "success": true,
  "episode": {
    "id": "...",
    "specialtySlug": "ob-gyn",
    "status": "active",
    "metadata": { ... }
  }
}
```

---

## Test 6: View Prenatal Components

### Test Prenatal Overview
1. In sidebar, select "OB/GYN" filter
2. Click "Prenatal Overview"
3. **Should see:**
   - Key metrics (EDD, Gestational Age, Trimester, G/P)
   - Care timeline
   - Quick action buttons

### Test Prenatal Flowsheet
1. Click "Prenatal Flowsheet"
2. **Should see:**
   - Summary cards (Weight, BP, FHR, Fundal Height)
   - Visit history table
   - "Add New Entry" button

---

## Test 7: Episode Hooks

### Test in Component
Create a test component:

```typescript
// test-component.tsx
'use client';

import { useObGynEpisode } from '@/features/specialties/ob-gyn';

export function TestObGyn() {
  const {
    obgynEpisode,
    hasObGynEpisode,
    startPrenatalEpisode
  } = useObGynEpisode();

  console.log('Has episode:', hasObGynEpisode);
  console.log('Episode data:', obgynEpisode);

  return (
    <div>
      <p>Has OB/GYN Episode: {hasObGynEpisode ? 'Yes' : 'No'}</p>
      {obgynEpisode && (
        <pre>{JSON.stringify(obgynEpisode.metadata, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

## Test 8: Specialty Registry

### Test via Console
```javascript
// In browser console
import { specialtyRegistry } from '@/features/specialties';

// Get stats
const stats = specialtyRegistry.getStats();
console.log('Registry stats:', stats);

// Get OB/GYN module
const obgyn = specialtyRegistry.get('ob-gyn');
console.log('OB/GYN module:', obgyn);

// Get component
const Overview = specialtyRegistry.getComponent('ob-gyn', 'PrenatalOverview');
console.log('Has component:', !!Overview);
```

---

## Test 9: Episode Lifecycle

### Create Episode
```bash
curl -X POST http://localhost:8000/api/patients/test-123/episodes \
  -H "Content-Type: application/json" \
  -H "x-org-id: YOUR_ORG_ID" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "specialtySlug": "ob-gyn",
    "status": "active",
    "metadata": {
      "lmp": "2024-06-01",
      "edd": "2025-03-08",
      "gravida": 2,
      "para": 1
    }
  }'
```

### Update Episode
```bash
curl -X PATCH http://localhost:8000/api/patients/test-123/episodes/EPISODE_ID \
  -H "Content-Type: application/json" \
  -H "x-user-id": "YOUR_USER_ID" \
  -d '{
    "metadata": {
      "gestationalAge": 29,
      "highRisk": true,
      "riskFactors": "Advanced maternal age"
    }
  }'
```

### Close Episode (Delivery)
```bash
curl -X POST http://localhost:8000/api/patients/test-123/episodes/EPISODE_ID/close \
  -H "Content-Type: application/json" \
  -H "x-user-id": "YOUR_USER_ID" \
  -d '{
    "reason": "Delivery completed - healthy baby girl"
  }'
```

---

## Test 10: FHIR Compliance

### Get FHIR EpisodeOfCare Resource
```bash
curl http://localhost:8000/api/episodes/fhir/EPISODE_ID \
  -H "x-org-id: YOUR_ORG_ID"
```

**Expected FHIR Resource:**
```json
{
  "resourceType": "EpisodeOfCare",
  "id": "...",
  "status": "active",
  "type": [{
    "coding": [{
      "system": "urn:ehrconnect:specialty",
      "code": "ob-gyn",
      "display": "ob-gyn"
    }]
  }],
  "patient": {
    "reference": "Patient/test-123"
  },
  "period": {
    "start": "2025-01-09T...",
    "end": null
  }
}
```

---

## ✅ Success Criteria

All tests should pass:
- [ ] Backend loads OB/GYN pack
- [ ] Pack can be enabled via UI or API
- [ ] Frontend registers OB/GYN module
- [ ] Sidebar shows OB/GYN option in dropdown
- [ ] Selecting OB/GYN filters navigation correctly
- [ ] OB/GYN sections appear (Prenatal Overview, Flowsheet, etc.)
- [ ] Can create prenatal episodes
- [ ] Prenatal Overview displays episode data
- [ ] Prenatal Flowsheet renders correctly
- [ ] Episode hooks work as expected
- [ ] Specialty registry functions correctly
- [ ] Episode lifecycle (create/update/close) works
- [ ] FHIR resources generate correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance is acceptable (<1s page load)

---

## 🐛 Common Issues & Solutions

### Issue: OB/GYN not in dropdown
**Solution:** Check if pack is enabled in admin panel

### Issue: Components not loading
**Solution:** Check browser console for import errors

### Issue: Episode not displaying
**Solution:** Verify episode was created and is active

### Issue: Navigation not filtering
**Solution:** Clear cache and refresh page

### Issue: TypeScript errors
**Solution:** Run `npm run build` to check for type issues

---

## 🎉 All Tests Passing?

**Congratulations! The OB/GYN specialty pack is fully functional!**

You now have a complete, working demonstration of the specialty system. Use this as a blueprint to create more specialties! 🚀
