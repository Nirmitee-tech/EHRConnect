# 100ms "Invalid Room ID" - Debug & Fix

## 🔴 Problem

**Error:** `invalid room id: room_1761707939965`

**Root Cause:** The 100ms integration credentials in the database are **missing the `templateId`** field, which is required for creating valid rooms.

---

## 🔍 Investigation

### Current Database State

```sql
SELECT id, org_id, vendor_id, enabled, credentials
FROM integrations
WHERE vendor_id = '100ms';
```

**Result:**
- ✅ Integration exists: `1767c5de-c03c-48b8-a9f9-3370af45dd0d`
- ✅ Enabled: `true`
- ✅ Has credentials: `appId`, `appSecret`, `apiEndpoint`
- ❌ **Missing:** `templateId`

**Current credentials:**
```json
{
  "appId": "68f3d9eebd0dab5f9a014204",
  "appSecret": "91r3cO...(redacted)",
  "apiEndpoint": "https://api.100ms.live/v2/",
  "recordingEnabled": "false"
}
```

### Why This Causes the Error

1. **Backend creates room** → Uses 100ms API without `template_id`
2. **100ms rejects or creates invalid room** → Room doesn't have proper roles/permissions
3. **Frontend tries to join** → 100ms says "invalid room id: room_XXXXX"
4. **Meeting fails** → Both frontend and 100ms show errors

---

## ✅ Solution

### Step 1: Get Your 100ms Template ID

You need to get a template ID from your 100ms dashboard:

1. Go to: https://dashboard.100ms.live/
2. Navigate to: **Templates** section
3. Find your default template (or create one)
4. Copy the **Template ID** (format: `66b0f6f50c9bb7aeecXXXXXX`)

**Common Template IDs:**
- Video conferencing template: Usually starts with `66b0f6f5...`
- Telehealth template: Custom template with waiting room
- Basic template: Simple video chat

### Step 2: Update Database

Once you have the template ID, run this SQL:

```sql
-- Update 100ms integration with templateId
UPDATE integrations
SET credentials = jsonb_set(
  credentials,
  '{templateId}',
  '"YOUR_TEMPLATE_ID_HERE"'
)
WHERE vendor_id = '100ms'
  AND org_id = '27b52b74-4f64-4ad0-b48d-ae47a8659da2';

-- Verify the update
SELECT vendor_id, enabled, credentials->'templateId' as template_id
FROM integrations
WHERE vendor_id = '100ms';
```

**Example:**
```sql
UPDATE integrations
SET credentials = jsonb_set(
  credentials,
  '{templateId}',
  '"66b0f6f50c9bb7aeec123456"'
)
WHERE vendor_id = '100ms'
  AND org_id = '27b52b74-4f64-4ad0-b48d-ae47a8659da2';
```

### Step 3: Test the Fix

```bash
# Test via API endpoint
curl -X POST "http://localhost:8000/api/integrations/1767c5de-c03c-48b8-a9f9-3370af45dd0d/test" \
  -H "Content-Type: application/json" \
  -H "x-org-id: 27b52b74-4f64-4ad0-b48d-ae47a8659da2"

# Or create a test meeting
curl -X POST "http://localhost:8000/api/virtual-meetings/instant" \
  -H "Content-Type: application/json" \
  -H "x-org-id: 27b52b74-4f64-4ad0-b48d-ae47a8659da2" \
  -d '{
    "appointmentId": "test-appointment-id",
    "patientId": "test-patient-id",
    "practitionerId": "test-practitioner-id"
  }'
```

### Step 4: Verify Room Creation

After the update, when you create a meeting:

1. **Backend logs** should show:
   ```
   ✓ 100ms client initialized for 1767c5de-c03c-48b8-a9f9-3370af45dd0d
   templateId: 66b0f6f50c9bb7aeec123456

   Creating 100ms room: { name: 'Telehealth Consultation...', ... }
   100ms createRoom payload: {
     name: 'Telehealth Consultation...',
     description: '...',
     region: 'us',
     template_id: '66b0f6f50c9bb7aeec123456'  ← Now included!
   }

   ✅ 100ms room created: 674e123456789abc
   ```

2. **Database** should have valid `meeting_id`:
   ```sql
   SELECT id, code, meeting_id, status
   FROM virtual_meetings
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   Expected: `meeting_id` should be like `674e123456789abc` (NOT `room_1761707939965`)

3. **Frontend** should connect successfully:
   - Lobby loads ✅
   - Video preview works ✅
   - "Join now" connects to 100ms ✅
   - No "invalid room id" errors ✅

---

## 🔧 Alternative: If You Don't Have Template ID

If you don't have access to the 100ms dashboard to get the template ID:

### Option 1: List Templates via API

```bash
# Generate management token first (requires appId + appSecret)
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  {
    access_key: '68f3d9eebd0dab5f9a014204',
    type: 'management',
    version: 2
  },
  '91r3cOJCAXDnLUkIvbAqfCiszoLn1Nqf-BTvdQ1nwEDAgdtg17jVSN-2f8u1yqf7fvJ-0MQoKtO69AH7yuX1Febe6R4zEh8a_abicl1fZfY_2FCphHdx0b1QrzjQfHqYjcAcx2AIUTg1uqSh26O0WL18zyGoR1pHl72SfMBAc7Q=',
  { algorithm: 'HS256', expiresIn: '24h', jwtid: Date.now().toString() }
);
console.log(token);
"

# Use the token to list templates
curl -X GET "https://api.100ms.live/v2/templates" \
  -H "Authorization: Bearer YOUR_MANAGEMENT_TOKEN_HERE"
```

### Option 2: Use Default Template

If you can't get the template ID, you can try creating rooms **without** the template_id and see if 100ms accepts it. However, this is NOT recommended as:

- Rooms might not have proper roles (host, guest, viewer)
- Permissions might be incorrect
- Recording/screen sharing might not work

---

## 📊 Verification Checklist

After applying the fix:

- [ ] Database has `templateId` in credentials
- [ ] Backend logs show template_id in createRoom payload
- [ ] New meetings have valid meeting_id (not room_XXXXX)
- [ ] Frontend lobby loads without errors
- [ ] Can join meeting successfully
- [ ] Video/audio streams work
- [ ] No "invalid room id" errors in console

---

## 🎯 Expected Flow After Fix

### 1. Provider starts meeting from appointment
```
Appointment Drawer → Click "Start Video Call" → Backend creates meeting
```

**Backend process:**
1. Loads 100ms integration with templateId ✅
2. Calls 100ms API: POST /v2/rooms with template_id ✅
3. 100ms returns valid room: `{ id: "674e123456789abc", ... }` ✅
4. Saves to DB as meeting_id ✅
5. Generates auth token for that room ✅
6. Returns meeting code ✅

### 2. Anyone joins via public link
```
http://localhost:3000/meeting/ABC123
```

**Frontend process:**
1. Fetch meeting details → Get meeting_id: `674e123456789abc` ✅
2. Join with auth token → 100ms recognizes room ✅
3. Connect to video/audio streams ✅
4. Meeting works! ✅

---

## 🚨 If Still Not Working After Fix

### Check Backend Logs
```bash
# In ehr-api directory
npm run dev

# Look for:
# ✓ 100ms client initialized - Should show templateId
# 100ms createRoom payload - Should include template_id
# ✅ 100ms room created - Should return valid room ID
```

### Check 100ms Dashboard
1. Go to: https://dashboard.100ms.live/
2. Navigate to: **Rooms** section
3. Look for newly created rooms
4. Verify room status is "active" or "scheduled"

### Check Database
```sql
-- Check latest meetings
SELECT
  vm.id,
  vm.code,
  vm.meeting_id,
  vm.status,
  vm.created_at
FROM virtual_meetings vm
ORDER BY vm.created_at DESC
LIMIT 5;

-- Verify integration credentials
SELECT
  vendor_id,
  enabled,
  credentials->'templateId' as template_id,
  health_status
FROM integrations
WHERE vendor_id = '100ms';
```

### Check Frontend Console
Open browser DevTools → Console:
- ❌ "invalid room id" → Still missing templateId or wrong credentials
- ❌ "Failed to join" → Auth token issue
- ✅ "[HMSSDKStore] Joined room" → Success!

---

## 📝 Quick Reference

**Integration ID:** `1767c5de-c03c-48b8-a9f9-3370af45dd0d`
**Organization ID:** `27b52b74-4f64-4ad0-b48d-ae47a8659da2`
**Vendor:** `100ms`
**Missing Field:** `templateId` in credentials JSONB

**SQL Fix:**
```sql
UPDATE integrations
SET credentials = jsonb_set(credentials, '{templateId}', '"YOUR_TEMPLATE_ID"')
WHERE id = '1767c5de-c03c-48b8-a9f9-3370af45dd0d';
```

---

## ✅ Summary

**The Fix:** Add `templateId` to 100ms integration credentials in the database.

**Why:** 100ms requires a template to create rooms with proper roles and permissions.

**How:** Update the JSONB credentials column with your 100ms template ID from the dashboard.

**Result:** Meetings will be created with valid room IDs that 100ms recognizes, and the frontend will be able to join successfully. ✅
