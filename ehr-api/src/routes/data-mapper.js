const express = require('express');
const router = express.Router();
const { extractUserContext } = require('../middleware/auth');

// Apply user context extraction to all routes
router.use(extractUserContext);

// ===== Data Mapper CRUD Operations =====

// Get all data mappers for an integration
router.get('/integrations/:integrationId/mappers', async (req, res) => {
  try {
    const { integrationId } = req.params;
    const orgId = req.headers['x-org-id'];

    if (!orgId) {
      return res.status(400).json({ error: 'x-org-id header is required' });
    }

    const query = `
      SELECT
        dm.*,
        (SELECT COUNT(*) FROM integration_field_mappings WHERE mapper_id = dm.id) as field_count,
        (SELECT COUNT(*) FROM integration_mapper_tests WHERE mapper_id = dm.id) as test_count
      FROM integration_data_mappers dm
      WHERE dm.integration_id = $1 AND dm.org_id = $2
      ORDER BY dm.created_at DESC
    `;

    const result = await req.db.query(query, [integrationId, orgId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        integrationId: row.integration_id,
        name: row.name,
        description: row.description,
        sourceSystem: row.source_system,
        targetSystem: row.target_system,
        messageType: row.message_type,
        active: row.active,
        fieldCount: parseInt(row.field_count),
        testCount: parseInt(row.test_count),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching data mappers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data mappers',
      details: error.message
    });
  }
});

// Get single data mapper with field mappings
router.get('/mappers/:mapperId', async (req, res) => {
  try {
    const { mapperId } = req.params;
    const orgId = req.headers['x-org-id'];

    if (!orgId) {
      return res.status(400).json({ error: 'x-org-id header is required' });
    }

    // Get mapper
    const mapperQuery = `
      SELECT * FROM integration_data_mappers
      WHERE id = $1 AND org_id = $2
    `;
    const mapperResult = await req.db.query(mapperQuery, [mapperId, orgId]);

    if (mapperResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data mapper not found' });
    }

    // Get field mappings
    const fieldsQuery = `
      SELECT * FROM integration_field_mappings
      WHERE mapper_id = $1
      ORDER BY sort_order, created_at
    `;
    const fieldsResult = await req.db.query(fieldsQuery, [mapperId]);

    // Get value lookups
    const lookupsQuery = `
      SELECT * FROM integration_value_lookups
      WHERE mapper_id = $1
      ORDER BY lookup_name, source_value
    `;
    const lookupsResult = await req.db.query(lookupsQuery, [mapperId]);

    const mapper = mapperResult.rows[0];

    res.json({
      success: true,
      data: {
        id: mapper.id,
        integrationId: mapper.integration_id,
        name: mapper.name,
        description: mapper.description,
        sourceSystem: mapper.source_system,
        targetSystem: mapper.target_system,
        messageType: mapper.message_type,
        active: mapper.active,
        createdAt: mapper.created_at,
        updatedAt: mapper.updated_at,
        fieldMappings: fieldsResult.rows.map(field => ({
          id: field.id,
          sourcePath: field.source_path,
          targetPath: field.target_path,
          transformType: field.transform_type,
          transformConfig: field.transform_config,
          required: field.required,
          defaultValue: field.default_value,
          validationRegex: field.validation_regex,
          sortOrder: field.sort_order,
          notes: field.notes
        })),
        valueLookups: lookupsResult.rows.map(lookup => ({
          id: lookup.id,
          fieldMappingId: lookup.field_mapping_id,
          lookupName: lookup.lookup_name,
          sourceValue: lookup.source_value,
          targetValue: lookup.target_value,
          description: lookup.description
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching data mapper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data mapper',
      details: error.message
    });
  }
});

// Create new data mapper
router.post('/integrations/:integrationId/mappers', async (req, res) => {
  try {
    const { integrationId } = req.params;
    const orgId = req.headers['x-org-id'];
    const userId = req.userContext?.userId;

    if (!orgId) {
      return res.status(400).json({ error: 'x-org-id header is required' });
    }

    const { name, description, sourceSystem, targetSystem, messageType, active = true } = req.body;

    if (!name || !sourceSystem || !targetSystem) {
      return res.status(400).json({
        error: 'Missing required fields: name, sourceSystem, targetSystem'
      });
    }

    const query = `
      INSERT INTO integration_data_mappers
        (org_id, integration_id, name, description, source_system, target_system, message_type, active, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await req.db.query(query, [
      orgId,
      integrationId,
      name,
      description,
      sourceSystem,
      targetSystem,
      messageType,
      active,
      userId || null,
      userId || null
    ]);

    const mapper = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: mapper.id,
        integrationId: mapper.integration_id,
        name: mapper.name,
        description: mapper.description,
        sourceSystem: mapper.source_system,
        targetSystem: mapper.target_system,
        messageType: mapper.message_type,
        active: mapper.active,
        createdAt: mapper.created_at
      }
    });
  } catch (error) {
    console.error('Error creating data mapper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create data mapper',
      details: error.message
    });
  }
});

// Update data mapper
router.put('/mappers/:mapperId', async (req, res) => {
  try {
    const { mapperId } = req.params;
    const orgId = req.headers['x-org-id'];
    const userId = req.userContext?.userId;

    if (!orgId) {
      return res.status(400).json({ error: 'x-org-id header is required' });
    }

    const { name, description, sourceSystem, targetSystem, messageType, active } = req.body;

    const query = `
      UPDATE integration_data_mappers
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        source_system = COALESCE($3, source_system),
        target_system = COALESCE($4, target_system),
        message_type = COALESCE($5, message_type),
        active = COALESCE($6, active),
        updated_by = $7
      WHERE id = $8 AND org_id = $9
      RETURNING *
    `;

    const result = await req.db.query(query, [
      name,
      description,
      sourceSystem,
      targetSystem,
      messageType,
      active,
      userId || null,
      mapperId,
      orgId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data mapper not found' });
    }

    const mapper = result.rows[0];

    res.json({
      success: true,
      data: {
        id: mapper.id,
        integrationId: mapper.integration_id,
        name: mapper.name,
        description: mapper.description,
        sourceSystem: mapper.source_system,
        targetSystem: mapper.target_system,
        messageType: mapper.message_type,
        active: mapper.active,
        updatedAt: mapper.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating data mapper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update data mapper',
      details: error.message
    });
  }
});

// Delete data mapper
router.delete('/mappers/:mapperId', async (req, res) => {
  try {
    const { mapperId } = req.params;
    const orgId = req.headers['x-org-id'];

    if (!orgId) {
      return res.status(400).json({ error: 'x-org-id header is required' });
    }

    const query = `
      DELETE FROM integration_data_mappers
      WHERE id = $1 AND org_id = $2
      RETURNING id
    `;

    const result = await req.db.query(query, [mapperId, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data mapper not found' });
    }

    res.json({ success: true, message: 'Data mapper deleted successfully' });
  } catch (error) {
    console.error('Error deleting data mapper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete data mapper',
      details: error.message
    });
  }
});

// ===== Field Mapping Operations =====

// Add field mapping to mapper
router.post('/mappers/:mapperId/fields', async (req, res) => {
  try {
    const { mapperId } = req.params;
    const {
      sourcePath,
      targetPath,
      transformType,
      transformConfig = {},
      required = false,
      defaultValue,
      validationRegex,
      sortOrder = 0,
      notes
    } = req.body;

    if (!sourcePath || !targetPath) {
      return res.status(400).json({
        error: 'Missing required fields: sourcePath, targetPath'
      });
    }

    const query = `
      INSERT INTO integration_field_mappings
        (mapper_id, source_path, target_path, transform_type, transform_config, required, default_value, validation_regex, sort_order, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await req.db.query(query, [
      mapperId,
      sourcePath,
      targetPath,
      transformType,
      JSON.stringify(transformConfig),
      required,
      defaultValue,
      validationRegex,
      sortOrder,
      notes
    ]);

    const field = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: field.id,
        mapperId: field.mapper_id,
        sourcePath: field.source_path,
        targetPath: field.target_path,
        transformType: field.transform_type,
        transformConfig: field.transform_config,
        required: field.required,
        defaultValue: field.default_value,
        validationRegex: field.validation_regex,
        sortOrder: field.sort_order,
        notes: field.notes
      }
    });
  } catch (error) {
    console.error('Error adding field mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add field mapping',
      details: error.message
    });
  }
});

// Update field mapping
router.put('/fields/:fieldId', async (req, res) => {
  try {
    const { fieldId } = req.params;
    const {
      sourcePath,
      targetPath,
      transformType,
      transformConfig,
      required,
      defaultValue,
      validationRegex,
      sortOrder,
      notes
    } = req.body;

    const query = `
      UPDATE integration_field_mappings
      SET
        source_path = COALESCE($1, source_path),
        target_path = COALESCE($2, target_path),
        transform_type = COALESCE($3, transform_type),
        transform_config = COALESCE($4, transform_config),
        required = COALESCE($5, required),
        default_value = COALESCE($6, default_value),
        validation_regex = COALESCE($7, validation_regex),
        sort_order = COALESCE($8, sort_order),
        notes = COALESCE($9, notes)
      WHERE id = $10
      RETURNING *
    `;

    const result = await req.db.query(query, [
      sourcePath,
      targetPath,
      transformType,
      transformConfig ? JSON.stringify(transformConfig) : null,
      required,
      defaultValue,
      validationRegex,
      sortOrder,
      notes,
      fieldId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Field mapping not found' });
    }

    const field = result.rows[0];

    res.json({
      success: true,
      data: {
        id: field.id,
        sourcePath: field.source_path,
        targetPath: field.target_path,
        transformType: field.transform_type,
        transformConfig: field.transform_config,
        required: field.required,
        defaultValue: field.default_value,
        validationRegex: field.validation_regex,
        sortOrder: field.sort_order,
        notes: field.notes
      }
    });
  } catch (error) {
    console.error('Error updating field mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update field mapping',
      details: error.message
    });
  }
});

// Delete field mapping
router.delete('/fields/:fieldId', async (req, res) => {
  try {
    const { fieldId } = req.params;

    const query = `DELETE FROM integration_field_mappings WHERE id = $1 RETURNING id`;
    const result = await req.db.query(query, [fieldId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Field mapping not found' });
    }

    res.json({ success: true, message: 'Field mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting field mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete field mapping',
      details: error.message
    });
  }
});

// ===== Value Lookup Operations =====

// Add value lookup
router.post('/mappers/:mapperId/lookups', async (req, res) => {
  try {
    const { mapperId } = req.params;
    const { fieldMappingId, lookupName, sourceValue, targetValue, description } = req.body;

    if (!lookupName || !sourceValue || !targetValue) {
      return res.status(400).json({
        error: 'Missing required fields: lookupName, sourceValue, targetValue'
      });
    }

    const query = `
      INSERT INTO integration_value_lookups
        (mapper_id, field_mapping_id, lookup_name, source_value, target_value, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await req.db.query(query, [
      mapperId,
      fieldMappingId || null,
      lookupName,
      sourceValue,
      targetValue,
      description
    ]);

    const lookup = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: lookup.id,
        mapperId: lookup.mapper_id,
        fieldMappingId: lookup.field_mapping_id,
        lookupName: lookup.lookup_name,
        sourceValue: lookup.source_value,
        targetValue: lookup.target_value,
        description: lookup.description
      }
    });
  } catch (error) {
    console.error('Error adding value lookup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add value lookup',
      details: error.message
    });
  }
});

// Delete value lookup
router.delete('/lookups/:lookupId', async (req, res) => {
  try {
    const { lookupId } = req.params;

    const query = `DELETE FROM integration_value_lookups WHERE id = $1 RETURNING id`;
    const result = await req.db.query(query, [lookupId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Value lookup not found' });
    }

    res.json({ success: true, message: 'Value lookup deleted successfully' });
  } catch (error) {
    console.error('Error deleting value lookup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete value lookup',
      details: error.message
    });
  }
});

// ===== Test Mapping Operations =====

// Test mapping with sample data
router.post('/mappers/:mapperId/test', async (req, res) => {
  try {
    const { mapperId } = req.params;
    const { sampleInput } = req.body;

    if (!sampleInput) {
      return res.status(400).json({ error: 'sampleInput is required' });
    }

    // Get mapper and field mappings
    const mapperQuery = `SELECT * FROM integration_data_mappers WHERE id = $1`;
    const mapperResult = await req.db.query(mapperQuery, [mapperId]);

    if (mapperResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data mapper not found' });
    }

    const fieldsQuery = `
      SELECT * FROM integration_field_mappings
      WHERE mapper_id = $1
      ORDER BY sort_order
    `;
    const fieldsResult = await req.db.query(fieldsQuery, [mapperId]);

    // Get integration to access handler
    const integrationQuery = `SELECT * FROM integrations WHERE id = $1`;
    const integrationResult = await req.db.query(integrationQuery, [mapperResult.rows[0].integration_id]);

    if (integrationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const integration = integrationResult.rows[0];

    // Apply mappings using integration handler
    if (global.integrationService) {
      const handler = global.integrationService.getHandler(integration.vendor_id);

      if (handler && handler.applyMapping) {
        const result = await handler.applyMapping(
          {
            ...integration,
            fieldMappings: fieldsResult.rows.map(f => ({
              sourcePath: f.source_path,
              targetPath: f.target_path,
              transformType: f.transform_type,
              transformConfig: f.transform_config
            }))
          },
          {
            sourceData: sampleInput,
            messageType: mapperResult.rows[0].message_type
          }
        );

        return res.json({
          success: true,
          data: {
            input: sampleInput,
            output: result,
            mapper: {
              id: mapperResult.rows[0].id,
              name: mapperResult.rows[0].name,
              messageType: mapperResult.rows[0].message_type
            }
          }
        });
      }
    }

    // Fallback: Return raw mapping info if handler not available
    res.json({
      success: true,
      message: 'Handler not available, returning mapping configuration',
      data: {
        input: sampleInput,
        mappings: fieldsResult.rows
      }
    });
  } catch (error) {
    console.error('Error testing mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test mapping',
      details: error.message
    });
  }
});

module.exports = router;
