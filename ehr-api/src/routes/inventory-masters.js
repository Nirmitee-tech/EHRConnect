const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

// =====================================================================
// LOCATIONS
// =====================================================================

// Get all locations
router.get('/locations', async (req, res) => {
  try {
    const { org_id, active } = req.query;

    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];

    if (org_id) {
      params.push(org_id);
      query += ` AND org_id = $${params.length}`;
    }

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND active = $${params.length}`;
    }

    query += ' ORDER BY name';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get location by ID
router.get('/locations/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM locations WHERE id = $1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create location
router.post('/locations', async (req, res) => {
  try {
    const {
      org_id,
      name,
      code,
      location_type,
      address,
      timezone,
      contact_email,
      contact_phone,
      contact_person,
      operational_hours,
      metadata
    } = req.body;

    if (!org_id || !name || !location_type || !address || !timezone) {
      return res.status(400).json({
        error: 'Missing required fields: org_id, name, location_type, address, timezone'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO locations (
        org_id, name, code, location_type, address, timezone,
        contact_email, contact_phone, contact_person, operational_hours,
        active, metadata, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, NOW(), NOW())
      RETURNING *`,
      [
        org_id, name, code, location_type,
        typeof address === 'string' ? address : JSON.stringify(address),
        timezone, contact_email, contact_phone, contact_person,
        typeof operational_hours === 'string' ? operational_hours : JSON.stringify(operational_hours),
        typeof metadata === 'string' ? metadata : JSON.stringify(metadata)
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.put('/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'code', 'location_type', 'address', 'timezone',
      'contact_email', 'contact_phone', 'contact_person',
      'operational_hours', 'active', 'metadata'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        const value = (typeof updates[field] === 'object' && updates[field] !== null)
          ? JSON.stringify(updates[field])
          : updates[field];
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE locations
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete location
router.delete('/locations/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM locations WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================================
// CATEGORIES
// =====================================================================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const { org_id, is_active } = req.query;

    let query = 'SELECT * FROM inventory_categories WHERE 1=1';
    const params = [];

    if (org_id) {
      params.push(org_id);
      query += ` AND org_id = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY name';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM inventory_categories WHERE id = $1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { org_id, name, description, metadata } = req.body;

    if (!org_id || !name) {
      return res.status(400).json({
        error: 'Missing required fields: org_id, name'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO inventory_categories (org_id, name, description, is_active, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, true, $4, NOW(), NOW())
       RETURNING *`,
      [org_id, name, description, typeof metadata === 'string' ? metadata : JSON.stringify(metadata)]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, metadata } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (metadata !== undefined) {
      fields.push(`metadata = $${paramCount++}`);
      values.push(typeof metadata === 'string' ? metadata : JSON.stringify(metadata));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE inventory_categories SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM inventory_categories WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================================
// SUPPLIERS
// =====================================================================

// Get all suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { org_id, is_active } = req.query;

    let query = 'SELECT * FROM inventory_suppliers WHERE 1=1';
    const params = [];

    if (org_id) {
      params.push(org_id);
      query += ` AND org_id = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY name';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get supplier by ID
router.get('/suppliers/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM inventory_suppliers WHERE id = $1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create supplier
router.post('/suppliers', async (req, res) => {
  try {
    const {
      org_id,
      name,
      code,
      contact_name,
      contact_phone,
      contact_email,
      address,
      notes,
      metadata
    } = req.body;

    if (!org_id || !name) {
      return res.status(400).json({
        error: 'Missing required fields: org_id, name'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO inventory_suppliers (
        org_id, name, code, contact_name, contact_phone, contact_email,
        address, notes, is_active, metadata, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, NOW(), NOW())
      RETURNING *`,
      [
        org_id, name, code, contact_name, contact_phone, contact_email,
        typeof address === 'string' ? address : JSON.stringify(address),
        notes,
        typeof metadata === 'string' ? metadata : JSON.stringify(metadata)
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update supplier
router.put('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'code', 'contact_name', 'contact_phone', 'contact_email',
      'address', 'notes', 'is_active', 'metadata'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        const value = (typeof updates[field] === 'object' && updates[field] !== null)
          ? JSON.stringify(updates[field])
          : updates[field];
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE inventory_suppliers
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete supplier
router.delete('/suppliers/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM inventory_suppliers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
