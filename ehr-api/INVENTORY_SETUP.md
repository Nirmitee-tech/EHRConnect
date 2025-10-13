# Inventory Management Setup Guide

## Quick Start

### 1. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary inventory tables:
- `inventory_categories` - Product categories (Medications, Supplies, etc.)
- `inventory_suppliers` - Vendor/supplier information
- `inventory_items` - Inventory items/products
- `inventory_lots` - Lot/batch tracking with expiration
- `inventory_stock_movements` - Stock transaction history
- `inventory_item_locations` - Par levels per location

### 2. Seed Master Data

```bash
npm run seed:inventory
```

This creates default master data for all organizations:

**Locations Created:**
- Main Facility (MAIN01) - clinic
- Pharmacy (PHARM01) - pharmacy
- Diagnostic Center (DIAG01) - diagnostic_center

**Categories Created:**
- Medications
- Medical Supplies
- Surgical Instruments
- Laboratory Supplies
- Personal Protective Equipment (PPE)
- Diagnostic Equipment
- Wound Care
- IV Supplies

**Suppliers Created:**
- MedSupply Corp (MEDSUP001)
- PharmaDirect (PHARM001)
- LabEquip Solutions (LABEQUIP001)

## Query Master Data

### Get Locations for Your Organization

```sql
SELECT id, name, code, location_type
FROM locations
WHERE org_id = 'your-org-id' AND active = true;
```

### Get Categories

```sql
SELECT id, name, description
FROM inventory_categories
WHERE org_id = 'your-org-id' AND is_active = true;
```

### Get Suppliers

```sql
SELECT id, name, code, contact_name, contact_phone
FROM inventory_suppliers
WHERE org_id = 'your-org-id' AND is_active = true;
```

## Usage Examples

### Creating an Inventory Item

```json
POST /api/inventory/items

{
  "org_id": "your-org-id",
  "category_id": "category-uuid",
  "name": "Paracetamol 500mg",
  "sku": "MED001",
  "description": "Pain reliever and fever reducer",
  "unit_of_measure": "tablet",
  "track_lots": true,
  "track_expiration": true,
  "min_stock_level": 100,
  "reorder_point": 50,
  "cost_per_unit": 0.50,
  "is_active": true
}
```

### Creating an Inventory Lot

```json
POST /api/inventory/lots

{
  "org_id": "your-org-id",
  "item_id": "item-uuid",
  "supplier_id": "supplier-uuid",
  "location_id": "location-uuid",  // or null
  "lot_number": "LOT123456",
  "barcode": "1234567890123",
  "expiration_date": "2025-12-31",
  "manufacture_date": "2024-01-15",
  "quantity_on_hand": 500,
  "status": "available"
}
```

### Recording Stock Movement

```json
POST /api/inventory/stock-movements

{
  "org_id": "your-org-id",
  "item_id": "item-uuid",
  "lot_id": "lot-uuid",
  "destination_location_id": "location-uuid",
  "quantity": 100,
  "unit_cost": 0.50,
  "movement_type": "receipt",
  "direction": "in",
  "reason": "Purchase order #12345",
  "notes": "Received from MedSupply Corp"
}
```

## Movement Types

- `receipt` - Receiving stock (direction: in)
- `issue` - Dispensing/using stock (direction: out)
- `transfer` - Moving between locations
- `adjustment` - Inventory count adjustments
- `return` - Returning stock to supplier
- `wastage` - Expired or damaged goods

## Lot Status Values

- `available` - Ready for use
- `reserved` - Allocated but not consumed
- `expired` - Past expiration date
- `quarantined` - Under investigation
- `consumed` - Fully used
- `returned` - Returned to supplier

## Tips

1. **Always specify org_id**: All inventory operations are scoped to organizations
2. **Use lot tracking**: Enable `track_lots` for items requiring batch tracking
3. **Set reorder points**: Configure `min_stock_level` and `reorder_point` for automatic alerts
4. **Location is optional**: You can create lots without a location if centrally managed
5. **Barcode scanning**: Store barcodes in the `barcode` field for quick lookup

## Re-running the Seeder

The seeder is idempotent - it will skip existing records. You can safely run:

```bash
npm run seed:inventory
```

This will only create missing locations, categories, and suppliers for any new organizations.

## Troubleshooting

### Foreign Key Violations

If you get foreign key constraint errors:

1. Ensure the organization exists
2. Run `npm run seed:inventory` to create master data
3. Verify IDs in your request match existing records

### Check What's Available

```bash
# Check locations
psql -d medplum -c "SELECT id, org_id, name, code FROM locations LIMIT 10;"

# Check categories
psql -d medplum -c "SELECT id, org_id, name FROM inventory_categories LIMIT 10;"

# Check suppliers
psql -d medplum -c "SELECT id, org_id, name, code FROM inventory_suppliers LIMIT 10;"
```
