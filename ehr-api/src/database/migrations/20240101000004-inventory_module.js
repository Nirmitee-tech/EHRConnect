const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Inventory Management Module
-- Provides detailed stock, lot, and supplier tracking for clinical operations

-- Enable UUID extension in case it is not enabled yet
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- CATEGORIES
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_categories_org_name_unique ON inventory_categories(org_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_categories_org ON inventory_categories(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(org_id, is_active);

-- =====================================================================
-- SUPPLIERS / VENDORS
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address JSONB,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_suppliers_org_name_unique ON inventory_suppliers(org_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_org ON inventory_suppliers(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_suppliers_active ON inventory_suppliers(org_id, is_active);

-- =====================================================================
-- ITEMS
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  default_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'each',
  track_lots BOOLEAN NOT NULL DEFAULT TRUE,
  track_expiration BOOLEAN NOT NULL DEFAULT TRUE,
  allow_partial_quantity BOOLEAN NOT NULL DEFAULT FALSE,
  min_stock_level NUMERIC(12,2) DEFAULT 0,
  max_stock_level NUMERIC(12,2),
  reorder_point NUMERIC(12,2),
  reorder_quantity NUMERIC(12,2),
  cost_per_unit NUMERIC(12,2),
  is_controlled_substance BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, sku)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_items_org_name_unique ON inventory_items(org_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inventory_items_org ON inventory_items(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(org_id, category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(org_id, sku);

-- =====================================================================
-- ITEM LOCATION PAR LEVELS
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory_item_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  par_level NUMERIC(12,2),
  reorder_point NUMERIC(12,2),
  reorder_quantity NUMERIC(12,2),
  max_level NUMERIC(12,2),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, item_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_item_locations_org ON inventory_item_locations(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_locations_item ON inventory_item_locations(org_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_locations_location ON inventory_item_locations(org_id, location_id);

-- =====================================================================
-- LOTS / BATCHES
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  lot_number TEXT NOT NULL,
  serial_number TEXT,
  barcode TEXT,
  expiration_date DATE,
  manufacture_date DATE,
  quantity_on_hand NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','expired','quarantined','consumed','returned')),
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, item_id, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_inventory_lots_org_item ON inventory_lots(org_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_location ON inventory_lots(org_id, location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_expiration ON inventory_lots(org_id, expiration_date);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_status ON inventory_lots(org_id, status);

-- =====================================================================
-- STOCK MOVEMENTS / TRANSACTIONS
-- =====================================================================
CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
  source_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  destination_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('receipt','issue','transfer','adjustment','return','wastage')),
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  reason TEXT,
  reference_type TEXT,
  reference_id TEXT,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_org ON inventory_stock_movements(org_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_stock_movements(org_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_lot ON inventory_stock_movements(org_id, lot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_stock_movements(org_id, movement_type);

-- =====================================================================
-- SNAPSHOT VIEW FOR ITEM STOCK SUMMARY
-- =====================================================================
CREATE OR REPLACE VIEW inventory_item_stock_summary AS
SELECT
  i.org_id,
  i.id AS item_id,
  i.name,
  i.sku,
  COALESCE(SUM(l.quantity_on_hand), 0) AS quantity_on_hand,
  COALESCE(SUM(l.quantity_reserved), 0) AS quantity_reserved,
  MIN(l.expiration_date) FILTER (WHERE l.expiration_date IS NOT NULL AND l.status = 'available') AS next_expiration_date
FROM inventory_items i
LEFT JOIN inventory_lots l ON l.item_id = i.id AND l.org_id = i.org_id AND l.status IN ('available','reserved')
GROUP BY i.org_id, i.id, i.name, i.sku;

-- Triggers to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_categories_updated ON inventory_categories;
CREATE TRIGGER trg_inventory_categories_updated
BEFORE UPDATE ON inventory_categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_suppliers_updated ON inventory_suppliers;
CREATE TRIGGER trg_inventory_suppliers_updated
BEFORE UPDATE ON inventory_suppliers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_items_updated ON inventory_items;
CREATE TRIGGER trg_inventory_items_updated
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_item_locations_updated ON inventory_item_locations;
CREATE TRIGGER trg_inventory_item_locations_updated
BEFORE UPDATE ON inventory_item_locations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_lots_updated ON inventory_lots;
CREATE TRIGGER trg_inventory_lots_updated
BEFORE UPDATE ON inventory_lots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 20240101000004-inventory_module...');
      await pool.query(sql);
      console.log('✅ 20240101000004-inventory_module completed');
    } catch (error) {
      console.error('❌ 20240101000004-inventory_module failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000004-inventory_module.js');
  }
};
