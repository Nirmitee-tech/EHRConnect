# Inventory Masters API Documentation

Base URL: `http://localhost:8000/api/inventory/masters`

## 🏥 Locations API

### Get All Locations
```http
GET /api/inventory/masters/locations?org_id={org_id}&active={true|false}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "org_id": "uuid",
    "name": "Main Facility",
    "code": "MAIN01",
    "location_type": "clinic",
    "address": {
      "line": ["123 Healthcare Blvd"],
      "city": "Medical City",
      "state": "CA",
      "postalCode": "90210",
      "country": "US"
    },
    "timezone": "America/Los_Angeles",
    "contact_email": "main@healthcare.com",
    "contact_phone": "+1-555-123-4567",
    "contact_person": "John Doe",
    "operational_hours": {},
    "active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Location by ID
```http
GET /api/inventory/masters/locations/:id
```

### Create Location
```http
POST /api/inventory/masters/locations
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "name": "Main Facility",
  "code": "MAIN01",
  "location_type": "clinic",
  "address": {
    "line": ["123 Healthcare Blvd"],
    "city": "Medical City",
    "state": "CA",
    "postalCode": "90210",
    "country": "US"
  },
  "timezone": "America/Los_Angeles",
  "contact_email": "main@healthcare.com",
  "contact_phone": "+1-555-123-4567",
  "contact_person": "John Doe",
  "operational_hours": {
    "monday": { "open": "09:00", "close": "17:00" }
  }
}
```

**Location Types:**
- `hospital`
- `clinic`
- `diagnostic_center`
- `pharmacy`
- `branch`

### Update Location
```http
PUT /api/inventory/masters/locations/:id
```

**Request Body:** (Same as create, all fields optional)

### Delete Location
```http
DELETE /api/inventory/masters/locations/:id
```

---

## 📦 Categories API

### Get All Categories
```http
GET /api/inventory/masters/categories?org_id={org_id}&is_active={true|false}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "org_id": "uuid",
    "name": "Medications",
    "description": "Pharmaceutical drugs and medications",
    "is_active": true,
    "metadata": {},
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Category by ID
```http
GET /api/inventory/masters/categories/:id
```

### Create Category
```http
POST /api/inventory/masters/categories
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "name": "Medications",
  "description": "Pharmaceutical drugs and medications",
  "metadata": {}
}
```

### Update Category
```http
PUT /api/inventory/masters/categories/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

### Delete Category
```http
DELETE /api/inventory/masters/categories/:id
```

---

## 🚚 Suppliers API

### Get All Suppliers
```http
GET /api/inventory/masters/suppliers?org_id={org_id}&is_active={true|false}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "org_id": "uuid",
    "name": "MedSupply Corp",
    "code": "MEDSUP001",
    "contact_name": "John Smith",
    "contact_phone": "+1-555-234-5678",
    "contact_email": "orders@medsupply.com",
    "address": {
      "line": ["456 Supply Ave"],
      "city": "Supply City",
      "state": "CA",
      "postalCode": "90211",
      "country": "US"
    },
    "notes": "Primary medical supplies vendor",
    "is_active": true,
    "metadata": {},
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Supplier by ID
```http
GET /api/inventory/masters/suppliers/:id
```

### Create Supplier
```http
POST /api/inventory/masters/suppliers
```

**Request Body:**
```json
{
  "org_id": "uuid",
  "name": "MedSupply Corp",
  "code": "MEDSUP001",
  "contact_name": "John Smith",
  "contact_phone": "+1-555-234-5678",
  "contact_email": "orders@medsupply.com",
  "address": {
    "line": ["456 Supply Ave"],
    "city": "Supply City",
    "state": "CA",
    "postalCode": "90211",
    "country": "US"
  },
  "notes": "Primary medical supplies vendor"
}
```

### Update Supplier
```http
PUT /api/inventory/masters/suppliers/:id
```

**Request Body:** (Same as create, all fields optional)

### Delete Supplier
```http
DELETE /api/inventory/masters/suppliers/:id
```

---

## 🎯 Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch locations for dropdown
async function getLocations(orgId: string) {
  const response = await fetch(
    `http://localhost:8000/api/inventory/masters/locations?org_id=${orgId}&active=true`
  );
  return response.json();
}

// Fetch categories for dropdown
async function getCategories(orgId: string) {
  const response = await fetch(
    `http://localhost:8000/api/inventory/masters/categories?org_id=${orgId}&is_active=true`
  );
  return response.json();
}

// Fetch suppliers for dropdown
async function getSuppliers(orgId: string) {
  const response = await fetch(
    `http://localhost:8000/api/inventory/masters/suppliers?org_id=${orgId}&is_active=true`
  );
  return response.json();
}

// Create a new location
async function createLocation(data) {
  const response = await fetch(
    'http://localhost:8000/api/inventory/masters/locations',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );
  return response.json();
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useInventoryMasters(orgId: string) {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMasters() {
      setLoading(true);
      try {
        const [locationsRes, categoriesRes, suppliersRes] = await Promise.all([
          fetch(`/api/inventory/masters/locations?org_id=${orgId}&active=true`),
          fetch(`/api/inventory/masters/categories?org_id=${orgId}&is_active=true`),
          fetch(`/api/inventory/masters/suppliers?org_id=${orgId}&is_active=true`)
        ]);

        setLocations(await locationsRes.json());
        setCategories(await categoriesRes.json());
        setSuppliers(await suppliersRes.json());
      } catch (error) {
        console.error('Error fetching masters:', error);
      } finally {
        setLoading(false);
      }
    }

    if (orgId) {
      fetchMasters();
    }
  }, [orgId]);

  return { locations, categories, suppliers, loading };
}
```

---

## 📋 Quick Reference

### Base Endpoints

| Resource | GET All | GET One | POST | PUT | DELETE |
|----------|---------|---------|------|-----|--------|
| Locations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| Suppliers | ✅ | ✅ | ✅ | ✅ | ✅ |

### Query Parameters

| Endpoint | Parameter | Type | Description |
|----------|-----------|------|-------------|
| Locations | `org_id` | UUID | Filter by organization |
| Locations | `active` | Boolean | Filter by active status |
| Categories | `org_id` | UUID | Filter by organization |
| Categories | `is_active` | Boolean | Filter by active status |
| Suppliers | `org_id` | UUID | Filter by organization |
| Suppliers | `is_active` | Boolean | Filter by active status |

---

## 🔐 Authentication

Add authentication headers as needed for your implementation:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN_HERE'
}
```

---

## 🚀 Testing

### Using cURL

```bash
# Get all locations
curl http://localhost:8000/api/inventory/masters/locations?org_id=YOUR_ORG_ID

# Create a location
curl -X POST http://localhost:8000/api/inventory/masters/locations \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "YOUR_ORG_ID",
    "name": "Test Facility",
    "code": "TEST01",
    "location_type": "clinic",
    "address": {"line": ["123 Test St"], "city": "Test City", "state": "CA", "postalCode": "12345", "country": "US"},
    "timezone": "America/Los_Angeles"
  }'
```

---

## 💡 Tips

1. **Always filter by org_id** to ensure data isolation
2. **Use active/is_active filters** to show only active records in dropdowns
3. **Cache master data** on the frontend to reduce API calls
4. **Validate uniqueness** of codes at the application level
5. **Handle errors gracefully** and show user-friendly messages
