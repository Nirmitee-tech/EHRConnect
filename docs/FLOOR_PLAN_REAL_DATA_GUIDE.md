# Floor Plan Bed Management - Real Data Guide

## 🎉 Now Working with Your Actual Database!

The Floor Plan page now connects to your real bed management database and allows you to admit patients directly from the visual interface.

## Quick Access

### Main Navigation
1. Go to `/bed-management`
2. Click **"Floor Plan View"** (blue card with "Real Data" badge)
3. Or directly: `/bed-management/floor-plan`

## What's Connected to Real Data

### ✅ Real Data Sources
- **Wards**: Your actual ward configuration from the database
- **Beds**: All your real beds with current status
- **Patients**: Current hospitalizations and admissions
- **Bed Events**: Generated from your hospitalization records
- **API Integration**: Full CRUD operations through bed-management service

### 🔄 Mock Data (Temporary)
- **Operations Schedule**: Still using sample data (awaiting operations API)

## Features

### 1. Visual Floor Plan
- **Room layouts** with your actual rooms and beds
- **Color-coded beds**:
  - 🟩 Green = Available (click to admit)
  - 🟥 Red = Occupied (patient assigned)
  - 🟨 Yellow = Reserved
  - 🟦 Blue = Cleaning
  - 🟧 Orange = Maintenance
- **Patient figures** appear next to occupied beds
- **Hover tooltips** show full bed/patient details

### 2. Patient Admission
Click any **GREEN (available) bed** to admit a patient:

**Form Fields:**
- Patient Name* (required)
- MRN (Medical Record Number)
- Admission Reason* (required)
- Primary Diagnosis
- Diagnosis Code (ICD-10)
- Attending Doctor Name
- Priority* (Routine/Urgent/Emergency)

**What Happens:**
1. Creates hospitalization record in database
2. Assigns bed to patient
3. Updates bed status to "occupied"
4. Patient figure appears on floor plan
5. Event added to timeline
6. All data saved to your database

### 3. Ward Switching
- **Tabs at top**: Switch between your wards
- **Occupancy badges**: Shows occupied/total beds per ward
- **Auto-select**: First ward selected by default

### 4. Event Timeline (Bottom Panel)
- **Auto-generated** from your hospitalization records
- Shows:
  - Admissions (when patients were admitted)
  - Discharges (when patients were discharged)
  - Timestamps and performing staff
  - Patient MRN and details
- **Click event** to highlight the bed on floor plan
- **Scrollable** history

### 5. Operations Panel (Right Side)
- Currently shows sample operations
- **TODO**: Connect to your operations/surgery schedule API

## Step-by-Step: Admit Your First Patient

### Prerequisites
Make sure you have:
1. ✅ At least one ward created
2. ✅ At least one bed in that ward
3. ✅ Bed status = "available"

### Steps

**1. Navigate to Floor Plan**
```
/bed-management → Click "Floor Plan View"
```

**2. Select Ward** (if you have multiple)
```
Click the ward tab at the top
```

**3. Find Available Bed**
```
Look for GREEN beds in the room layout
```

**4. Click the Green Bed**
```
A dialog will pop up: "Admit Patient to [BED-NUMBER]"
```

**5. Fill Patient Information**
```
Patient Name*:     Doe, John
MRN:              MRN-12345
Admission Reason*: Post-operative care
Diagnosis:        Acute Appendicitis
Diagnosis Code:   K35.8
Doctor:           Dr. Smith
Priority*:        Urgent
```

**6. Submit**
```
Click "Admit Patient" button
Wait for "Patient admitted successfully!" message
```

**7. See Results**
```
✅ Bed turns RED
✅ Blue patient figure appears
✅ Header stats update (occupied count increases)
✅ Event added to timeline
✅ Data persisted to database
```

## Real-World Usage

### Daily Workflow

**Morning Rounds:**
1. Open floor plan to see current occupancy
2. Check available beds (green)
3. Review event timeline for overnight admissions/discharges

**Admitting from ER:**
1. Patient arrives needing admission
2. Click available bed matching patient needs
3. Fill admission form
4. Submit - bed immediately assigned

**Ward Changes:**
1. Switch between wards using tabs
2. See real-time occupancy per ward
3. Identify available capacity

### Data Persistence

All changes are **immediately saved** to your database:
- ✅ Hospitalizations table updated
- ✅ Bed assignments recorded
- ✅ Bed status changed
- ✅ Timestamps recorded
- ✅ Refresh page = data persists

## API Calls Used

The floor plan makes these API calls:

```typescript
// Load data
await bedManagementService.getWards(orgId, userId, filters)
await bedManagementService.getBeds(orgId, userId, filters)
await bedManagementService.getHospitalizations(orgId, userId, filters)

// Admit patient
const hosp = await bedManagementService.admitPatient(orgId, userId, data)
await bedManagementService.assignBed(orgId, userId, assignment)
```

See `/services/bed-management.ts` for full API documentation.

## Empty States

### No Wards
If you see "No Wards Found":
1. Click "Configure Wards" button
2. Or go to `/bed-management/wards`
3. Create at least one ward

### No Beds in Ward
If you see "No beds found in this ward":
1. Click "Add Beds" button
2. Or go to `/bed-management/beds`
3. Add beds to the selected ward

### No Events
If timeline is empty:
- Events are generated from hospitalizations
- Admit a patient to see events appear
- Past admissions will show in timeline

## Differences from Demo

| Feature | Demo Page | Floor Plan (Real Data) |
|---------|-----------|------------------------|
| Data Source | Mock/Fake | Your Database |
| Beds | 6 sample beds | All your beds |
| Wards | 1 sample ward | All your wards |
| Patients | Test patients | Real patients |
| Admission | In-memory only | Saved to DB |
| Refresh | Data lost | Data persists |
| URL | `/demo` | `/floor-plan` |

## Troubleshooting

### "No wards found"
**Cause**: No wards configured in your database
**Solution**: Create wards at `/bed-management/wards`

### "No beds found in this ward"
**Cause**: Selected ward has no beds
**Solution**: Add beds at `/bed-management/beds`

### Can't click any beds
**Cause**: No beds are "available" status
**Solution**: Check bed status at `/bed-management/beds`

### Admission fails
**Common causes:**
- Missing orgId or authentication
- Invalid location ID
- Database connection issue
**Solution**: Check browser console for error details

### Layout looks broken
**Cause**: Too many beds in one room or screen too small
**Solution**: Zoom out (Ctrl/Cmd + -) or use larger screen

## Next Steps

### Now Available
- ✅ View real beds and patients
- ✅ Admit patients from floor plan
- ✅ See bed occupancy in real-time
- ✅ Track admission events

### Coming Soon
- 🚧 Patient discharge from floor plan
- 🚧 Bed transfer (drag-and-drop)
- 🚧 Real operations schedule integration
- 🚧 Patient detail modals
- 🚧 Bed status change from floor plan
- 🚧 Real-time WebSocket updates
- 🚧 Filtering and search

## Development Notes

### Key Files
```
/app/bed-management/floor-plan/page.tsx     # Main page (real data)
/app/bed-management/demo/page.tsx           # Demo page (mock data)
/components/bed-management/ward-floor-plan.tsx     # Room layout
/components/bed-management/bed-event-timeline.tsx  # Event log
/components/bed-management/operations-panel.tsx    # Operations
/services/bed-management.ts                 # API service
/types/bed-management.ts                    # TypeScript types
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Testing
1. **Demo page** (`/demo`) - Test UI with mock data
2. **Floor plan** (`/floor-plan`) - Test with real data
3. **Compare**: Changes in floor plan persist across refreshes

## Tips

1. **Start with Demo**: Try `/demo` first to learn the UI
2. **Then Use Real**: Switch to `/floor-plan` for actual work
3. **Keyboard**: Tab through form fields for faster admission
4. **Refresh**: Click refresh button to see latest data
5. **Hover Everything**: Tooltips show additional details

## Support

**Issues?**
- Check browser console for errors
- Verify API is running (`http://localhost:8000`)
- Ensure you're logged in with proper org_id
- Check network tab for failed API calls

**Documentation:**
- `BED_MANAGEMENT_DEMO_GUIDE.md` - Demo page guide
- `VISUAL_BED_MANAGEMENT.md` - Technical docs
- `BED_MANAGEMENT_*.md` - Other bed management docs

---

Enjoy managing your beds with real data! 🏥
