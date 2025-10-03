# Appointments Module

This module provides a comprehensive calendar and appointment management system for the EHR application, replacing the previous "Reservations" terminology.

## Features

### Calendar Views
- **Week View**: Shows appointments in a weekly grid with time slots (5 AM - 11 PM)
- **Month View**: Displays a full month calendar with appointment counts and preview
- **Navigation**: Easy switching between views with Today, Previous, and Next navigation

### Appointment Management
- View appointments across different time ranges
- Color-coded appointment status indicators
- Detailed appointment cards showing patient info, doctor, time, and reason
- Real-time statistics showing appointment counts by status

### Statistics Panel
Shows real-time counts for:
- Total appointments
- Scheduled appointments
- In-progress appointments
- Completed appointments
- Cancelled appointments

## Components

### CalendarToolbar
Navigation and view selection toolbar with:
- Date navigation (Previous/Next)
- Today button to jump to current date
- View switcher (Day/Week/Month)
- Current date display

### WeekView
Displays a weekly calendar grid with:
- 7-day view starting from Monday
- Hourly time slots from 5 AM to 11 PM
- Appointment cards in their respective time slots
- Current day highlighting

### MonthView
Shows a full month calendar with:
- Complete month grid view
- Appointment count badges
- Up to 3 appointment previews per day
- Click to switch to day view
- Current day ring indicator

### AppointmentCard
Reusable card component for displaying appointments:
- Two modes: compact (for calendar views) and detailed
- Color-coded by appointment status
- Shows patient name, time, doctor, and reason
- Click handler for appointment selection

### AppointmentStatsPanel
Statistics sidebar showing:
- Real-time appointment counts by status
- Color-coded stat cards
- Loading states

##Fr m x n

├── services/
│   └── appointment.service.ts  # FHIR appointment service
└── types/
    └── appointment.ts        # Type definitions
```

## Usage

Navigate to `/appointments` in the application to access the calendar view.

│       ├── week-view.tsx
│       ├── month-view.tsx
│       ├── appointment-card.tsx
│       └── appointment-stats.tsx
├── services/
│   └── appointment.service.ts  # FHIR appointment service
└── types/
    └── appointment.ts        # Type definitions
```

## Usage

Navigate to `/appointments` in the application to access the calendar view.

### Appointment Status Colors
- **Scheduled**: Blue - Appointments that are booked
- **In Progress**: Yellow - Appointments currently happening
- **Completed**: Green - Finished appointments
- **Cancelled**: Gray - Cancelled appointments
- **No Show**: Red - Patient didn't show up
- **Rescheduled**: Purple - Appointments that were moved

## FHIR Integration

The module integrates with FHIR Appointment resources through `AppointmentService`:
- Fetches appointments using date range queries
- Maps FHIR status to application status
- Creates and updates appointments
- Calculates real-time statistics

## Future Enhancements

Potential improvements:
- Day view implementation
- Appointment creation/edit modal
- Drag-and-drop appointment rescheduling
- Doctor/resource filtering
- Treatment category filtering
- Appointment search functionality
- Export to calendar (iCal)
- Email/SMS reminders
- Recurring appointments
- Appointment conflicts detection
- Patient self-booking portal

## Navigation Changes

The navigation has been updated:
- "Reservations" → "Appointments"
- Route: `/reservations` → `/appointments`
- Icon remains the same (Calendar)

## Development Notes

- Built with Next.js 14+ App Router
- Uses Tailwind CSS for styling
- Implements proper TypeScript types
- Follows SOLID principles and modular architecture
- All components are client-side rendered (`'use client'`)
- Responsive design for different screen sizes
