const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// FHIR R4 Resource handlers
const patientController = require('../controllers/patient');
const organizationController = require('../controllers/organization');
const practitionerController = require('../controllers/practitioner');

// Helper function to validate FHIR JSON structure
function validateFHIRResource(resourceType, resource) {
  if (!resource || typeof resource !== 'object') {
    throw new Error('Resource must be a valid JSON object');
  }
  
  if (!resource.resourceType) {
    throw new Error('Resource must have a resourceType field');
  }
  
  if (resource.resourceType !== resourceType) {
    throw new Error(`Resource type must be ${resourceType}, got ${resource.resourceType}`);
  }
  
  return true;
}

// Helper function to create FHIR Bundle for search results
function createBundle(resourceType, resources, total = null) {
  return {
    resourceType: 'Bundle',
    id: uuidv4(),
    meta: {
      lastUpdated: new Date().toISOString()
    },
    type: 'searchset',
    total: total !== null ? total : resources.length,
    entry: resources.map(resource => ({
      fullUrl: `http://localhost:8000/fhir/R4/${resourceType}/${resource.id}`,
      resource: resource
    }))
  };
}

// Generic FHIR resource routes
function createResourceRoutes(resourceType, controller) {
  // Search resources: GET /{ResourceType}
  router.get(`/${resourceType}`, async (req, res) => {
    try {
      const results = await controller.search(req.db, req.query);
      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(createBundle(resourceType, results));
    } catch (error) {
      console.error(`Error searching ${resourceType}:`, error);
      res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: error.message }
        }]
      });
    }
  });

  // Read resource: GET /{ResourceType}/{id}
  router.get(`/${resourceType}/:id`, async (req, res) => {
    try {
      const resource = await controller.read(req.db, req.params.id);
      if (!resource) {
        return res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            details: { text: `${resourceType} with id ${req.params.id} not found` }
          }]
        });
      }
      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(resource);
    } catch (error) {
      console.error(`Error reading ${resourceType}:`, error);
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          details: { text: error.message }
        }]
      });
    }
  });

  // Create resource: POST /{ResourceType}
  router.post(`/${resourceType}`, async (req, res) => {
    try {
      validateFHIRResource(resourceType, req.body);
      const createdResource = await controller.create(req.db, req.body);
      res.setHeader('Content-Type', 'application/fhir+json');
      res.status(201).json(createdResource);
    } catch (error) {
      console.error(`Error creating ${resourceType}:`, error);
      res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: error.message }
        }]
      });
    }
  });

  // Update resource: PUT /{ResourceType}/{id}
  router.put(`/${resourceType}/:id`, async (req, res) => {
    try {
      validateFHIRResource(resourceType, req.body);
      const updatedResource = await controller.update(req.db, req.params.id, req.body);
      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(updatedResource);
    } catch (error) {
      console.error(`Error updating ${resourceType}:`, error);
      res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: error.message }
        }]
      });
    }
  });

  // Delete resource: DELETE /{ResourceType}/{id}
  router.delete(`/${resourceType}/:id`, async (req, res) => {
    try {
      await controller.delete(req.db, req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting ${resourceType}:`, error);
      res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: error.message }
        }]
      });
    }
  });

  // History: GET /{ResourceType}/{id}/_history
  router.get(`/${resourceType}/:id/_history`, async (req, res) => {
    try {
      const history = await controller.history(req.db, req.params.id);
      res.setHeader('Content-Type', 'application/fhir+json');
      res.json({
        resourceType: 'Bundle',
        id: uuidv4(),
        meta: { lastUpdated: new Date().toISOString() },
        type: 'history',
        total: history.length,
        entry: history.map(resource => ({
          fullUrl: `http://localhost:8000/fhir/R4/${resourceType}/${resource.id}/_history/${resource.meta.versionId}`,
          resource: resource
        }))
      });
    } catch (error) {
      console.error(`Error getting ${resourceType} history:`, error);
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          details: { text: error.message }
        }]
      });
    }
  });
}

// Register resource routes
createResourceRoutes('Patient', patientController);
createResourceRoutes('Organization', organizationController);
createResourceRoutes('Practitioner', practitionerController);

// Generic resource operations for any resource type
router.get('/:resourceType', async (req, res) => {
  const { resourceType } = req.params;
  
  // If no specific controller, use generic search
  try {
    const query = `
      SELECT resource_data 
      FROM fhir_resources 
      WHERE resource_type = $1 AND deleted = FALSE
      ORDER BY last_updated DESC
      LIMIT $2
    `;
    
    const limit = parseInt(req.query._count) || 20;
    const { rows } = await req.db.query(query, [resourceType, limit]);
    
    const resources = rows.map(row => row.resource_data);
    res.setHeader('Content-Type', 'application/fhir+json');
    res.json(createBundle(resourceType, resources));
    
  } catch (error) {
    console.error(`Error with generic search for ${resourceType}:`, error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        details: { text: error.message }
      }]
    });
  }
});

// Generic POST for any resource type
router.post('/:resourceType', async (req, res) => {
  const { resourceType } = req.params;
  const resource = req.body;
  
  try {
    validateFHIRResource(resourceType, resource);
    
    // Generate ID if not provided
    const id = resource.id || uuidv4();
    const now = new Date().toISOString();
    
    // Build complete resource with metadata
    const completeResource = {
      ...resource,
      id,
      meta: {
        versionId: '1',
        lastUpdated: now
      }
    };
    
    // Store in database
    const query = `
      INSERT INTO fhir_resources (id, resource_type, resource_data, version_id, last_updated)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    await req.db.query(query, [
      id,
      resourceType,
      JSON.stringify(completeResource),
      1,
      now
    ]);
    
    res.setHeader('Content-Type', 'application/fhir+json');
    res.setHeader('Location', `${resourceType}/${id}`);
    res.status(201).json(completeResource);
    
  } catch (error) {
    console.error(`Error creating ${resourceType}:`, error);
    res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'invalid',
        details: { text: error.message }
      }]
    });
  }
});

// Generic GET for specific resource by ID
router.get('/:resourceType/:id', async (req, res) => {
  const { resourceType, id } = req.params;

  try {
    const query = `
      SELECT resource_data
      FROM fhir_resources
      WHERE resource_type = $1 AND id = $2 AND deleted = FALSE
    `;

    const { rows } = await req.db.query(query, [resourceType, id]);

    if (rows.length === 0) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: `${resourceType} with id ${id} not found` }
        }]
      });
    }

    res.setHeader('Content-Type', 'application/fhir+json');
    res.json(rows[0].resource_data);

  } catch (error) {
    console.error(`Error reading ${resourceType}:`, error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        details: { text: error.message }
      }]
    });
  }
});

// Generic PATCH for updating specific resource fields (JSON Patch)
router.patch('/:resourceType/:id', async (req, res) => {
  const { resourceType, id } = req.params;
  const patchOperations = req.body;

  try {
    // First, get the current resource
    const getQuery = `
      SELECT resource_data, version_id
      FROM fhir_resources
      WHERE resource_type = $1 AND id = $2 AND deleted = FALSE
    `;

    const { rows } = await req.db.query(getQuery, [resourceType, id]);

    if (rows.length === 0) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: `Endpoint not found: /fhir/R4/${resourceType}/${id}` }
        }]
      });
    }

    let resource = rows[0].resource_data;
    const currentVersion = rows[0].version_id;

    // Apply JSON Patch operations
    if (!Array.isArray(patchOperations)) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: 'PATCH body must be an array of JSON Patch operations' }
        }]
      });
    }

    // Simple JSON Patch implementation supporting 'replace' operations
    for (const operation of patchOperations) {
      if (operation.op === 'replace') {
        const pathParts = operation.path.split('/').filter(p => p);

        // Navigate to the target property
        let target = resource;
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) {
            target[pathParts[i]] = {};
          }
          target = target[pathParts[i]];
        }

        // Set the value
        const finalKey = pathParts[pathParts.length - 1];
        target[finalKey] = operation.value;
      } else if (operation.op === 'add') {
        const pathParts = operation.path.split('/').filter(p => p);
        let target = resource;
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) {
            target[pathParts[i]] = {};
          }
          target = target[pathParts[i]];
        }
        const finalKey = pathParts[pathParts.length - 1];
        target[finalKey] = operation.value;
      } else if (operation.op === 'remove') {
        const pathParts = operation.path.split('/').filter(p => p);
        let target = resource;
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) {
            return res.status(400).json({
              resourceType: 'OperationOutcome',
              issue: [{
                severity: 'error',
                code: 'invalid',
                details: { text: `Path ${operation.path} not found in resource` }
              }]
            });
          }
          target = target[pathParts[i]];
        }
        const finalKey = pathParts[pathParts.length - 1];
        delete target[finalKey];
      }
    }

    // Update metadata
    const newVersion = currentVersion + 1;
    const now = new Date().toISOString();
    resource.meta = {
      ...resource.meta,
      versionId: String(newVersion),
      lastUpdated: now
    };

    // Update in database
    const updateQuery = `
      UPDATE fhir_resources
      SET resource_data = $1, version_id = $2, last_updated = $3
      WHERE resource_type = $4 AND id = $5
      RETURNING *
    `;

    await req.db.query(updateQuery, [
      JSON.stringify(resource),
      newVersion,
      now,
      resourceType,
      id
    ]);

    res.setHeader('Content-Type', 'application/fhir+json');
    res.json(resource);

  } catch (error) {
    console.error(`Error patching ${resourceType}:`, error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        details: { text: error.message }
      }]
    });
  }
});

// FHIR Batch/Transaction operations
router.post('/', async (req, res) => {
  const bundle = req.body;
  
  if (!bundle || bundle.resourceType !== 'Bundle') {
    return res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'invalid',
        details: { text: 'Request must be a valid FHIR Bundle' }
      }]
    });
  }
  
  // Simple batch processing (transaction support can be added later)
  const responseEntries = [];
  
  try {
    for (const entry of bundle.entry || []) {
      const { request, resource } = entry;
      
      if (request && request.method === 'POST' && resource) {
        // Handle POST requests in batch
        const resourceType = resource.resourceType;
        
        try {
          const createdResource = await require(`../controllers/${resourceType.toLowerCase()}`).create(req.db, resource);
          responseEntries.push({
            response: {
              status: '201 Created',
              location: `${resourceType}/${createdResource.id}/_history/1`
            },
            resource: createdResource
          });
        } catch (error) {
          responseEntries.push({
            response: {
              status: '400 Bad Request'
            },
            outcome: {
              resourceType: 'OperationOutcome',
              issue: [{
                severity: 'error',
                code: 'invalid',
                details: { text: error.message }
              }]
            }
          });
        }
      }
    }
    
    res.setHeader('Content-Type', 'application/fhir+json');
    res.json({
      resourceType: 'Bundle',
      id: uuidv4(),
      meta: { lastUpdated: new Date().toISOString() },
      type: bundle.type === 'transaction' ? 'transaction-response' : 'batch-response',
      entry: responseEntries
    });
    
  } catch (error) {
    console.error('Error processing bundle:', error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        details: { text: error.message }
      }]
    });
  }
});

module.exports = router;
