# Form Builder Enhancements

## Overview
The form builder has been enhanced with new layout and display components to create more professional and organized forms.

## New Features Added

### 1. Layout Components

#### **Columns Layout**
- Create multi-column form layouts (2, 3, or 4 columns)
- Configurable column count in the properties panel
- Responsive grid layout that adapts to the number of columns
- Add any form fields inside columns for side-by-side display

**How to use:**
1. Drag the "Columns" component from the "Layout" section
2. Select the columns container
3. In the properties panel, choose the number of columns (2, 3, or 4)
4. Drag form fields into the columns container
5. Fields will automatically arrange in the specified column layout

**Example use cases:**
- First Name and Last Name side-by-side
- Address fields (Street, City, State, ZIP) in 2 or 4 columns
- Multiple choice questions in columns for compact display

#### **Group**
- Organize related fields together
- Moved to the "Layout" section for better organization
- Display as nested sections with left border

#### **Separator**
- Visual horizontal line to separate form sections
- Helps break up long forms into logical sections
- No user input required

**How to use:**
1. Drag the "Separator" component from the "Layout" section
2. Position it between form sections
3. Renders as a horizontal line

### 2. Display Components

#### **Heading**
- Large, bold section titles
- Use to create clear sections in your form
- Renders as h2/h3 heading in preview mode

**How to use:**
1. Drag the "Heading" component from the "Display" section
2. Edit the text inline in the canvas
3. Use for major section titles

#### **Description**
- Multi-line descriptive text
- Provide instructions or context for form sections
- Renders as paragraph text with subtle styling

**How to use:**
1. Drag the "Description" component from the "Display" section
2. Edit the text inline in the canvas
3. Use for explanatory text, instructions, or context

#### **Info Text (Display)**
- Single-line informational text
- Use for short notes or hints
- Renders as muted text

### 3. Component Organization

The component palette has been reorganized for better usability:

- **Layout** - Columns, Group, Separator
- **Display** - Heading, Description, Info Text
- **Basic** - Text, Long Text, Number, Decimal, Yes/No
- **Date & Time** - Date, Time, DateTime
- **Selection** - Choice, Open Choice
- **Advanced** - Slider, Signature, File, Quantity, Reference
- **Formatted** - Phone, Email, URL
- **Composites** - Address, Name, Blood Pressure

## Technical Implementation

### Type System Updates

New questionnaire item types added to `types/forms.ts`:
```typescript
export type QuestionnaireItemType =
  | ... // existing types
  | 'heading'
  | 'separator'
  | 'description'
  | 'columns';
```

### FHIR Extensions

The new components use FHIR extensions for metadata:

**Columns Layout:**
```javascript
extension: [
  {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCode: 'columns'
  },
  {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns',
    valueInteger: 2 // or 3, 4
  }
]
```

**Display Categories:**
```javascript
extension: [{
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
  valueCode: 'heading' // or 'separator', 'description'
}]
```

### Rendering Support

All new components are supported in:
- ✅ Form Builder Canvas (edit mode)
- ✅ Form Builder Preview
- ✅ Compact Form Renderer (patient-facing forms)
- ✅ Tree View with color-coded badges
- ✅ Properties Panel with column configuration

### Visual Indicators

Tree view badges:
- **COL** (blue) - Columns layout
- **H** (purple) - Heading
- **---** (gray) - Separator
- **TXT** (green) - Description
- **DIS** (default) - Info text

## Example Form Structure

```
┌─────────────────────────────────────────────┐
│ Patient Information                         │ ← Heading
│ Please provide your personal details below  │ ← Description
├─────────────────────────────────────────────┤
│                                             │ ← Separator
│ [2 Columns Layout]                          │
│   ┌──────────────┬──────────────┐           │
│   │ First Name   │ Last Name    │           │
│   ├──────────────┼──────────────┤           │
│   │ Email        │ Phone        │           │
│   └──────────────┴──────────────┘           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │ ← Separator
│ Medical History                             │ ← Heading
│ ...                                         │
└─────────────────────────────────────────────┘
```

## Benefits

1. **Better Organization** - Separate forms into logical sections with headings and separators
2. **Space Efficiency** - Use columns to display related fields side-by-side
3. **Improved UX** - Provide context and instructions with descriptions
4. **Professional Appearance** - Create polished, well-structured forms
5. **Flexibility** - Mix and match components to create custom layouts

## Backward Compatibility

All existing forms continue to work without changes. The new components are additive and don't affect existing questionnaire structures.

## Future Enhancements

Potential future additions:
- Tabs for multi-page forms
- Accordion sections for collapsible content
- Card/panel layouts
- Conditional visibility based on other fields
- Custom column widths
- Responsive breakpoints
