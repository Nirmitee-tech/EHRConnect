# Medical Codes Library - User Guide

## Overview

The new Medical Codes Library is a comprehensive ICD-10, CPT, HCPCS, and LOINC code management system with a modern, intuitive UI. It provides advanced features for searching, filtering, organizing, and managing medical codes used throughout your EHR system.

## 🎯 Key Features

### 1. **Multi-Code Type Support**
- **ICD-10**: International Classification of Diseases (Diagnosis codes)
- **CPT**: Current Procedural Terminology (Procedure codes)
- **HCPCS**: Healthcare Common Procedure Coding System
- **LOINC**: Logical Observation Identifiers Names and Codes

### 2. **Advanced Search & Filtering**
- **Full-text search**: Search by code, description, or category
- **Type filtering**: Filter by specific code types (ICD-10, CPT, etc.)
- **Category filtering**: Filter by medical categories
- **Version filtering**: Filter by code version (2024, 2025)
- **Status filtering**: Show only active codes
- **Favorites filtering**: Show only your favorite codes
- **Sorting options**: Sort by usage, recent, code, or alphabetically

### 3. **Multiple View Modes**
- **Grid View**: Card-based layout with visual icons and badges
- **List View**: Detailed list with complete information
- **Compact View**: Table format for maximum information density

### 4. **Favorites System**
- Mark frequently used codes as favorites
- Quick access to your most-used codes
- Star/unstar codes with a single click

### 5. **Usage Tracking**
- View usage count for each code
- See when codes were last used
- Track trending codes

### 6. **Code Details**
- Full code information in expandable modal
- Category and subcategory
- Version and effective dates
- Billable status
- Prior authorization requirements
- Gender and age restrictions
- Usage statistics

### 7. **Import/Export**
- Bulk import codes from CSV/Excel files
- Export filtered codes in multiple formats
- Maintain code consistency across systems

## 🚀 Getting Started

### Accessing the Page

Navigate to: `/medical-codes`

### Quick Actions

1. **Search for a Code**
   - Use the search bar to find codes by number or description
   - Results update in real-time as you type

2. **Filter by Type**
   - Click on any of the stat cards at the top to filter by code type
   - Click "All Codes" to reset the filter

3. **Add to Favorites**
   - Click the star icon on any code card to add/remove from favorites
   - Click the "Favorites" button to see only your starred codes

4. **View Code Details**
   - Click on any code card to open the detailed view
   - See complete information, usage stats, and quick actions

5. **Change View Mode**
   - Use the view toggle buttons (Grid/List/Compact) in the search bar
   - Choose the view that works best for your workflow

## 📊 Statistics Dashboard

The top of the page shows real-time statistics:

- **Total Codes**: All codes in the system
- **ICD-10 Count**: Number of diagnosis codes
- **CPT Count**: Number of procedure codes
- **HCPCS Count**: Number of healthcare procedure codes
- **LOINC Count**: Number of observation codes
- **Favorites**: Your saved favorite codes
- **Recent**: Codes used in the last 7 days

## 🔍 Advanced Filtering

Click the "Filters" button to access advanced filtering options:

1. **Category Filter**: Select specific medical categories
2. **Version Filter**: Filter by code version year
3. **Sort Options**:
   - Most Used: Codes with highest usage count
   - Recently Used: Recently accessed codes
   - Code (A-Z): Alphabetical by code number
   - Description (A-Z): Alphabetical by description
4. **Active Only**: Toggle to show/hide inactive codes

## 💡 Code Information Badges

Each code displays helpful badges:

- **🟢 Billable**: Code can be billed to insurance
- **🟠 Auth Required**: Prior authorization required
- **🔵 Active**: Code is currently active
- **⭐ Favorite**: Marked as favorite

## 📱 Responsive Design

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 Visual Design Elements

### Color Coding by Type
- **Blue/Cyan**: ICD-10 codes
- **Emerald/Teal**: CPT codes
- **Purple/Pink**: HCPCS codes
- **Orange/Amber**: LOINC codes

### Interactive Elements
- Hover effects on cards
- Smooth transitions
- Gradient backgrounds
- Shadow effects for depth

## 🔧 API Integration

The page uses the following API endpoints (via `billing.service.ts`):

### Code Retrieval
```typescript
// Get all codes with filters
await billingService.getMedicalCodes({
  search: 'diabetes',
  codeType: 'icd10',
  category: 'Endocrine',
  version: '2024',
  isActive: true,
  sortBy: 'usage',
  limit: 100
});

// Get specific code by ID
await billingService.getMedicalCodeById('code-id-123');

// Lookup code by code number
await billingService.getMedicalCodeByCode('E11.9', 'icd10');

// Search codes
await billingService.searchMedicalCodes('hypertension', {
  codeType: 'icd10',
  limit: 50
});
```

### Code Management
```typescript
// Create new code
await billingService.createMedicalCode({
  code: 'E11.9',
  description: 'Type 2 diabetes mellitus without complications',
  codeType: 'icd10',
  category: 'Endocrine, Nutritional and Metabolic Diseases',
  version: '2024',
  effectiveDate: '2024-10-01',
  isActive: true,
  billable: true
});

// Update existing code
await billingService.updateMedicalCode('code-id', { isActive: false });

// Delete code
await billingService.deleteMedicalCode('code-id');

// Toggle favorite
await billingService.toggleFavoriteCode('code-id');
```

### Bulk Operations
```typescript
// Import codes from file
await billingService.bulkImportCodes(file, 'icd10');

// Export codes
await billingService.exportMedicalCodes({
  codeType: 'cpt',
  isActive: true,
  format: 'csv'
});
```

### Analytics
```typescript
// Get usage statistics
await billingService.getMedicalCodeUsageStats('code-id', '2024-01-01', '2024-12-31');

// Get recently used codes
await billingService.getRecentlyUsedCodes(10);

// Get favorite codes
await billingService.getFavoriteCodes('icd10');
```

### Validation & Crosswalks
```typescript
// Validate code
await billingService.validateCode('E11.9', 'icd10');

// Get code crosswalks (ICD-9 to ICD-10, etc.)
await billingService.getCrosswalks('250.00', 'icd9', 'icd10');
```

## 🗂️ Import File Format

When importing codes via CSV, use this format:

```csv
code,description,category,subcategory,version,effectiveDate,billable,requiresAuth
E11.9,"Type 2 diabetes mellitus without complications","Endocrine Diseases","Diabetes Mellitus",2024,2024-10-01,true,false
99213,"Office visit established patient 20-29 min","E&M","Office Visits",2024,2024-01-01,true,false
```

## 🔐 Security & Compliance

- All API calls include authentication tokens
- Organization-level data isolation
- FHIR R4 compliant code structures
- Audit trail for code modifications

## 📈 Future Enhancements

Planned features:
1. Code set versioning with change tracking
2. Automated code updates from official sources
3. Code mapping and crosswalk tools
4. Custom code sets per organization
5. Integration with encounters and claims
6. Smart code suggestions based on diagnosis
7. Code bundling and grouping
8. Compliance checking and validation

## 🆘 Troubleshooting

### Codes Not Loading
- Check network connection
- Verify API endpoint is accessible
- Check authentication token validity

### Search Not Working
- Clear browser cache
- Ensure JavaScript is enabled
- Check for browser console errors

### Import Failing
- Verify file format matches specification
- Check file size limits
- Ensure required fields are present

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review browser console for errors
3. Contact system administrator

## 🎓 Best Practices

1. **Use Favorites**: Mark commonly used codes for quick access
2. **Keep Codes Updated**: Regularly update code versions
3. **Validate Before Use**: Always validate codes before billing
4. **Monitor Usage**: Track which codes are most used
5. **Regular Exports**: Back up your code library regularly
6. **Category Organization**: Maintain proper categorization
7. **Version Management**: Keep track of code version changes

## 📝 Notes

- Sample data is included for demonstration
- Connect to backend API for production use
- Customize code types based on your needs
- Adjust UI colors and branding as needed

---

**Location**: `/medical-codes`
**Component**: `ehr-web/src/app/medical-codes/page.tsx`
**Service**: `ehr-web/src/services/billing.service.ts`
**Created**: 2024
