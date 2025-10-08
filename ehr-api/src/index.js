const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const { Pool } = require('pg');
const fhirRoutes = require('./routes/fhir');
const organizationRoutes = require('./routes/organizations');
const invitationRoutes = require('./routes/invitations');
const rbacRoutes = require('./routes/rbac');
const rbacEnhancedRoutes = require('./routes/rbac.enhanced');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const onboardingRoutes = require('./routes/onboarding');
const billingRoutes = require('./routes/billing');
const { initializeDatabase } = require('./database/init');
const socketService = require('./services/socket.service');
const billingJobs = require('./services/billing.jobs');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 8000;

// Database connection (using the connection pool from connection.js)
const { pool: dbPool } = require('./database/connection');

// Test database connection
dbPool.connect()
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
  req.db = dbPool;
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

// Multi-Tenant RBAC Routes
app.use('/api/orgs', organizationRoutes);
app.use('/api/orgs', userRoutes);
app.use('/api/orgs', onboardingRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/rbac/v2', rbacEnhancedRoutes); // Enhanced RBAC with permission matrix
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);

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
    await initializeDatabase(dbPool);
    console.log('✅ Database initialized successfully');

    // Initialize Socket.IO for real-time permission updates
    socketService.initialize(httpServer);
    console.log('✅ Socket.IO initialized for real-time updates');

    // Initialize billing background jobs
    billingJobs.initialize();

    httpServer.listen(PORT, () => {
      console.log(`🚀 FHIR R4 Server running on http://localhost:${PORT}`);
      console.log(`📋 Capability Statement: http://localhost:${PORT}/fhir/R4/metadata`);
      console.log(`🔌 Socket.IO ready for real-time permission updates`);
      console.log(`💰 Billing jobs running for claim sync and ERA processing`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
