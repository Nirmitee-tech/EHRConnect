const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventory.service');

function parseBoolean(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function requireOrgContext(req, res, next) {
  const orgId = req.headers['x-org-id'];
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context (x-org-id) is required' });
  }

  req.orgId = orgId;
  req.userId = req.headers['x-user-id'] || null;
  next();
}

router.use(requireOrgContext);

// =========================
// Categories
// =========================
router.get('/categories', async (req, res) => {
  try {
    const categories = await inventoryService.listCategories(req.orgId, {
      includeInactive: parseBoolean(req.query.includeInactive),
    });
    res.json({ categories });
  } catch (error) {
    console.error('Inventory categories list error:', error);
    res.status(500).json({ error: 'Failed to fetch categories', message: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = await inventoryService.createCategory(req.orgId, req.body, req.userId);
    res.status(201).json({ category });
  } catch (error) {
    console.error('Inventory category creation error:', error);
    res.status(400).json({ error: error.message || 'Failed to create category' });
  }
});

router.put('/categories/:categoryId', async (req, res) => {
  try {
    const category = await inventoryService.updateCategory(req.orgId, req.params.categoryId, req.body, req.userId);
    res.json({ category });
  } catch (error) {
    console.error('Inventory category update error:', error);
    res.status(400).json({ error: error.message || 'Failed to update category' });
  }
});

// =========================
// Suppliers
// =========================
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await inventoryService.listSuppliers(req.orgId, {
      search: req.query.search,
      includeInactive: parseBoolean(req.query.includeInactive),
    });
    res.json({ suppliers });
  } catch (error) {
    console.error('Inventory suppliers list error:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers', message: error.message });
  }
});

router.post('/suppliers', async (req, res) => {
  try {
    const supplier = await inventoryService.createSupplier(req.orgId, req.body, req.userId);
    res.status(201).json({ supplier });
  } catch (error) {
    console.error('Inventory supplier creation error:', error);
    res.status(400).json({ error: error.message || 'Failed to create supplier' });
  }
});

router.put('/suppliers/:supplierId', async (req, res) => {
  try {
    const supplier = await inventoryService.updateSupplier(req.orgId, req.params.supplierId, req.body, req.userId);
    res.json({ supplier });
  } catch (error) {
    console.error('Inventory supplier update error:', error);
    res.status(400).json({ error: error.message || 'Failed to update supplier' });
  }
});

// =========================
// Items
// =========================
router.get('/items', async (req, res) => {
  try {
    const items = await inventoryService.listItems(req.orgId, {
      search: req.query.search,
      categoryId: req.query.categoryId,
      locationId: req.query.locationId,
      includeInactive: parseBoolean(req.query.includeInactive),
      controlledOnly: parseBoolean(req.query.controlledOnly),
      limit: parseNumber(req.query.limit) || 50,
      offset: parseNumber(req.query.offset) || 0,
    });
    res.json({ items });
  } catch (error) {
    console.error('Inventory items list error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items', message: error.message });
  }
});

router.post('/items', async (req, res) => {
  try {
    const item = await inventoryService.createItem(req.orgId, req.body, req.userId);
    res.status(201).json({ item });
  } catch (error) {
    console.error('Inventory item creation error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An item with the same name or SKU already exists' });
    }
    res.status(400).json({ error: error.message || 'Failed to create inventory item' });
  }
});

router.get('/items/:itemId', async (req, res) => {
  try {
    const item = await inventoryService.getItem(req.orgId, req.params.itemId);
    res.json({ item });
  } catch (error) {
    console.error('Inventory item fetch error:', error);
    res.status(404).json({ error: error.message || 'Inventory item not found' });
  }
});

router.put('/items/:itemId', async (req, res) => {
  try {
    const item = await inventoryService.updateItem(req.orgId, req.params.itemId, req.body, req.userId);
    res.json({ item });
  } catch (error) {
    console.error('Inventory item update error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An item with the same name or SKU already exists' });
    }
    res.status(400).json({ error: error.message || 'Failed to update inventory item' });
  }
});

// =========================
// Lots
// =========================
router.get('/lots', async (req, res) => {
  try {
    const lots = await inventoryService.listLots(req.orgId, {
      itemId: req.query.itemId,
      locationId: req.query.locationId,
      status: req.query.status,
      search: req.query.search,
      expiringWithinDays: parseNumber(req.query.expiringWithinDays),
      limit: parseNumber(req.query.limit) || 50,
      offset: parseNumber(req.query.offset) || 0,
    });
    res.json({ lots });
  } catch (error) {
    console.error('Inventory lots list error:', error);
    res.status(500).json({ error: 'Failed to fetch lots', message: error.message });
  }
});

router.post('/items/:itemId/lots', async (req, res) => {
  try {
    const lot = await inventoryService.createLot(req.orgId, req.params.itemId, req.body, req.userId);
    res.status(201).json({ lot });
  } catch (error) {
    console.error('Inventory lot creation error:', error);
    res.status(400).json({ error: error.message || 'Failed to create lot' });
  }
});

// =========================
// Stock Movements
// =========================
router.get('/stock-movements', async (req, res) => {
  try {
    const movements = await inventoryService.listStockMovements(req.orgId, {
      itemId: req.query.itemId,
      lotId: req.query.lotId,
      movementType: req.query.movementType,
      direction: req.query.direction,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseNumber(req.query.limit) || 100,
      offset: parseNumber(req.query.offset) || 0,
    });
    res.json({ movements });
  } catch (error) {
    console.error('Inventory stock movements list error:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements', message: error.message });
  }
});

router.post('/stock-movements', async (req, res) => {
  try {
    const movement = await inventoryService.recordStockMovement(req.orgId, req.body, req.userId);
    res.status(201).json({ movement });
  } catch (error) {
    console.error('Inventory stock movement error:', error);
    res.status(400).json({ error: error.message || 'Failed to record stock movement' });
  }
});

// =========================
// Dashboard Overview
// =========================
router.get('/dashboard/overview', async (req, res) => {
  try {
    const overview = await inventoryService.getDashboardOverview(req.orgId, {
      locationId: req.query.locationId,
      daysToExpire: parseNumber(req.query.daysToExpire) || 30,
    });
    res.json({ overview });
  } catch (error) {
    console.error('Inventory dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to load inventory overview', message: error.message });
  }
});

module.exports = router;
