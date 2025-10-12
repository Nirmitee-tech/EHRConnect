const { pool } = require('../database/connection');

class InventoryService {
  async listCategories(orgId, { includeInactive = false } = {}) {
    const params = [orgId];
    let where = 'WHERE org_id = $1';

    if (!includeInactive) {
      params.push(true);
      where += ` AND is_active = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT id, name, description, is_active AS "isActive", metadata, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM inventory_categories
       ${where}
       ORDER BY name ASC`,
      params
    );

    return result.rows;
  }

  async createCategory(orgId, payload, userId) {
    const { name, description, isActive = true, metadata } = payload;

    if (!name) {
      throw new Error('Category name is required');
    }

    const result = await pool.query(
      `INSERT INTO inventory_categories (org_id, name, description, is_active, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, org_id AS "orgId", name, description, is_active AS "isActive", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [orgId, name, description || null, isActive, metadata ? JSON.stringify(metadata) : null]
    );

    await this.#recordAudit(orgId, userId, 'INVENTORY.CATEGORY_CREATED', { categoryId: result.rows[0].id, name });

    return result.rows[0];
  }

  async updateCategory(orgId, categoryId, updates = {}, userId) {
    const fields = [];
    const params = [orgId, categoryId];

    if (updates.name !== undefined) {
      fields.push(`name = $${params.length + 1}`);
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${params.length + 1}`);
      params.push(updates.description || null);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${params.length + 1}`);
      params.push(Boolean(updates.isActive));
    }
    if (updates.metadata !== undefined) {
      fields.push(`metadata = $${params.length + 1}`);
      params.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
    }

    if (fields.length === 0) {
      return this.getCategory(orgId, categoryId);
    }

    const result = await pool.query(
      `UPDATE inventory_categories
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE org_id = $1 AND id = $2
       RETURNING id, org_id AS "orgId", name, description, is_active AS "isActive", metadata, created_at AS "createdAt", updated_at AS "updatedAt"`,
      params
    );

    if (result.rowCount === 0) {
      throw new Error('Inventory category not found');
    }

    await this.#recordAudit(orgId, userId, 'INVENTORY.CATEGORY_UPDATED', { categoryId, updates });

    return result.rows[0];
  }

  async getCategory(orgId, categoryId) {
    const result = await pool.query(
      `SELECT id, org_id AS "orgId", name, description, is_active AS "isActive", metadata,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM inventory_categories
       WHERE org_id = $1 AND id = $2`,
      [orgId, categoryId]
    );

    if (result.rowCount === 0) {
      throw new Error('Inventory category not found');
    }

    return result.rows[0];
  }

  async listSuppliers(orgId, { search, includeInactive = false } = {}) {
    const params = [orgId];
    let where = 'WHERE org_id = $1';

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length} OR contact_name ILIKE $${params.length})`;
    }

    if (!includeInactive) {
      params.push(true);
      where += ` AND is_active = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT id, org_id AS "orgId", name, code, contact_name AS "contactName", contact_phone AS "contactPhone",
              contact_email AS "contactEmail", address, notes, is_active AS "isActive", metadata,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM inventory_suppliers
       ${where}
       ORDER BY name ASC`,
      params
    );

    return result.rows;
  }

  async createSupplier(orgId, payload = {}, userId) {
    const {
      name,
      code,
      contactName,
      contactPhone,
      contactEmail,
      address,
      notes,
      isActive = true,
      metadata
    } = payload;

    if (!name) {
      throw new Error('Supplier name is required');
    }

    const result = await pool.query(
      `INSERT INTO inventory_suppliers
        (org_id, name, code, contact_name, contact_phone, contact_email, address, notes, is_active, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, org_id AS "orgId", name, code, contact_name AS "contactName", contact_phone AS "contactPhone",
                 contact_email AS "contactEmail", address, notes, is_active AS "isActive", metadata,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        orgId,
        name,
        code || null,
        contactName || null,
        contactPhone || null,
        contactEmail || null,
        address ? JSON.stringify(address) : null,
        notes || null,
        isActive,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    await this.#recordAudit(orgId, userId, 'INVENTORY.SUPPLIER_CREATED', { supplierId: result.rows[0].id, name });

    return result.rows[0];
  }

  async updateSupplier(orgId, supplierId, updates = {}, userId) {
    const fields = [];
    const params = [orgId, supplierId];

    const map = {
      name: 'name',
      code: 'code',
      contactName: 'contact_name',
      contactPhone: 'contact_phone',
      contactEmail: 'contact_email',
      notes: 'notes',
      isActive: 'is_active'
    };

    for (const [key, column] of Object.entries(map)) {
      if (updates[key] !== undefined) {
        fields.push(`${column} = $${params.length + 1}`);
        params.push(updates[key] || null);
      }
    }

    if (updates.address !== undefined) {
      fields.push(`address = $${params.length + 1}`);
      params.push(updates.address ? JSON.stringify(updates.address) : null);
    }

    if (updates.metadata !== undefined) {
      fields.push(`metadata = $${params.length + 1}`);
      params.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
    }

    if (fields.length === 0) {
      return this.getSupplier(orgId, supplierId);
    }

    const result = await pool.query(
      `UPDATE inventory_suppliers
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE org_id = $1 AND id = $2
       RETURNING id, org_id AS "orgId", name, code, contact_name AS "contactName", contact_phone AS "contactPhone",
                 contact_email AS "contactEmail", address, notes, is_active AS "isActive", metadata,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      params
    );

    if (result.rowCount === 0) {
      throw new Error('Supplier not found');
    }

    await this.#recordAudit(orgId, userId, 'INVENTORY.SUPPLIER_UPDATED', { supplierId, updates });

    return result.rows[0];
  }

  async getSupplier(orgId, supplierId) {
    const result = await pool.query(
      `SELECT id, org_id AS "orgId", name, code, contact_name AS "contactName", contact_phone AS "contactPhone",
              contact_email AS "contactEmail", address, notes, is_active AS "isActive", metadata,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM inventory_suppliers
       WHERE org_id = $1 AND id = $2`,
      [orgId, supplierId]
    );

    if (result.rowCount === 0) {
      throw new Error('Supplier not found');
    }

    return result.rows[0];
  }

  async listItems(orgId, filters = {}) {
    const {
      search,
      categoryId,
      locationId,
      includeInactive = false,
      controlledOnly = false,
      limit = 50,
      offset = 0
    } = filters;

    const params = [orgId, locationId || null];
    let where = 'WHERE i.org_id = $1';

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (i.name ILIKE $${params.length} OR i.sku ILIKE $${params.length})`;
    }

    if (categoryId) {
      params.push(categoryId);
      where += ` AND i.category_id = $${params.length}`;
    }

    if (!includeInactive) {
      params.push(true);
      where += ` AND i.is_active = $${params.length}`;
    }

    if (controlledOnly) {
      where += ' AND i.is_controlled_substance = TRUE';
    }

    const result = await pool.query(
      `SELECT
         i.id,
         i.org_id AS "orgId",
         i.name,
         i.sku,
         i.description,
         i.unit_of_measure AS "unitOfMeasure",
         i.track_lots AS "trackLots",
         i.track_expiration AS "trackExpiration",
         i.allow_partial_quantity AS "allowPartialQuantity",
         i.min_stock_level AS "minStockLevel",
         i.max_stock_level AS "maxStockLevel",
         i.reorder_point AS "reorderPoint",
         i.reorder_quantity AS "reorderQuantity",
         i.cost_per_unit AS "costPerUnit",
         i.is_controlled_substance AS "isControlledSubstance",
         i.is_active AS "isActive",
         i.metadata,
         i.category_id AS "categoryId",
         c.name AS "categoryName",
         i.default_location_id AS "defaultLocationId",
         COALESCE(SUM(l.quantity_on_hand), 0) AS "quantityOnHand",
         COALESCE(SUM(l.quantity_reserved), 0) AS "quantityReserved",
         MIN(l.expiration_date) FILTER (WHERE l.expiration_date IS NOT NULL) AS "nextExpiration",
         i.created_at AS "createdAt",
         i.updated_at AS "updatedAt"
       FROM inventory_items i
       LEFT JOIN inventory_categories c ON c.id = i.category_id
       LEFT JOIN inventory_lots l ON l.item_id = i.id AND l.org_id = i.org_id AND ($2::uuid IS NULL OR l.location_id = $2::uuid)
       ${where}
       GROUP BY i.id, c.name
       ORDER BY i.name ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  async getItem(orgId, itemId) {
    const itemResult = await pool.query(
      `SELECT
         i.id,
         i.org_id AS "orgId",
         i.name,
         i.sku,
         i.description,
         i.unit_of_measure AS "unitOfMeasure",
         i.track_lots AS "trackLots",
         i.track_expiration AS "trackExpiration",
         i.allow_partial_quantity AS "allowPartialQuantity",
         i.min_stock_level AS "minStockLevel",
         i.max_stock_level AS "maxStockLevel",
         i.reorder_point AS "reorderPoint",
         i.reorder_quantity AS "reorderQuantity",
         i.cost_per_unit AS "costPerUnit",
         i.is_controlled_substance AS "isControlledSubstance",
         i.is_active AS "isActive",
         i.metadata,
         i.category_id AS "categoryId",
         c.name AS "categoryName",
         i.default_location_id AS "defaultLocationId",
         COALESCE(SUM(l.quantity_on_hand), 0) AS "quantityOnHand",
         COALESCE(SUM(l.quantity_reserved), 0) AS "quantityReserved",
         MIN(l.expiration_date) FILTER (WHERE l.expiration_date IS NOT NULL) AS "nextExpiration",
         i.created_at AS "createdAt",
         i.updated_at AS "updatedAt"
       FROM inventory_items i
       LEFT JOIN inventory_categories c ON c.id = i.category_id
       LEFT JOIN inventory_lots l ON l.item_id = i.id AND l.org_id = i.org_id
       WHERE i.org_id = $1 AND i.id = $2
       GROUP BY i.id, c.name`,
      [orgId, itemId]
    );

    if (itemResult.rowCount === 0) {
      throw new Error('Inventory item not found');
    }

    const lotsResult = await pool.query(
      `SELECT
         l.id,
         l.lot_number AS "lotNumber",
         l.serial_number AS "serialNumber",
         l.barcode,
         l.expiration_date AS "expirationDate",
         l.manufacture_date AS "manufactureDate",
         l.quantity_on_hand AS "quantityOnHand",
         l.quantity_reserved AS "quantityReserved",
         l.status,
         l.received_at AS "receivedAt",
         l.opened_at AS "openedAt",
         l.notes,
         l.metadata,
         l.location_id AS "locationId",
         loc.name AS "locationName",
         l.supplier_id AS "supplierId",
         s.name AS "supplierName"
       FROM inventory_lots l
       LEFT JOIN locations loc ON loc.id = l.location_id
       LEFT JOIN inventory_suppliers s ON s.id = l.supplier_id
       WHERE l.org_id = $1 AND l.item_id = $2
       ORDER BY l.expiration_date NULLS LAST, l.received_at DESC`,
      [orgId, itemId]
    );

    const locationSettings = await pool.query(
      `SELECT
         id,
         location_id AS "locationId",
         par_level AS "parLevel",
         reorder_point AS "reorderPoint",
         reorder_quantity AS "reorderQuantity",
         max_level AS "maxLevel",
         is_primary AS "isPrimary",
         notes,
         metadata,
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM inventory_item_locations
       WHERE org_id = $1 AND item_id = $2
       ORDER BY is_primary DESC, updated_at DESC`,
      [orgId, itemId]
    );

    return {
      ...itemResult.rows[0],
      lots: lotsResult.rows,
      locations: locationSettings.rows
    };
  }

  async createItem(orgId, payload = {}, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        name,
        sku,
        description,
        unitOfMeasure = 'each',
        categoryId,
        defaultLocationId,
        trackLots = true,
        trackExpiration = true,
        allowPartialQuantity = false,
        minStockLevel,
        maxStockLevel,
        reorderPoint,
        reorderQuantity,
        costPerUnit,
        isControlledSubstance = false,
        isActive = true,
        metadata,
        locationSettings = []
      } = payload;

      if (!name) {
        throw new Error('Item name is required');
      }

      const itemResult = await client.query(
        `INSERT INTO inventory_items
           (org_id, name, sku, description, unit_of_measure, category_id, default_location_id,
            track_lots, track_expiration, allow_partial_quantity, min_stock_level, max_stock_level,
            reorder_point, reorder_quantity, cost_per_unit, is_controlled_substance, is_active, metadata)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18)
         RETURNING *`,
        [
          orgId,
          name,
          sku || null,
          description || null,
          unitOfMeasure,
          categoryId || null,
          defaultLocationId || null,
          trackLots,
          trackExpiration,
          allowPartialQuantity,
          minStockLevel ?? null,
          maxStockLevel ?? null,
          reorderPoint ?? null,
          reorderQuantity ?? null,
          costPerUnit ?? null,
          isControlledSubstance,
          isActive,
          metadata ? JSON.stringify(metadata) : null
        ]
      );

      const item = this.#mapItem(itemResult.rows[0]);

      if (Array.isArray(locationSettings) && locationSettings.length > 0) {
        await this.#upsertItemLocations(client, orgId, item.id, locationSettings);
      }

      await client.query('COMMIT');

      await this.#recordAudit(orgId, userId, 'INVENTORY.ITEM_CREATED', { itemId: item.id, name });

      return item;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateItem(orgId, itemId, payload = {}, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const columns = [];
      const params = [orgId, itemId];

      const mapping = {
        name: 'name',
        sku: 'sku',
        description: 'description',
        unitOfMeasure: 'unit_of_measure',
        categoryId: 'category_id',
        defaultLocationId: 'default_location_id',
        trackLots: 'track_lots',
        trackExpiration: 'track_expiration',
        allowPartialQuantity: 'allow_partial_quantity',
        minStockLevel: 'min_stock_level',
        maxStockLevel: 'max_stock_level',
        reorderPoint: 'reorder_point',
        reorderQuantity: 'reorder_quantity',
        costPerUnit: 'cost_per_unit',
        isControlledSubstance: 'is_controlled_substance',
        isActive: 'is_active'
      };

      for (const [key, column] of Object.entries(mapping)) {
        if (payload[key] !== undefined) {
          columns.push(`${column} = $${params.length + 1}`);
          params.push(payload[key] ?? null);
        }
      }

      if (payload.metadata !== undefined) {
        columns.push(`metadata = $${params.length + 1}`);
        params.push(payload.metadata ? JSON.stringify(payload.metadata) : null);
      }

      let item;
      if (columns.length > 0) {
        const updateResult = await client.query(
          `UPDATE inventory_items
             SET ${columns.join(', ')}, updated_at = NOW()
           WHERE org_id = $1 AND id = $2
           RETURNING *`,
          params
        );

        if (updateResult.rowCount === 0) {
          throw new Error('Inventory item not found');
        }

        item = this.#mapItem(updateResult.rows[0]);
      } else {
        const existing = await client.query(
          'SELECT * FROM inventory_items WHERE org_id = $1 AND id = $2',
          [orgId, itemId]
        );

        if (existing.rowCount === 0) {
          throw new Error('Inventory item not found');
        }

        item = this.#mapItem(existing.rows[0]);
      }

      if (Array.isArray(payload.locationSettings)) {
        await client.query(
          'DELETE FROM inventory_item_locations WHERE org_id = $1 AND item_id = $2',
          [orgId, itemId]
        );

        if (payload.locationSettings.length > 0) {
          await this.#upsertItemLocations(client, orgId, itemId, payload.locationSettings);
        }
      }

      await client.query('COMMIT');

      await this.#recordAudit(orgId, userId, 'INVENTORY.ITEM_UPDATED', { itemId, updates: payload });

      return item;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listLots(orgId, filters = {}) {
    const {
      itemId,
      locationId,
      status,
      expiringWithinDays,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const params = [orgId];
    let where = 'WHERE l.org_id = $1';

    if (itemId) {
      params.push(itemId);
      where += ` AND l.item_id = $${params.length}`;
    }

    if (locationId) {
      params.push(locationId);
      where += ` AND l.location_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      where += ` AND l.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (l.lot_number ILIKE $${params.length} OR l.barcode ILIKE $${params.length})`;
    }

    if (expiringWithinDays) {
      params.push(expiringWithinDays);
      where += ` AND l.expiration_date IS NOT NULL AND l.expiration_date <= CURRENT_DATE + ($${params.length}::int * INTERVAL '1 day')`;
    }

    const result = await pool.query(
      `SELECT
         l.id,
         l.item_id AS "itemId",
         i.name AS "itemName",
         l.lot_number AS "lotNumber",
         l.serial_number AS "serialNumber",
         l.barcode,
         l.expiration_date AS "expirationDate",
         l.manufacture_date AS "manufactureDate",
         l.quantity_on_hand AS "quantityOnHand",
         l.quantity_reserved AS "quantityReserved",
         l.status,
         l.received_at AS "receivedAt",
         l.opened_at AS "openedAt",
         l.notes,
         l.metadata,
         l.location_id AS "locationId",
         loc.name AS "locationName",
         l.supplier_id AS "supplierId",
         s.name AS "supplierName"
       FROM inventory_lots l
       JOIN inventory_items i ON i.id = l.item_id
       LEFT JOIN inventory_suppliers s ON s.id = l.supplier_id
       LEFT JOIN locations loc ON loc.id = l.location_id
       ${where}
       ORDER BY l.expiration_date NULLS LAST, l.received_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  async createLot(orgId, itemId, payload = {}, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const itemCheck = await client.query(
        'SELECT id, track_lots FROM inventory_items WHERE org_id = $1 AND id = $2',
        [orgId, itemId]
      );

      if (itemCheck.rowCount === 0) {
        throw new Error('Inventory item not found');
      }

      const {
        lotNumber,
        serialNumber,
        barcode,
        expirationDate,
        manufactureDate,
        supplierId,
        locationId,
        status = 'available',
        receivedAt,
        openedAt,
        notes,
        metadata,
        quantityOnHand = 0,
        quantityReserved = 0,
        unitCost,
        movementMetadata,
        referenceType,
        referenceId,
        reason
      } = payload;

      if (!lotNumber) {
        throw new Error('lotNumber is required');
      }

      const lotResult = await client.query(
        `INSERT INTO inventory_lots
           (org_id, item_id, supplier_id, location_id, lot_number, serial_number, barcode,
            expiration_date, manufacture_date, quantity_on_hand, quantity_reserved, status,
            received_at, opened_at, notes, metadata)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7,
            $8, $9, 0, $10, $11,
            $12, $13, $14, $15)
         RETURNING *`,
        [
          orgId,
          itemId,
          supplierId || null,
          locationId || null,
          lotNumber,
          serialNumber || null,
          barcode || null,
          expirationDate || null,
          manufactureDate || null,
          quantityReserved ?? 0,
          status,
          receivedAt || new Date(),
          openedAt || null,
          notes || null,
          metadata ? JSON.stringify(metadata) : null
        ]
      );

      const lot = this.#mapLot(lotResult.rows[0]);

      if (quantityOnHand > 0) {
        await this.#applyMovement(client, {
          orgId,
          itemId,
          lotId: lot.id,
          quantity: Number(quantityOnHand),
          movementType: 'receipt',
          direction: 'in',
          destinationLocationId: locationId || null,
          unitCost: unitCost ?? null,
          reason: reason || 'Initial lot balance',
          referenceType: referenceType || 'LOT',
          referenceId: referenceId || lot.id,
          performedBy: userId || null,
          notes: notes || null,
          occurredAt: receivedAt || new Date(),
          metadata: movementMetadata || null
        });
      }

      await client.query('COMMIT');

      await this.#recordAudit(orgId, userId, 'INVENTORY.LOT_CREATED', { itemId, lotId: lot.id, lotNumber });

      return { ...lot, quantityOnHand };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recordStockMovement(orgId, payload = {}, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        itemId,
        lotId,
        quantity,
        movementType,
        direction,
        sourceLocationId,
        destinationLocationId,
        supplierId,
        lotNumber,
        serialNumber,
        barcode,
        expirationDate,
        manufactureDate,
        receivedAt,
        occurredAt,
        unitCost,
        reason,
        referenceType,
        referenceId,
        notes,
        metadata
      } = payload;

      if (!itemId) {
        throw new Error('itemId is required for stock movement');
      }

      if (!movementType) {
        throw new Error('movementType is required');
      }

      const itemCheck = await client.query(
        'SELECT id FROM inventory_items WHERE org_id = $1 AND id = $2',
        [orgId, itemId]
      );

      if (itemCheck.rowCount === 0) {
        throw new Error('Inventory item not found');
      }

      let resolvedLotId = lotId || null;

      if (!resolvedLotId) {
        if (!lotNumber) {
          throw new Error('lotId or lotNumber must be provided');
        }

        const existingLot = await client.query(
          `SELECT id FROM inventory_lots
           WHERE org_id = $1 AND item_id = $2 AND lot_number = $3`,
          [orgId, itemId, lotNumber]
        );

        if (existingLot.rowCount > 0) {
          resolvedLotId = existingLot.rows[0].id;
        } else {
          const newLot = await client.query(
            `INSERT INTO inventory_lots
               (org_id, item_id, supplier_id, location_id, lot_number, serial_number, barcode,
                expiration_date, manufacture_date, quantity_on_hand, quantity_reserved, status,
                received_at, opened_at, notes, metadata)
             VALUES
               ($1, $2, $3, $4, $5, $6, $7,
                $8, $9, 0, 0, 'available',
                $10, NULL, $11, $12)
             RETURNING id`,
            [
              orgId,
              itemId,
              supplierId || null,
              destinationLocationId || sourceLocationId || null,
              lotNumber,
              serialNumber || null,
              barcode || null,
              expirationDate || null,
              manufactureDate || null,
              receivedAt || new Date(),
              notes || null,
              metadata ? JSON.stringify(metadata) : null
            ]
          );

          resolvedLotId = newLot.rows[0].id;
        }
      }

      const resolvedDirection = direction || (['receipt', 'return', 'adjustment'].includes(movementType) ? 'in' : 'out');

      const movement = await this.#applyMovement(client, {
        orgId,
        itemId,
        lotId: resolvedLotId,
        quantity: Number(quantity),
        movementType,
        direction: resolvedDirection,
        sourceLocationId: sourceLocationId || null,
        destinationLocationId: destinationLocationId || null,
        unitCost: unitCost ?? null,
        reason: reason || null,
        referenceType: referenceType || null,
        referenceId: referenceId || null,
        performedBy: userId || null,
        notes: notes || null,
        occurredAt: occurredAt || new Date(),
        metadata: metadata || null
      });

      await client.query('COMMIT');

      await this.#recordAudit(orgId, userId, 'INVENTORY.MOVEMENT_RECORDED', {
        itemId,
        lotId: resolvedLotId,
        movementType,
        direction: resolvedDirection,
        quantity
      });

      return movement;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listStockMovements(orgId, filters = {}) {
    const {
      itemId,
      lotId,
      movementType,
      direction,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    const params = [orgId];
    let where = 'WHERE m.org_id = $1';

    if (itemId) {
      params.push(itemId);
      where += ` AND m.item_id = $${params.length}`;
    }

    if (lotId) {
      params.push(lotId);
      where += ` AND m.lot_id = $${params.length}`;
    }

    if (movementType) {
      params.push(movementType);
      where += ` AND m.movement_type = $${params.length}`;
    }

    if (direction) {
      params.push(direction);
      where += ` AND m.direction = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      where += ` AND m.occurred_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      where += ` AND m.occurred_at <= $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
         m.id,
         m.item_id AS "itemId",
         i.name AS "itemName",
         m.lot_id AS "lotId",
         l.lot_number AS "lotNumber",
         m.source_location_id AS "sourceLocationId",
         src.name AS "sourceLocationName",
         m.destination_location_id AS "destinationLocationId",
         dest.name AS "destinationLocationName",
         m.quantity,
         m.unit_cost AS "unitCost",
         m.movement_type AS "movementType",
         m.direction,
         m.reason,
         m.reference_type AS "referenceType",
         m.reference_id AS "referenceId",
         m.performed_by AS "performedBy",
         u.name AS "performedByName",
         m.notes,
         m.occurred_at AS "occurredAt",
         m.metadata,
         m.created_at AS "createdAt"
       FROM inventory_stock_movements m
       JOIN inventory_items i ON i.id = m.item_id
       LEFT JOIN inventory_lots l ON l.id = m.lot_id
       LEFT JOIN locations src ON src.id = m.source_location_id
       LEFT JOIN locations dest ON dest.id = m.destination_location_id
       LEFT JOIN users u ON u.id = m.performed_by
       ${where}
       ORDER BY m.occurred_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  async getDashboardOverview(orgId, filters = {}) {
    const { locationId, daysToExpire = 30 } = filters;

    const [itemCounts, lotAggregates, lowStock, expiringLots, controlledItems] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE is_active) AS active
         FROM inventory_items
         WHERE org_id = $1`,
        [orgId]
      ),
      pool.query(
        `SELECT
           COALESCE(SUM(l.quantity_on_hand), 0) AS total_quantity,
           COALESCE(SUM(l.quantity_on_hand * COALESCE(i.cost_per_unit, 0)), 0) AS total_value
         FROM inventory_lots l
         JOIN inventory_items i ON i.id = l.item_id
         WHERE l.org_id = $1 AND ($2::uuid IS NULL OR l.location_id = $2::uuid)`,
        [orgId, locationId || null]
      ),
      pool.query(
        `SELECT
           i.id,
           i.name,
           i.reorder_point AS "reorderPoint",
           i.reorder_quantity AS "reorderQuantity",
           COALESCE(SUM(l.quantity_on_hand), 0) AS "quantityOnHand"
         FROM inventory_items i
         LEFT JOIN inventory_lots l ON l.item_id = i.id AND l.org_id = i.org_id AND ($2::uuid IS NULL OR l.location_id = $2::uuid)
         WHERE i.org_id = $1 AND i.reorder_point IS NOT NULL
         GROUP BY i.id
         HAVING COALESCE(SUM(l.quantity_on_hand), 0) <= i.reorder_point
         ORDER BY i.reorder_point NULLS LAST
         LIMIT 10`,
        [orgId, locationId || null]
      ),
      pool.query(
        `SELECT
           l.id,
           i.name AS "itemName",
           l.lot_number AS "lotNumber",
           l.expiration_date AS "expirationDate",
           l.quantity_on_hand AS "quantityOnHand",
           loc.name AS "locationName"
         FROM inventory_lots l
         JOIN inventory_items i ON i.id = l.item_id
         LEFT JOIN locations loc ON loc.id = l.location_id
         WHERE l.org_id = $1
           AND l.status IN ('available', 'reserved')
           AND l.expiration_date IS NOT NULL
           AND l.expiration_date <= CURRENT_DATE + ($3::int * INTERVAL '1 day')
           AND l.expiration_date >= CURRENT_DATE
           AND ($2::uuid IS NULL OR l.location_id = $2::uuid)
         ORDER BY l.expiration_date ASC
         LIMIT 20`,
        [orgId, locationId || null, daysToExpire]
      ),
      pool.query(
        `SELECT
           i.id,
           i.name,
           COALESCE(SUM(l.quantity_on_hand), 0) AS "quantityOnHand"
         FROM inventory_items i
         LEFT JOIN inventory_lots l ON l.item_id = i.id AND l.org_id = i.org_id
         WHERE i.org_id = $1 AND i.is_controlled_substance = TRUE
         GROUP BY i.id
         ORDER BY i.name ASC`,
        [orgId]
      )
    ]);

    return {
      totals: {
        totalItems: Number(itemCounts.rows[0].total || 0),
        activeItems: Number(itemCounts.rows[0].active || 0),
        totalQuantity: Number(lotAggregates.rows[0].total_quantity || 0),
        totalValue: Number(lotAggregates.rows[0].total_value || 0)
      },
      lowStock: lowStock.rows,
      expiringLots: expiringLots.rows,
      controlledSubstances: controlledItems.rows
    };
  }

  async #applyMovement(client, movement) {
    const {
      orgId,
      itemId,
      lotId,
      quantity,
      movementType,
      direction,
      sourceLocationId,
      destinationLocationId,
      unitCost,
      reason,
      referenceType,
      referenceId,
      performedBy,
      notes,
      occurredAt,
      metadata
    } = movement;

    if (!lotId) {
      throw new Error('Lot is required for movement application');
    }

    if (!quantity || Number(quantity) <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const lotResult = await client.query(
      `SELECT id, quantity_on_hand, status
       FROM inventory_lots
       WHERE org_id = $1 AND id = $2
       FOR UPDATE`,
      [orgId, lotId]
    );

    if (lotResult.rowCount === 0) {
      throw new Error('Inventory lot not found');
    }

    const lot = lotResult.rows[0];
    const currentQuantity = Number(lot.quantity_on_hand || 0);
    const delta = direction === 'in' ? Number(quantity) : -Number(quantity);
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 0) {
      throw new Error('Insufficient quantity available in the selected lot');
    }

    let newStatus = lot.status;
    if (newQuantity === 0 && direction === 'out' && lot.status === 'available') {
      newStatus = 'consumed';
    }

    await client.query(
      `UPDATE inventory_lots
         SET quantity_on_hand = $1,
             status = $2,
             updated_at = NOW(),
             location_id = COALESCE($3, location_id)
       WHERE id = $4`,
      [newQuantity, newStatus, destinationLocationId || null, lotId]
    );

    if (destinationLocationId) {
      await client.query(
        `INSERT INTO inventory_item_locations (org_id, item_id, location_id, is_primary)
         VALUES ($1, $2, $3, FALSE)
         ON CONFLICT (org_id, item_id, location_id)
         DO UPDATE SET updated_at = NOW()`,
        [orgId, itemId, destinationLocationId]
      );
    }

    if (sourceLocationId) {
      await client.query(
        `INSERT INTO inventory_item_locations (org_id, item_id, location_id, is_primary)
         VALUES ($1, $2, $3, FALSE)
         ON CONFLICT (org_id, item_id, location_id)
         DO UPDATE SET updated_at = NOW()`,
        [orgId, itemId, sourceLocationId]
      );
    }

    const movementResult = await client.query(
      `INSERT INTO inventory_stock_movements
         (org_id, item_id, lot_id, source_location_id, destination_location_id, quantity, unit_cost,
          movement_type, direction, reason, reference_type, reference_id, performed_by, notes, occurred_at, metadata)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id, org_id AS "orgId", item_id AS "itemId", lot_id AS "lotId",
                 source_location_id AS "sourceLocationId", destination_location_id AS "destinationLocationId",
                 quantity, unit_cost AS "unitCost", movement_type AS "movementType", direction,
                 reason, reference_type AS "referenceType", reference_id AS "referenceId",
                 performed_by AS "performedBy", notes, occurred_at AS "occurredAt", metadata, created_at AS "createdAt"`,
      [
        orgId,
        itemId,
        lotId,
        sourceLocationId || null,
        destinationLocationId || null,
        Number(quantity),
        unitCost ?? null,
        movementType,
        direction,
        reason || null,
        referenceType || null,
        referenceId || null,
        performedBy || null,
        notes || null,
        occurredAt || new Date(),
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    return movementResult.rows[0];
  }

  async #upsertItemLocations(client, orgId, itemId, locations = []) {
    for (const location of locations) {
      await client.query(
        `INSERT INTO inventory_item_locations
           (org_id, item_id, location_id, par_level, reorder_point, reorder_quantity, max_level, is_primary, notes, metadata)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (org_id, item_id, location_id)
         DO UPDATE SET
           par_level = EXCLUDED.par_level,
           reorder_point = EXCLUDED.reorder_point,
           reorder_quantity = EXCLUDED.reorder_quantity,
           max_level = EXCLUDED.max_level,
           is_primary = EXCLUDED.is_primary,
           notes = EXCLUDED.notes,
           metadata = EXCLUDED.metadata,
           updated_at = NOW()`
        , [
          orgId,
          itemId,
          location.locationId,
          location.parLevel ?? null,
          location.reorderPoint ?? null,
          location.reorderQuantity ?? null,
          location.maxLevel ?? null,
          Boolean(location.isPrimary),
          location.notes || null,
          location.metadata ? JSON.stringify(location.metadata) : null
        ]
      );
    }
  }

  #mapItem(row) {
    return {
      id: row.id,
      orgId: row.org_id,
      name: row.name,
      sku: row.sku,
      description: row.description,
      unitOfMeasure: row.unit_of_measure,
      categoryId: row.category_id,
      defaultLocationId: row.default_location_id,
      trackLots: row.track_lots,
      trackExpiration: row.track_expiration,
      allowPartialQuantity: row.allow_partial_quantity,
      minStockLevel: row.min_stock_level,
      maxStockLevel: row.max_stock_level,
      reorderPoint: row.reorder_point,
      reorderQuantity: row.reorder_quantity,
      costPerUnit: row.cost_per_unit,
      isControlledSubstance: row.is_controlled_substance,
      isActive: row.is_active,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  #mapLot(row) {
    return {
      id: row.id,
      orgId: row.org_id,
      itemId: row.item_id,
      supplierId: row.supplier_id,
      locationId: row.location_id,
      lotNumber: row.lot_number,
      serialNumber: row.serial_number,
      barcode: row.barcode,
      expirationDate: row.expiration_date,
      manufactureDate: row.manufacture_date,
      quantityOnHand: row.quantity_on_hand,
      quantityReserved: row.quantity_reserved,
      status: row.status,
      receivedAt: row.received_at,
      openedAt: row.opened_at,
      notes: row.notes,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async #recordAudit(orgId, userId, action, metadata = {}) {
    if (!orgId) {
      return;
    }

    try {
      await pool.query(
        `INSERT INTO audit_events (org_id, actor_user_id, action, target_type, status, metadata)
         VALUES ($1, $2, $3, 'Inventory', 'success', $4)`,
        [orgId, userId || null, action, JSON.stringify(metadata || {})]
      );
    } catch (error) {
      console.error('Failed to record inventory audit event:', error.message);
    }
  }
}

module.exports = new InventoryService();
