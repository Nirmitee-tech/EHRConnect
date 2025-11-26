# Visual Bed Management System

## Overview

The Visual Bed Management System provides an interactive, real-time view of bed occupancy, patient assignments, and scheduled operations - similar to hospital management systems like RWTH Aachen.

## Features

### 1. Room-Based Visualization
- Visual room layouts with bed icons
- Patient icons overlaid on occupied beds
- Color-coded bed status (available, occupied, reserved, cleaning, maintenance, out of service)
- Room features and capacity display

### 2. Interactive Tooltips
- Hover over any bed to see detailed information:
  - Bed number and type
  - Current status
  - Room number
  - Bed features (oxygen, monitor, suction, IV)
  - Patient information (if occupied)
  - Admission date and attending doctor
  - Isolation requirements

### 3. Operations Panel
- Real-time schedule of surgical procedures
- Color-coded by priority (routine, urgent, emergency)
- Status tracking (scheduled, in progress, completed, cancelled)
- Bed assignment status
- ICU requirements
- Estimated procedure duration

### 4. Time Navigation
- Current date and time display
- Navigate between time slots
- Jump to current time
- Real-time updates (every minute)

### 5. Ward Filtering
- View all wards or filter by specific ward
- Split view showing multiple wards side-by-side
- Ward occupancy statistics

## File Structure

```
ehr-web/src/
├── app/bed-management/
│   ├── visual/
│   │   └── page.tsx                    # Main visual bed management page
│   ├── map/
│   │   └── page.tsx                    # Simple bed status map
│   └── page.tsx                        # Bed management dashboard
│
├── components/bed-management/
│   ├── room-bed-visualization.tsx      # Room and bed visualization component
│   └── operations-panel.tsx            # Operations schedule panel
│
├── services/
│   └── bed-management.ts               # API service layer
│
└── types/
    └── bed-management.ts               # TypeScript type definitions
```

## Usage

### Accessing the Visual Bed Management

1. Navigate to `/bed-management` in your EHR application
2. Click on "Visual Bed Management" card
3. Or directly access `/bed-management/visual`

### Interacting with the Interface

**Viewing Bed Details:**
- Hover over any bed icon to see detailed information
- Click on a bed to open full bed details (TODO: implement modal)

**Patient Information:**
- Blue patient icon appears on occupied beds
- Click the patient icon to view patient details (TODO: implement drawer)

**Operations Schedule:**
- View scheduled operations in the right panel
- Color-coded by priority and status
- Shows bed assignment status
- Click on an operation to see full details (TODO: implement modal)

**Ward Navigation:**
- Use the ward tabs at the top to filter by ward
- Select "All Wards" to see all wards in split view
- Left and center panels show different wards

**Time Navigation:**
- Use the arrow buttons to navigate between time slots
- Click "Now" to jump to current time
- Current time updates automatically every minute

## Component Props

### RoomBedVisualization

```typescript
interface RoomBedVisualizationProps {
  beds: Bed[];
  rooms?: Room[];
  hospitalizations: Hospitalization[];
  onBedClick?: (bed: Bed) => void;
  onPatientClick?: (hospitalization: Hospitalization) => void;
}
```

### OperationsPanel

```typescript
interface OperationsPanelProps {
  operations: Operation[];
  onOperationClick?: (operation: Operation) => void;
  title?: string;
  showDate?: boolean;
}
```

## Integration with Backend

The visual bed management system integrates with your existing bed management API:

- `getBeds()` - Fetches bed data with filters
- `getWards()` - Fetches ward information
- `getHospitalizations()` - Fetches current patient admissions

### Operations Data

Currently, operations data is mocked in the page component. To integrate with your backend:

1. Create an operations API endpoint
2. Add operation types to your type definitions
3. Replace the mock data with API calls in the `loadData()` function

Example operations API structure:

```typescript
// GET /api/bed-management/operations
{
  id: string;
  dateTime: Date;
  patientName: string;
  patientMrn?: string;
  procedureName: string;
  surgeon: string;
  department: string;
  operatingRoom?: string;
  estimatedDuration?: number;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requiresIcu?: boolean;
  requiresBed?: boolean;
  assignedWard?: string;
  assignedBed?: string;
}
```

## Customization

### Colors and Styling

Bed status colors are defined in the `getBedStatusColor()` function:

```typescript
const colors = {
  available: 'bg-green-100 border-green-300',
  occupied: 'bg-red-100 border-red-300',
  reserved: 'bg-yellow-100 border-yellow-300',
  cleaning: 'bg-blue-100 border-blue-300',
  maintenance: 'bg-orange-100 border-orange-300',
  out_of_service: 'bg-gray-100 border-gray-300',
};
```

### Layout Configuration

The page uses a 12-column grid:
- Left ward: 4 columns
- Center/Right ward: 4 columns
- Operations panel: 4 columns

Adjust the `col-span-*` classes to change the layout.

## Future Enhancements

### TODO Items

1. **Bed Details Modal**
   - Implement modal when clicking on a bed
   - Show full bed history, maintenance records, and features
   - Allow status changes from the modal

2. **Patient Details Drawer**
   - Implement drawer when clicking patient icon
   - Show full patient information, diagnosis, and care plan
   - Link to patient chart

3. **Operation Details Modal**
   - Full operation details and requirements
   - Bed assignment interface
   - Team assignment and notes

4. **Drag-and-Drop Bed Assignment**
   - Drag operations to available beds
   - Visual feedback during drag
   - Confirmation before assignment

5. **Real-time Updates**
   - WebSocket integration for live updates
   - Notification system for new admissions/discharges
   - Status change alerts

6. **Advanced Filtering**
   - Filter by bed type
   - Filter by bed features (oxygen, monitor, etc.)
   - Filter by occupancy status
   - Search functionality

7. **Time-based Views**
   - Historical view (past admissions/discharges)
   - Future projections (scheduled admissions)
   - Timeline visualization

8. **Export and Reporting**
   - Export current snapshot
   - Generate occupancy reports
   - Print-friendly view

## Dependencies

- `@radix-ui/react-scroll-area` - Scrollable area component
- `lucide-react` - Icon library
- `next-auth` - Authentication
- Existing UI components (Card, Button, Badge, Select, Tabs)

## Browser Compatibility

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance Considerations

- Bed data is loaded on mount and when filters change
- Time updates every 60 seconds (configurable)
- Tooltip rendering is optimized with conditional rendering
- Large datasets (>100 beds) may require pagination

## Support

For issues or questions:
1. Check the BED_MANAGEMENT_*.md documentation files
2. Review the API documentation
3. Contact the development team

## Version History

- v1.0.0 (2025-10-26) - Initial release
  - Room-based visualization
  - Operations panel
  - Interactive tooltips
  - Ward filtering
  - Time navigation
