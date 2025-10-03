# Tab System Usage Guide

## Overview

The EHR Connect application now includes a Chrome-like tabbed interface for logged-in users. This allows users to:
- Open multiple pages in tabs without losing their place
- Switch between tabs quickly
- Close tabs when done
- Tabs persist across page refreshes (using sessionStorage)
- Sidebar remains visible at all times

## Features

✅ **Chrome-like tab interface** - Visual tabs at the top of the content area
✅ **Tab persistence** - Tabs are saved in sessionStorage and restored on refresh
✅ **Drag and drop** - Reorder tabs by dragging (visual feedback)
✅ **Context menu** - Right-click on tabs for options (Close, Close Others, Close All)
✅ **Max tab limit** - Maximum 15 tabs (automatically closes oldest closeable tab)
✅ **Keyboard navigation** - Click tabs to switch between them
✅ **Sidebar integration** - Clicking sidebar items opens/activates tabs
✅ **Active tab sync** - The active tab stays in sync with the current route

## Usage

### Automatic Tab Creation (Recommended)

Wrap your page content with `TabPageWrapper` to automatically register it as a tab:

```tsx
import { TabPageWrapper } from '@/components/layout/tab-page-wrapper';
import { Users } from 'lucide-react';

export default function PatientsPage() {
  return (
    <TabPageWrapper title="Patients" icon={<Users className="h-4 w-4" />}>
      <div>
        {/* Your page content */}
      </div>
    </TabPageWrapper>
  );
}
```

### Programmatic Tab Creation

Use the `useTabNavigation` hook to open tabs programmatically:

```tsx
import { useTabNavigation } from '@/hooks/use-tab-navigation';

function MyComponent() {
  const { openTab, openPatientTab } = useTabNavigation();

  const handleOpenCustomTab = () => {
    openTab({
      title: 'Custom Page',
      path: '/custom-path',
      icon: <SomeIcon />,
      closeable: true, // optional, defaults to true
    });
  };

  const handleOpenPatient = () => {
    openPatientTab('patient-123', 'John Doe');
  };

  return (
    <div>
      <button onClick={handleOpenCustomTab}>Open Custom Tab</button>
      <button onClick={handleOpenPatient}>Open Patient</button>
    </div>
  );
}
```

### Available Helper Methods

The `useTabNavigation` hook provides these helpers:

- `openTab(options)` - Open any custom tab
- `openPatientTab(patientId, patientName)` - Open patient detail page
- `openPatientEditTab(patientId, patientName)` - Open patient edit page
- `openNewPatientTab()` - Open new patient form
- `openDashboardTab()` - Open dashboard
- `openPatientsListTab()` - Open patients list
- `openStaffTab()` - Open staff page
- `openAdminTab()` - Open admin page
- `openFacilitiesTab()` - Open facilities page
- `openUsersTab()` - Open users page

### Direct Context Access

For advanced usage, you can use the `useTabs` hook directly:

```tsx
import { useTabs } from '@/contexts/tab-context';

function AdvancedComponent() {
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    updateTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    reorderTabs,
  } = useTabs();

  return (
    <div>
      <p>Open tabs: {tabs.length}</p>
      <button onClick={() => addTab({ title: 'New Tab', path: '/new' })}>
        Add Tab
      </button>
    </div>
  );
}
```

## Tab Options

When creating a tab, you can specify these options:

```typescript
interface Tab {
  id?: string;           // Auto-generated if not provided
  title: string;         // Tab title (required)
  path: string;          // Route path (required)
  icon?: React.ReactNode; // Optional icon
  closeable?: boolean;   // Whether tab can be closed (default: true)
}
```

## Behavior

### Tab Deduplication
If you try to open a tab with a path that's already open, the existing tab will be activated instead of creating a duplicate.

### Tab Limit
Maximum 15 tabs can be open. When the limit is reached and a new tab is opened, the oldest closeable tab will be automatically closed.

### Persistence
Tabs are saved to `sessionStorage` and will persist:
- ✅ Across page refreshes
- ✅ Across navigation
- ❌ NOT across browser sessions (tabs are cleared when browser is closed)

### Sidebar Integration
The sidebar navigation items automatically open tabs when clicked. The active tab is synchronized with the sidebar's active state.

## Styling

The tab bar uses Tailwind CSS classes and matches the application's design system. Active tabs are highlighted with a white background, while inactive tabs have a gray background.

## Example: Patient List with Tab Navigation

```tsx
'use client';

import { TabPageWrapper } from '@/components/layout/tab-page-wrapper';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { Users } from 'lucide-react';

export default function PatientsPage() {
  const { openPatientTab } = useTabNavigation();

  const patients = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ];

  return (
    <TabPageWrapper title="Patients" icon={<Users className="h-4 w-4" />}>
      <div>
        <h1>Patients</h1>
        <ul>
          {patients.map(patient => (
            <li key={patient.id}>
              <button onClick={() => openPatientTab(patient.id, patient.name)}>
                {patient.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </TabPageWrapper>
  );
}
```

## Notes

- Tab system is only active for authenticated users
- Tabs are scoped to the browser tab (not shared across multiple browser tabs/windows)
- The tab bar appears between the header and the main content area
- Sidebar remains visible and fixed on the left side
