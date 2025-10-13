# ✅ Inventory Masters - Complete Implementation Guide

## 🎯 Overview

Complete inventory management system with automated master data seeding and full CRUD APIs.

---

## 🗂️ Database Structure

### Tables Created
- ✅ `locations` - Facilities (clinic, pharmacy, diagnostic center, etc.)
- ✅ `inventory_categories` - Product categories (medications, supplies, etc.)
- ✅ `inventory_suppliers` - Vendor/supplier information
- ✅ `inventory_items` - Inventory items/products
- ✅ `inventory_lots` - Lot/batch tracking with expiration dates
- ✅ `inventory_stock_movements` - Stock transaction history
- ✅ `inventory_item_locations` - Par levels per location

---

## 🚀 Quick Start

### 1. Run Migrations

```bash
cd ehr-api
npm run migrate
```

### 2. Seed Master Data

```bash
npm run seed:inventory
```

This automatically creates for **each organization**:

**Locations (3):**
- Main Facility (MAIN01)
- Pharmacy (PHARM01)
- Diagnostic Center (DIAG01)

**Categories (8):**
- Medications
- Medical Supplies
- Surgical Instruments
- Laboratory Supplies
- Personal Protective Equipment
- Diagnostic Equipment
- Wound Care
- IV Supplies

**Suppliers (3):**
- MedSupply Corp (MEDSUP001)
- PharmaDirect (PHARM001)
- LabEquip Solutions (LABEQUIP001)

---

## 📡 API Endpoints

**Base URL:** `http://localhost:8000/api/inventory/masters`

### Locations
```
GET    /locations?org_id={uuid}&active={true|false}
GET    /locations/:id
POST   /locations
PUT    /locations/:id
DELETE /locations/:id
```

### Categories
```
GET    /categories?org_id={uuid}&is_active={true|false}
GET    /categories/:id
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

### Suppliers
```
GET    /suppliers?org_id={uuid}&is_active={true|false}
GET    /suppliers/:id
POST   /suppliers
PUT    /suppliers/:id
DELETE /suppliers/:id
```

**Important:** All requests require `x-org-id` header

---

## 💻 Frontend Integration

### React Hook for Dropdowns

```typescript
// hooks/useInventoryMasters.ts
import { useState, useEffect } from 'react';

interface Master {
  id: string;
  name: string;
  [key: string]: any;
}

export function useInventoryMasters(orgId: string) {
  const [locations, setLocations] = useState<Master[]>([]);
  const [categories, setCategories] = useState<Master[]>([]);
  const [suppliers, setSuppliers] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMasters() {
      if (!orgId) return;

      setLoading(true);
      setError(null);

      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-org-id': orgId
        };

        const [locationsRes, categoriesRes, suppliersRes] = await Promise.all([
          fetch(`/api/inventory/masters/locations?org_id=${orgId}&active=true`, { headers }),
          fetch(`/api/inventory/masters/categories?org_id=${orgId}&is_active=true`, { headers }),
          fetch(`/api/inventory/masters/suppliers?org_id=${orgId}&is_active=true`, { headers })
        ]);

        if (!locationsRes.ok || !categoriesRes.ok || !suppliersRes.ok) {
          throw new Error('Failed to fetch masters');
        }

        const [locationsData, categoriesData, suppliersData] = await Promise.all([
          locationsRes.json(),
          categoriesRes.json(),
          suppliersRes.json()
        ]);

        setLocations(locationsData);
        setCategories(categoriesData);
        setSuppliers(suppliersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching inventory masters:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMasters();
  }, [orgId]);

  return { locations, categories, suppliers, loading, error };
}
```

### Dropdown Component Example

```tsx
// components/inventory/InventoryForm.tsx
import { useInventoryMasters } from '@/hooks/useInventoryMasters';

export function InventoryForm({ orgId }: { orgId: string }) {
  const { locations, categories, suppliers, loading } = useInventoryMasters(orgId);

  if (loading) return <div>Loading...</div>;

  return (
    <form>
      {/* Location Dropdown */}
      <div>
        <label>Location</label>
        <select name="location_id">
          <option value="">Select Location</option>
          {locations.map(loc => (
            <key={loc.id} value={loc.id}>
              {loc.name} ({loc.code})
            </option>
          ))}
        </select>
      </div>

      {/* Category Dropdown */}
      <div>
        <label>Category</label>
        <select name="category_id">
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier Dropdown */}
      <div>
        <label>Supplier</label>
        <select name="supplier_id">
          <option value="">Select Supplier</option>
          {suppliers.map(sup => (
            <option key={sup.id} value={sup.id}>
              {sup.name} ({sup.code})
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
```

### With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { useInventoryMasters } from '@/hooks/useInventoryMasters';

export function InventoryLotForm({ orgId }: { orgId: string }) {
  const { locations, categories, suppliers } = useInventoryMasters(orgId);
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="location_id"
        control={control}
        render={({ field }) => (
          <select {...field}>
            <option value="">Select Location</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}
      />

      <Controller
        name="category_id"
        control={control}
        render={({ field }) => (
          <select {...field}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 🎨 UI/UX Recommendations

### Master Management Pages

Create separate admin pages for managing masters:

```
/admin/inventory/locations     - Manage locations
/admin/inventory/categories    - Manage categories
/admin/inventory/suppliers     - Manage suppliers
```

### Quick Add Functionality

Add "+" buttons next to dropdowns to quickly create new masters:

```tsx
<div className="flex gap-2">
  <select name="location_id" className="flex-1">
    {/* options */}
  </select>
  <button
    type="button"
    onClick={() => setShowLocationModal(true)}
    className="px-3 py-2 bg-blue-600 text-white"
  >
    + Add
  </button>
</div>
```

---

## 📊 Testing

### Test with cURL

```bash
# Get locations
curl -H "x-org-id: YOUR_ORG_ID" \
  "http://localhost:8000/api/inventory/masters/locations?org_id=YOUR_ORG_ID&active=true"

# Create a new category
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-org-id: YOUR_ORG_ID" \
  -d '{
    "org_id": "YOUR_ORG_ID",
    "name": "Emergency Supplies",
    "description": "Emergency and trauma supplies"
  }' \
  http://localhost:8000/api/inventory/masters/categories
```

---

## 🔧 Customization

### Add Your Own Default Masters

Edit: `src/database/seeders/seed-inventory-masters.js`

```javascript
// Add more locations
const locations = [
  // ... existing locations
  {
    name: 'Your Custom Location',
    code: 'CUSTOM01',
    location_type: 'clinic',
    // ...
  }
];

// Add more categories
const categories = [
  // ... existing categories
  {
    name: 'Your Custom Category',
    description: 'Custom category description'
  }
];
```

Then rerun: `npm run seed:inventory`

---

## 📁 File Structure

```
ehr-api/
├── src/
│   ├── routes/
│   │   ├── inventory.js              # Main inventory routes
│   │   └── inventory-masters.js      # NEW: Master data CRUD routes
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 004_inventory_module.sql
│   │   └── seeders/
│   │       └── seed-inventory-masters.js  # NEW: Master data seeder
│   ├── migrations/
│   │   └── run-migrations.js         # NEW: Migration runner
│   └── index.js                      # Updated with new routes
├── INVENTORY_SETUP.md                # Setup guide
├── INVENTORY_API.md                  # API documentation
└── package.json                      # Updated with new scripts
```

---

## ✨ Features

- ✅ **Automated Seeding** - One command creates all masters
- ✅ **Multi-tenant** - Separate data per organization
- ✅ **Full CRUD APIs** - Complete management capabilities
- ✅ **Idempotent** - Safe to run seeders multiple times
- ✅ **Dropdown Ready** - Perfect for UI dropdowns
- ✅ **Extensible** - Easy to add custom masters

---

## 🎯 Next Steps

1. **Frontend Implementation**
   - Create master management pages in `/admin/inventory/`
   - Add dropdown components with "+" quick add buttons
   - Implement search/filter in dropdowns for large lists

2. **Validation**
   - Add unique code validation on frontend
   - Show friendly error messages
   - Implement inline editing for quick updates

3. **Enhanced Features**
   - Bulk import from CSV
   - Export functionality
   - Audit logging for changes
   - Archive instead of delete

4. **User Experience**
   - Auto-populate based on previous selections
   - Recently used items at top of dropdown
   - Search functionality in dropdowns
   - Keyboard shortcuts for quick entry

---

## 📚 Documentation Links

- **Setup Guide:** `ehr-api/INVENTORY_SETUP.md`
- **API Docs:** `ehr-api/INVENTORY_API.md`
- **Migration Files:** `ehr-api/src/database/migrations/`
- **Seeder:** `ehr-api/src/database/seeders/seed-inventory-masters.js`

---

## 🐛 Troubleshooting

### Issue: "Organization context (x-org-id) is required"
**Solution:** Add `x-org-id` header to all requests

### Issue: Foreign key constraint violation
**Solution:** Run `npm run seed:inventory` to create master data

### Issue: Duplicate key error
**Solution:** The record already exists. Check existing data or use PUT to update

### Issue: No data returned
**Solution:** Verify `org_id` parameter matches your organization

---

**Status:** ✅ Complete and Ready for Production

All APIs tested and working. Ready for frontend integration!
