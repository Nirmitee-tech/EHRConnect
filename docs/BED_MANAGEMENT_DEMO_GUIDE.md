# Bed Management Demo Guide

## Quick Start

### Access the Demo
1. Navigate to `/bed-management`
2. Click on **"Demo Floor Plan"** card (green background with "Try Now" badge)
3. Or directly visit: `/bed-management/demo`

## What You'll See

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Back button, Stats (6 beds total), Reset button        │
├─────────────────────────────────────┬───────────────────────────┤
│                                     │                           │
│  Floor Plan (Rooms with Beds)       │  Operations Panel         │
│                                     │                           │
│  🟩 Green = Available               │  Scheduled procedures:    │
│  🟥 Red = Occupied (with patient)   │  - 14:30 Cardiac Cath    │
│  🟨 Yellow = Reserved               │  - 16:00 Cholecystectomy │
│  🟦 Blue = Cleaning                 │                           │
│                                     │                           │
├─────────────────────────────────────┴───────────────────────────┤
│  Event Timeline (Admission/Discharge/Transfer Log)              │
└─────────────────────────────────────────────────────────────────┘
```

## Mock Data Included

### Pre-loaded Patients (2)
1. **Weib, O.** (MRN: 1978)
   - Bed: OIM1-10 (Room 101)
   - Diagnosis: Acute Appendicitis
   - Doctor: Dr. Wilson
   - Admitted: 2 hours ago

2. **Schmidt, M.** (MRN: 2154)
   - Bed: OIM2-01 (Room 102)
   - Diagnosis: Osteoarthritis of hip
   - Doctor: Dr. Anderson
   - Admitted: 6 hours ago

### Available Beds (3)
- OIM1-05 (Room 101) - Available
- OIM2-02 (Room 102) - Available
- OIM2-03 (Room 103) - Reserved
- OIM2-04 (Room 103) - Cleaning

### Scheduled Operations (2)
- 14:30 - Mueller, K. - Cardiac Catheterization
- 16:00 - Johnson, L. - Laparoscopic Cholecystectomy

## How to Interact

### 1. View Bed Details
**Action:** Hover over any bed
**Result:** See bed number, features (oxygen, monitor), and patient details

### 2. View Patient Information
**Action:** Hover over the blue patient figure
**Result:** See patient name, MRN, diagnosis, doctor, admission date

### 3. Admit a Patient to an Available Bed

**Steps:**
1. Click on a **GREEN bed** (available status)
2. A dialog will pop up: "Admit Patient to [BED NUMBER]"
3. Fill in the form:
   - **Patient Name** (e.g., "Doe, John")
   - **MRN** (Medical Record Number, e.g., "5678")
   - **Primary Diagnosis** (e.g., "Pneumonia")
   - **Priority** (Routine/Urgent/Emergency)
4. Click **"Admit Patient"** button

**What Happens:**
- Bed turns RED (occupied)
- Blue patient figure appears next to the bed
- New event added to the timeline at the bottom
- Hospitalization record created
- Bed occupancy stats updated in header

### 4. View Events Timeline
**Action:** Scroll through the event log at the bottom
**Result:** See all admissions, discharges, transfers with timestamps

### 5. View Operations
**Action:** Look at the right panel
**Result:** See scheduled procedures with patient names, times, and status

### 6. Reset Demo
**Action:** Click "Reset" button in top-right
**Result:** Refreshes the page to original state

## Interactive Features

### ✅ Working Features
- ✓ Visual room layouts with beds
- ✓ Patient icons on occupied beds
- ✓ Hover tooltips for bed/patient details
- ✓ Click available beds to admit patients
- ✓ Real-time updates (bed status, stats, events)
- ✓ Event timeline with chronological log
- ✓ Operations schedule panel

### 🚧 To Be Implemented (Click shows alert)
- Patient details modal (click patient icon)
- Operation details modal (click operation)
- Bed transfer functionality
- Patient discharge
- Bed status change
- Real-time WebSocket updates

## Visual Elements Explained

### Bed Colors
- 🟩 **Green** = Available (click to admit patient)
- 🟥 **Red** = Occupied (patient assigned)
- 🟨 **Yellow** = Reserved (bed held for scheduled admission)
- 🟦 **Blue** = Cleaning (being cleaned/sanitized)
- 🟧 **Orange** = Maintenance (out of service)
- ⬜ **Gray** = Out of Service

### Room Elements
- **Door indicator**: Dark bar on left side of room
- **Room number badge**: Top-left of each room
- **Occupancy counter**: Shows occupied/total (e.g., "2/2")
- **Room type badge**: Shows room classification

### Bed Features (Small dots below beds)
- 🟣 **Purple dot** = Monitor available
- 🩵 **Cyan dot** = Oxygen available

### Patient Figure
- 👤 **Blue person icon** = Patient occupying bed
- 🔴 **Red alert badge** = Isolation required

## Event Types in Timeline

- 🟢 **Green** = Admission
- 🔵 **Blue** = Discharge
- 🟣 **Purple** = Transfer In
- 🟠 **Orange** = Transfer Out
- ⚪ **Gray** = Status Change
- 🔴 **Red** = Maintenance
- 🩵 **Cyan** = Cleaning
- 🟡 **Yellow** = Reservation

## Tips

1. **Start Simple**: Try admitting 1-2 patients first
2. **Check Events**: After each action, scroll down to see it logged
3. **Explore Tooltips**: Hover over everything to discover details
4. **Mobile**: Works on mobile but best viewed on desktop/tablet
5. **Reset Anytime**: Use the Reset button to start fresh

## Differences from Production

This is a **demo page** with:
- ✓ Mock/fake data (not connected to your database)
- ✓ Simplified admission form
- ✓ Instant updates (no API calls)
- ✓ Limited to 6 beds in one ward

The **production page** (`/bed-management/floor-plan`) will:
- Connect to your real database
- Show all your actual wards and beds
- Require proper authentication
- Include full patient management features

## Next Steps

After trying the demo, you can:
1. **Customize** the floor plan layout in `ward-floor-plan.tsx`
2. **Add more beds** by editing the mock data
3. **Connect to API** by using the production page
4. **Implement missing features** (discharge, transfer, etc.)

## Troubleshooting

**Problem:** Can't see any beds
**Solution:** Make sure you're on `/bed-management/demo` (not `/floor-plan`)

**Problem:** Dialog doesn't open when clicking bed
**Solution:** Make sure you're clicking a GREEN (available) bed

**Problem:** Changes disappear after refresh
**Solution:** This is expected - demo uses in-memory data. Use Reset button instead.

**Problem:** Layout looks broken
**Solution:** Try a wider screen or zoom out (Ctrl/Cmd + -)

## Demo URL

**Direct Link:** `http://localhost:3000/bed-management/demo`

(Replace `localhost:3000` with your actual dev server URL)

---

Enjoy exploring the Bed Management System! 🏥
