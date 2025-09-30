const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { Pool } = require('pg');
const fhirRoutes = require('./routes/fhir');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 8000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123',
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'application/fhir+json']
}));
app.use(express.urlencoded({ extended: true }));


// Make database available to routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// FHIR R4 Base URL
const FHIR_BASE = '/fhir/R4';

// FHIR Capability Statement (Metadata)
app.get(`${FHIR_BASE}/metadata`, (req, res) => {
  const capabilityStatement = {
    resourceType: 'CapabilityStatement',
    id: 'ehr-connect-capability',
    url: 'http://localhost:8000/fhir/R4/metadata',
    version: '1.0.0',
    name: 'EHRConnectCapability',
    title: 'EHR Connect FHIR R4 Capability Statement',
    status: 'active',
    experimental: false,
    date: new Date().toISOString(),
    publisher: 'EHR Connect',
    description: 'FHIR R4 Capability Statement for EHR Connect',
    kind: 'instance',
    implementation: {
      description: 'EHR Connect FHIR R4 Server',
      url: 'http://localhost:8000/fhir/R4'
    },
    fhirVersion: '4.0.1',
    format: ['application/fhir+json', 'application/json'],
    rest: [{
      mode: 'server',
      security: {
        cors: true,
        description: 'CORS enabled for cross-origin requests'
      },
      resource: [
        {
          type: 'Patient',
          profile: 'http://hl7.org/fhir/StructureDefinition/Patient',
          interaction: [
            { code: 'create' },
            { code: 'read' },
            { code: 'update' },
            { code: 'delete' },
            { code: 'search-type' }
          ],
          searchParam: [
            { name: 'identifier', type: 'token' },
            { name: 'family', type: 'string' },
            { name: 'given', type: 'string' },
            { name: 'birthdate', type: 'date' },
            { name: 'gender', type: 'token' }
          ]
        },
        {
          type: 'Organization',
          profile: 'http://hl7.org/fhir/StructureDefinition/Organization',
          interaction: [
            { code: 'create' },
            { code: 'read' },
            { code: 'update' },
            { code: 'delete' },
            { code: 'search-type' }
          ],
          searchParam: [
            { name: 'identifier', type: 'token' },
            { name: 'name', type: 'string' },
            { name: 'type', type: 'token' }
          ]
        },
        {
          type: 'Practitioner',
          profile: 'http://hl7.org/fhir/StructureDefinition/Practitioner',
          interaction: [
            { code: 'create' },
            { code: 'read' },
            { code: 'update' },
            { code: 'delete' },
            { code: 'search-type' }
          ]
        }
      ]
    }]
  };

  res.setHeader('Content-Type', 'application/fhir+json');
  res.json(capabilityStatement);
});

// FHIR Routes
app.use(FHIR_BASE, fhirRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    fhir: '4.0.1'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    resourceType: 'OperationOutcome',
    issue: [{
      severity: 'error',
      code: 'not-found',
      details: {
        text: `Endpoint not found: ${req.originalUrl}`
      }
    }]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    resourceType: 'OperationOutcome',
    issue: [{
      severity: 'error',
      code: 'exception',
      details: {
        text: err.message || 'Internal server error'
      }
    }]
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase(pool);
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 FHIR R4 Server running on http://localhost:${PORT}`);
      console.log(`📋 Capability Statement: http://localhost:${PORT}/fhir/R4/metadata`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
