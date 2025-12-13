const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const { Pool } = require('pg');
const fhirRoutes = require('./routes/fhir');
const publicRoutes = require('./routes/public');
const organizationRoutes = require('./routes/organizations');
const invitationRoutes = require('./routes/invitations');
const rbacRoutes = require('./routes/rbac');
const rbacEnhancedRoutes = require('./routes/rbac.enhanced');
const authRoutes = require('./routes/auth');
const mfaRoutes = require('./routes/mfa');
const sessionsRoutes = require('./routes/sessions');
const notificationSettingsRoutes = require('./routes/notification-settings');
const rolesRoutes = require('./routes/roles');
const teamRoutes = require('./routes/team');
const userRoutes = require('./routes/users');
const userDataRoutes = require('./routes/user-data');
const onboardingRoutes = require('./routes/onboarding');
const billingRoutes = require('./routes/billing');
const inventoryRoutes = require('./routes/inventory');
const inventoryMastersRoutes = require('./routes/inventory-masters');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');
const integrationsRoutes = require('./routes/integrations');
const bedManagementRoutes = require('./routes/bed-management');
const dataMapperRoutes = require('./routes/data-mapper');
const notificationRoutes = require('./routes/notifications');
const virtualMeetingsRoutes = require('./routes/virtual-meetings.routes');
const patientPortalRoutes = require('./routes/patient-portal');
const specialtyRoutes = require('./routes/specialties');
const countryRoutes = require('./routes/countries');
const translationRoutes = require('./routes/translations');
const initializeEpisodeRoutes = require('./routes/episodes');
const formsRoutes = require('./routes/forms');
const tasksRoutes = require('./routes/tasks');
const taskRulesRoutes = require('./routes/task-rules');
const ruleVariablesRoutes = require('./routes/rule-variables');
const rulesRoutes = require('./routes/rules');
const { initializeDatabase } = require('./database/init');
const socketService = require('./services/socket.service');
const billingJobs = require('./services/billing.jobs');
const auditLogger = require('./middleware/audit-logger');
const IntegrationService = require('./services/integration.service');
const { registerAllHandlers } = require('./integrations');

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

// CORS configuration - Allow specific origins with credentials
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ehr-dev.nirmitee.io',
  'https://api-dev.nirmitee.io',
  'https://ehr-staging.nirmitee.io',
  'https://api-staging.nirmitee.io',
  'https://ehr.nirmitee.io',
  'https://api.nirmitee.io',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'User-Agent',
    'Referer',
    // Custom app headers
    'x-org-id',
    'x-org-slug',
    'x-user-id',
    'x-user-roles',
    'x-location-id',
    'x-location-ids',
    'x-department-id',
    'x-request-id',
    'x-practitioner-id',
    'x-patient-id',
    'x-session-token', // Patient portal session token
    // Medplum specific headers
    'x-medplum',
    'x-trace-id',
    'x-correlation-id',
    'cache-control',
    'if-match',
    'if-none-match',
    'if-modified-since',
    'if-none-exist',
    'prefer',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'ETag', 'Last-Modified', 'Location']
}));
app.use(express.json({
  limit: '10mb',
  type: ['application/json', 'application/fhir+json', 'application/json-patch+json']
}));
app.use(express.urlencoded({ extended: true }));

// Audit logging middleware (must be registered after body parsers)
app.use(auditLogger());


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

// Public API Routes (No authentication required)
app.use('/api/public', publicRoutes);

// Multi-Tenant RBAC Routes
app.use('/api/orgs', organizationRoutes);
app.use('/api/orgs', userRoutes);
app.use('/api/orgs', onboardingRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/rbac/v2', rbacEnhancedRoutes); // Enhanced RBAC with permission matrix (must be before /api/rbac)
app.use('/api/rbac', rbacRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/user', userDataRoutes); // Separate endpoints for user data with Redis caching
app.use('/api/billing', billingRoutes);
app.use('/api/inventory/masters', inventoryMastersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orgs/:orgId/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/bed-management', bedManagementRoutes);
app.use('/api/data-mapper', dataMapperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/virtual-meetings', virtualMeetingsRoutes);
app.use('/api/patient-portal', patientPortalRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api', initializeEpisodeRoutes(dbPool)); // Episode routes (FHIR EpisodeOfCare)
app.use('/api/forms', formsRoutes); // Forms/Questionnaire Builder routes
app.use('/api/tasks', tasksRoutes); // Task Management System routes
app.use('/api/task-rules', taskRulesRoutes); // Task Assignment Rules routes
app.use('/api/rule-variables', ruleVariablesRoutes); // Rule Variables (aggregates, formulas) routes
app.use('/api/rules', rulesRoutes); // Universal Rule Engine routes

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

    // Initialize integration handlers
    const integrationService = new IntegrationService();
    registerAllHandlers(integrationService);
    console.log('✅ Integration handlers initialized');

    // Make integrationService globally available
    global.integrationService = integrationService;

    httpServer.listen(PORT, () => {
      console.log(`🚀 FHIR R4 Server running on http://localhost:${PORT}`);
      console.log(`📋 Capability Statement: http://localhost:${PORT}/fhir/R4/metadata`);
      console.log(`🔌 Socket.IO ready for real-time permission updates`);
      console.log(`💰 Billing jobs running for claim sync and ERA processing`);
      console.log(`🔗 Integration system ready with Epic, Stripe handlers`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
