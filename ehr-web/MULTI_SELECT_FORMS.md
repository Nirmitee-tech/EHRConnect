# Multi-Select Forms Dropdown

## Overview
Replaced the simple text input with a beautiful, interactive multi-select dropdown that allows selecting multiple forms using checkboxes.

---

## Features

### 🎯 Core Functionality

1. **Checkbox Selection**
   - Each form has a checkbox
   - Click anywhere on the row to toggle selection
   - Multiple forms can be selected

2. **Search Capability**
   - Search box at the top of dropdown
   - Real-time filtering as you type
   - Case-insensitive search

3. **Visual Tags**
   - Selected forms shown as blue tags/pills
   - Each tag has an X button to remove
   - Tags wrap to multiple lines if needed

4. **Smart Dropdown**
   - Opens on click
   - Closes when clicking outside
   - Smooth animations
   - Hover effects

5. **Footer Actions**
   - Shows count of selected forms
   - "Clear All" button to deselect everything
   - Only visible when forms are selected

---

## UI Design

### Closed State
```
┌────────────────────────────────────────┐
│ [Medical History] [Consent Form] [×]   │▼
│ Search & Select Forms                  │
└────────────────────────────────────────┘
```

### Open State
```
┌────────────────────────────────────────┐
│ [Medical History] [Consent Form] [×]   │▲
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ Search forms...                         │
├────────────────────────────────────────┤
│ ☑ Medical History Form                 │ ← Selected (blue bg)
│ ☑ Consent Form                         │ ← Selected
│ ☐ Insurance Information                │
│ ☐ Patient Registration                 │
│ ☐ HIPAA Authorization                  │
│ ☐ Financial Agreement                  │
│ ☐ Pre-Appointment Questionnaire        │
│ ☐ Emergency Contact Form               │
├────────────────────────────────────────┤
│ 2 forms selected          Clear All    │
└────────────────────────────────────────┘
```

---

## Default Forms Available

1. Medical History Form
2. Consent Form
3. Insurance Information
4. Patient Registration
5. HIPAA Authorization
6. Financial Agreement
7. Pre-Appointment Questionnaire
8. Emergency Contact Form

---

## Component Details

### File
`src/components/appointments/appointment-form-components/MultiSelectFormDropdown.tsx`

### Props
```typescript
interface MultiSelectFormDropdownProps {
  selectedForms: string[];           // Array of selected form IDs
  onSelectionChange: (selectedIds: string[]) => void;
  availableForms?: Form[];          // Optional custom form list
}

interface Form {
  id: string;
  name: string;
}
```

### Usage in AppointmentFormFields
```typescript
<MultiSelectFormDropdown
  selectedForms={formData.selectedForms || []}
  onSelectionChange={(selectedIds) =>
    onFormDataChange('selectedForms', selectedIds)
  }
/>
```

---

## Visual Features

### 1. Input Field
- **Min height**: 36px (expands with selected forms)
- **Selected tags**: Blue background with border
- **Tag close button**: X icon with hover effect
- **Placeholder**: "Search & Select Forms" (when empty)
- **Chevron icon**: Rotates when dropdown opens

### 2. Dropdown Menu
- **Position**: Absolute, below input
- **Width**: Matches input width
- **Max height**: 256px (16rem)
- **Shadow**: shadow-lg for depth
- **Border**: Subtle gray border
- **Z-index**: 50 (appears above other elements)

### 3. Search Input
- **Position**: Top of dropdown
- **Border bottom**: Separates from list
- **Focus ring**: Blue ring on focus
- **Placeholder**: "Search forms..."

### 4. Form List
- **Scrollable**: max-h-48 (192px)
- **Hover effect**: Gray background on hover
- **Selected styling**: Blue background (bg-blue-50)
- **Checkbox**: Blue when checked
- **Font weight**: Medium for selected items

### 5. Footer
- **Background**: Light gray (bg-gray-50)
- **Border top**: Separates from list
- **Left side**: Count text
- **Right side**: Clear All button (red text)

---

## Interactions

### Opening/Closing
- **Click input** → Opens dropdown
- **Click outside** → Closes dropdown (100ms delay to prevent immediate close)
- **Chevron rotates** → 180° when open

### Selecting Forms
- **Click checkbox** → Toggles selection
- **Click row** → Toggles selection (entire row is clickable)
- **Selected forms** → Show as blue tags in input

### Removing Forms
- **Click X on tag** → Removes that form
- **Click "Clear All"** → Removes all forms

### Searching
- **Type in search** → Filters list in real-time
- **No results** → Shows "No forms found" message

---

## Styling Details

### Colors
- **Selected tag**: bg-blue-50, text-blue-700, border-blue-200
- **Selected row**: bg-blue-50, text-blue-900
- **Hover row**: bg-gray-50
- **Checkbox**: text-blue-600
- **Clear button**: text-red-600

### Spacing
- **Input padding**: px-3 py-1.5
- **Tag spacing**: gap-1.5
- **Row padding**: px-3 py-2.5
- **Search padding**: p-2
- **Footer padding**: p-2

### Border Radius
- **Input**: rounded-md (6px)
- **Dropdown**: rounded-lg (8px)
- **Tags**: rounded (4px)

### Typography
- **Tag text**: text-xs font-medium
- **Form names**: text-sm
- **Placeholder**: text-sm text-gray-400
- **Footer count**: text-xs text-gray-600

---

## State Management

### Data Structure
```typescript
formData.selectedForms = ['1', '3', '5']  // Array of form IDs
```

### State Updates
```typescript
// Add form
onSelectionChange([...selectedForms, newFormId])

// Remove form
onSelectionChange(selectedForms.filter(id => id !== formId))

// Clear all
onSelectionChange([])
```

---

## Accessibility

- ✅ Keyboard navigation support (native checkbox behavior)
- ✅ Click-outside to close
- ✅ Visual focus indicators
- ✅ Proper labels and ARIA attributes
- ✅ Screen reader friendly checkboxes

---

## Responsive Design

- ✅ Dropdown matches input width
- ✅ Tags wrap to multiple lines
- ✅ Scrollable form list
- ✅ Works on mobile and desktop
- ✅ Touch-friendly click targets

---

## Future Enhancements

### Planned Features
- [ ] Keyboard navigation (Arrow keys, Enter, Escape)
- [ ] Select All / Deselect All in footer
- [ ] Form categories/grouping
- [ ] Form descriptions on hover
- [ ] Recently used forms section
- [ ] Custom form creation from dropdown
- [ ] Drag to reorder selected forms
- [ ] Export/import form selections
- [ ] Form templates
- [ ] Conditional form logic

### Backend Integration
- [ ] Fetch forms from API
- [ ] Save selected forms with appointment
- [ ] Track form completion status
- [ ] Send forms via email/SMS
- [ ] Form preview functionality
- [ ] Digital signature support

---

## Code Example

### Basic Usage
```typescript
import { MultiSelectFormDropdown } from './MultiSelectFormDropdown';

<MultiSelectFormDropdown
  selectedForms={['1', '2']}
  onSelectionChange={(ids) => console.log(ids)}
/>
```

### Custom Forms
```typescript
const customForms = [
  { id: 'a', name: 'Custom Form 1' },
  { id: 'b', name: 'Custom Form 2' },
];

<MultiSelectFormDropdown
  selectedForms={selectedIds}
  onSelectionChange={handleChange}
  availableForms={customForms}
/>
```

---

## Summary

✅ **Beautiful multi-select dropdown** with checkboxes
✅ **Search functionality** for quick filtering
✅ **Visual tag display** for selected forms
✅ **Individual tag removal** with X button
✅ **Clear All** functionality
✅ **Selected count** display
✅ **Click-outside** to close
✅ **Smooth animations** and transitions
✅ **Professional styling** matching the design system
✅ **Fully functional** and ready to use

The Send Form field is now a powerful, user-friendly multi-select component that makes selecting multiple forms quick and intuitive!
