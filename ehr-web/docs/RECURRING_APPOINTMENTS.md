# Recurring Appointments Feature

## Overview
Added comprehensive recurring appointment functionality with repeat options, day selection, and additional appointment details.

---

## New Fields Added

### 1. Repeat / Recurring Appointments Section

**Repeat Checkbox**
- Checkbox to enable recurring appointments
- When checked, shows additional recurrence options
- Located in a gray bordered section for visual grouping

**Every X Period**
- Number input (min: 1) for interval
- Dropdown for period selection:
  - Day
  - Week
  - Month
  - Year
- Example: "Every 2 weeks" or "Every 1 month"

**Repeat On (Days of Week)**
- Only visible when period is "Week"
- 7 clickable buttons: S M T W T F S
- Multi-select capability
- Selected days shown in blue
- Unselected days shown in white with border
- Allows selecting specific days of the week for recurring appointments

**End On**
- Date picker for recurrence end date
- Minimum date is the appointment start date
- Allows setting when recurring appointments should stop

### 2. Chief Complaint
- Text input field
- Captures primary reason for visit
- Placeholder: "Enter chief complaint"

### 3. Reason
- Textarea field (2 rows)
- Detailed explanation for appointment
- Placeholder: "Enter reason for appointment"

### 4. Send Form
- Text input field (will be enhanced to searchable select)
- Allows selecting forms to send to patient
- Placeholder: "Search & Select Forms"

---

## Field Structure in formData

```typescript
formData = {
  // Existing fields...

  // Recurring appointment fields
  isRecurring: boolean,
  recurrenceInterval: number,     // e.g., 1, 2, 3
  recurrencePeriod: string,       // 'day' | 'week' | 'month' | 'year'
  recurrenceDays: number[],       // [0,1,2,3,4,5,6] (0=Sunday, 6=Saturday)
  recurrenceEndDate: string,      // ISO date string

  // Additional details
  chiefComplaint: string,
  reason: string,
  sendForm: string
}
```

---

## UI/UX Design

### Repeat Section
```
┌─────────────────────────────────────┐
│ ☑ Repeat                            │
│                                     │
│ Every                               │
│ ┌────┐  ┌──────────────────────┐  │
│ │ 1  │  │ Week             ▼   │  │
│ └────┘  └──────────────────────┘  │
│                                     │
│ Repeat On                           │
│ [S] [M] [T] [W] [T] [F] [S]        │
│                                     │
│ End On                              │
│ ┌──────────────────────────────┐  │
│ │ Choose Date                   │  │
│ └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Day Selection Buttons
- Square buttons (40x40px)
- Toggle on/off with click
- Selected: Blue background, white text
- Unselected: White background, gray border
- Hover effect: Blue border

---

## Features

### Dynamic Visibility
- Recurrence options only show when "Repeat" is checked
- Day selection only shows when period is "Week"
- Collapsible design saves space when not needed

### Validation
- Interval must be at least 1
- End date must be after start date
- At least one day must be selected for weekly recurrence (recommended)

### User Experience
- Clear visual grouping in gray bordered section
- Intuitive day selection with toggle buttons
- Standard date picker for end date
- Dropdown for easy period selection

---

## Use Cases

### Weekly Recurring Appointments
```
Example: Physical therapy every Tuesday and Thursday for 8 weeks
- Repeat: ✓
- Every: 1 Week
- Repeat On: T, T (Tuesday, Thursday selected)
- End On: 8 weeks from start date
```

### Monthly Recurring Appointments
```
Example: Monthly checkup for 6 months
- Repeat: ✓
- Every: 1 Month
- End On: 6 months from start date
```

### Daily Recurring Appointments
```
Example: Daily wound care for 2 weeks
- Repeat: ✓
- Every: 1 Day
- End On: 2 weeks from start date
```

---

## Integration Points

### Form Data
All new fields integrate with existing `onFormDataChange` handler:
```typescript
onFormDataChange('isRecurring', true)
onFormDataChange('recurrenceInterval', 2)
onFormDataChange('recurrencePeriod', 'week')
onFormDataChange('recurrenceDays', [1, 3, 5]) // Mon, Wed, Fri
onFormDataChange('recurrenceEndDate', '2025-12-31')
onFormDataChange('chiefComplaint', 'Back pain')
onFormDataChange('reason', 'Chronic back pain treatment')
onFormDataChange('sendForm', 'Medical History Form')
```

### Backend Integration
When saving appointment, these fields will be included in the appointment data:
- Create recurring appointment series
- Generate individual appointments based on recurrence rules
- Apply same details (practitioner, location, duration) to all instances
- Store chief complaint and reason with each appointment

---

## Future Enhancements

### Planned Improvements
- [ ] Convert "Send Form" to searchable select with form list
- [ ] Add visual calendar preview of recurring dates
- [ ] Show count of appointments that will be created
- [ ] Add "Never" option for end date (with max limit)
- [ ] Add "After X occurrences" option
- [ ] Advanced recurrence (e.g., "First Monday of each month")
- [ ] Conflict detection for recurring appointments
- [ ] Bulk edit/cancel recurring appointment series
- [ ] Exception handling (skip specific dates)

### Send Form Enhancement
Current: Simple text input
Planned: SearchableSelect with:
- List of available forms
- Multi-select capability
- Preview form before sending
- Auto-send options

---

## Implementation Details

### Location
File: `src/components/appointments/appointment-form-components/AppointmentFormFields.tsx`

Lines: 640-765

### Dependencies
- Uses existing form infrastructure
- Integrates with `onFormDataChange` handler
- No new dependencies required
- Pure React with Tailwind CSS

### Styling
- Consistent with existing form design
- Blue theme for active states
- Gray theme for inactive/borders
- Responsive layout
- Proper spacing and alignment

---

## Testing Checklist

- [x] Repeat checkbox toggles recurrence options
- [x] Interval number input accepts values
- [x] Period dropdown shows all options
- [x] Day selection buttons toggle on/off
- [x] Multiple days can be selected
- [x] Day selection only shows for weekly period
- [x] End date picker has correct min date
- [x] Chief complaint accepts text input
- [x] Reason accepts multiline text
- [x] Send form accepts text input
- [x] All fields integrate with formData
- [x] TypeScript compilation succeeds

---

## Summary

Successfully added comprehensive recurring appointment functionality:

✅ **Repeat Checkbox** - Enable/disable recurring appointments
✅ **Interval & Period** - Every X days/weeks/months/years
✅ **Day Selection** - Select specific days of week (S M T W T F S)
✅ **End Date** - When recurrence should stop
✅ **Chief Complaint** - Primary reason for visit
✅ **Reason** - Detailed explanation
✅ **Send Form** - Form selection (currently text input)

All fields are fully integrated and ready for backend implementation of recurring appointment series creation.
