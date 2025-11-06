# Date/Time Selection for Appointments

## Overview
The appointment form now features THREE different modes for date/time selection, allowing users to choose their preferred booking experience based on their workflow and preferences.

## Mode Switcher
Users can toggle between three modes using the mode switcher buttons at the top of the date/time section:
- **Simple Mode** - Basic date/time inputs (traditional form fields)
- **Enhanced Mode** - Calendar view with time slot selection (visual and interactive)
- **Quick Mode** - Dropdown-based selection (fast keyboard-friendly)

---

## Mode 1: Simple Mode

### Description
Traditional date and time input fields - familiar and straightforward.

### Features
- **Date Input**: Standard HTML5 date picker
- **Time Input**: Standard HTML5 time picker with 15-minute intervals
- **Availability Warnings**: Shows practitioner status below inputs
  - Green: Available with working hours
  - Orange: On vacation
  - Red: Not working/unavailable
- **No Time Slots Warning**: Alerts when date has no available slots

### Best For
- Users who prefer traditional form inputs
- Quick data entry
- Keyboard-only navigation
- Screen reader users

---

## Mode 2: Enhanced Mode

### Description
Visual calendar with organized time slot selection - modern and intuitive.

### Features

#### Calendar View (Left Side)
- **Month Navigation**: Navigate between months using arrow buttons
- **Visual Date Selection**: Click on dates in the calendar grid
- **Current Date Highlighting**: Today's date has a blue ring
- **Selected Date**: Highlighted in solid blue
- **Disabled Dates**: Visually grayed out for past dates and unavailable dates
- **Week Layout**: Standard Monday-Sunday week layout
- **Compact Display**: Abbreviated month/year in header

#### Time Slot Selection (Right Side)
Time slots are organized by time of day in **accordion sections**:

- **Morning slots** (12:00 AM - 11:59 AM)
  - Collapsible section
  - Shows slot count (e.g., "12 slots")
  - 3-column grid layout

- **Afternoon slots** (12:00 PM - 4:59 PM)
  - Collapsible section
  - Shows slot count
  - 3-column grid layout

- **Evening Slots** (5:00 PM - 11:59 PM)
  - Collapsible section
  - Shows slot count
  - 3-column grid layout

#### Accordion Behavior
- Click header to expand/collapse sections
- Morning section opens by default
- Chevron icon indicates open/closed state
- Only available slots are shown

#### Time Display
- 12-hour format with AM/PM
- Selected time highlighted in blue
- Hover effects for better UX

### Layout
- **Side-by-Side**: Calendar and time slots displayed side by side
- **Responsive**: Stacks vertically on smaller screens
- **Selected Display**: Shows selected date/time at the top in readable format

### Best For
- Visual learners
- Touch-screen devices
- Users who want to see availability at a glance
- Booking far in advance

---

## Mode 3: Quick Mode

### Description
Dropdown-based selection - fast and keyboard-friendly.

### Features

#### Date Dropdown
- Standard date input with calendar icon
- Keyboard accessible
- Min date validation
- Clears time if unavailable date selected

#### Time Dropdown
- Searchable select dropdown
- All available time slots in 12-hour format
- Disabled when no date selected
- Warning message if no slots available
- Keyboard navigable (type to search)

#### Selected Preview
- Blue card showing full appointment details
- Example: "Monday, October 22, 2022 at 10:00 AM"
- Appears after both date and time are selected
- Easy confirmation of selection

### Best For
- Power users
- Keyboard-heavy workflows
- Fast appointment scheduling
- Users familiar with dropdown interfaces
- Scheduling appointments in sequence

---

## Smart Integration

All three modes share the same underlying logic:

### Practitioner Availability
- Only shows time slots when practitioner is working
- Respects practitioner's office hours
- Disables dates when practitioner is unavailable
- Shows vacation/leave information

### Working Hours
- Generates 15-minute interval time slots
- Filters slots based on working hours
- Automatically updates when practitioner changes

### Validation
- Prevents booking on disabled dates
- Clears time when switching to unavailable date
- Validates against minimum date (today)

### Emergency Override
- All restrictions can be bypassed with emergency flag
- Shows all dates and times when emergency is checked

### All-Day Events
- Switches to simple date-only picker for all-day events
- No time selection needed
- Mode switcher hidden for all-day events

---

## Components

### 1. DateTimeModeSwitcher
**Location**: `src/components/appointments/appointment-form-components/DateTimeModeSwitcher.tsx`

Small toggle component with three buttons:
- Simple (List icon)
- Enhanced (Grid icon)
- Quick (Calendar icon)

Each button shows icon + label and has tooltip with description.

### 2. EnhancedDateTimePicker
**Location**: `src/components/appointments/appointment-form-components/EnhancedDateTimePicker.tsx`

#### Props
- `selectedDate`: Currently selected date (YYYY-MM-DD format)
- `selectedTime`: Currently selected time (HH:MM format)
- `onDateChange`: Callback when date is selected
- `onTimeChange`: Callback when time slot is selected
- `availableTimeSlots`: Array of available time slots in 24-hour format
- `isDateDisabled`: Function to check if a date should be disabled
- `minDate`: Minimum selectable date
- `disabled`: Whether the picker is disabled

#### State Management
- `currentMonth`: Tracks which month to display in calendar
- `openSections`: Tracks which accordion sections are open/closed

#### Key Functions
- `formatTime12Hour()`: Converts 24-hour to 12-hour format
- `handlePrevMonth()`: Navigate to previous month
- `handleNextMonth()`: Navigate to next month
- `handleDateClick()`: Handles date selection
- `handleTimeSlotClick()`: Handles time slot selection
- `toggleSection()`: Opens/closes accordion sections

### 3. QuickDateTimePicker
**Location**: `src/components/appointments/appointment-form-components/QuickDateTimePicker.tsx`

#### Props
Same as EnhancedDateTimePicker

#### Features
- Date input with calendar icon
- Time dropdown (select element)
- Selected preview card
- No slots warning
- Clean, compact layout

### 4. AppointmentFormFields (Updated)
**Location**: `src/components/appointments/appointment-form-components/AppointmentFormFields.tsx`

#### New State
- `dateTimeMode`: Tracks current mode ('simple' | 'enhanced' | 'quick')

#### Changes
- Added mode switcher component
- Conditional rendering based on selected mode
- Moved availability info to only show in simple mode
- Maintains all existing validation logic

---

## Styling
All components use consistent Tailwind CSS styling:
- **Blue theme** for selected/active states (#2563eb)
- **Gray theme** for disabled/unavailable states
- **Hover effects** for interactive elements
- **Responsive sizing** with proper spacing
- **Accessible** with proper contrast ratios
- **Animations** for smooth transitions

---

## User Experience

### Visual Hierarchy
1. Mode switcher (small, top-right)
2. Selected date/time display (prominent)
3. Calendar/form (primary interaction area)
4. Time slots/options (secondary interaction area)

### Feedback
- Selected items clearly highlighted
- Disabled states clearly indicated
- Hover states for all clickable elements
- Smooth transitions between states
- Clear error messages

### Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- Proper ARIA attributes
- Focus management
- High contrast mode compatible

---

## Future Enhancements

Potential improvements:
- Remember user's preferred mode in local storage
- Multi-day selection for recurring appointments
- Drag to select time range in Enhanced mode
- Visual indicators for partially booked slots
- Integration with external calendars
- Time zone support
- Suggested/popular time slots
- Quick reschedule from existing appointment
- Batch appointment creation

---

## Migration Notes

### For Users
- Default mode is Enhanced (most visual)
- All modes work with existing data
- Mode preference not persisted (resets on page reload)
- All validation rules apply regardless of mode

### For Developers
- All date/time logic centralized in AppointmentFormFields
- Each mode component is independent and reusable
- Same props interface for all picker components
- Easy to add new modes if needed
- No breaking changes to existing API
