/**
 * Permission System Constants
 *
 * Permission Format: "resource:action"
 * Resources: patients, appointments, encounters, observations, etc.
 * Actions: read, write, create, edit, delete, submit, approve, print, send
 *
 * Wildcard Support:
 * - patients:* (all actions on patients)
 * - *:read (read on all resources)
 * - *:* (all permissions)
 */

// Permission Actions - Granular operations
const PERMISSION_ACTIONS = {
  READ: 'read',           // View/read data
  WRITE: 'write',         // Generic write (includes create/edit)
  CREATE: 'create',       // Create new records
  EDIT: 'edit',           // Modify existing records
  DELETE: 'delete',       // Delete records
  SUBMIT: 'submit',       // Submit for review/processing
  APPROVE: 'approve',     // Approve submitted items
  REJECT: 'reject',       // Reject submitted items
  PRINT: 'print',         // Print documents
  SEND: 'send',           // Send/share documents
  EXPORT: 'export',       // Export data
  IMPORT: 'import',       // Import data
};

// Permission Resources - System modules/features
const PERMISSION_RESOURCES = {
  // Core Organization
  ORG: 'org',
  LOCATIONS: 'locations',
  DEPARTMENTS: 'departments',
  STAFF: 'staff',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',

  // Patient Management
  PATIENTS: 'patients',
  PATIENT_DEMOGRAPHICS: 'patient_demographics',
  PATIENT_DOCUMENTS: 'patient_documents',
  PATIENT_HISTORY: 'patient_history',

  // Clinical
  APPOINTMENTS: 'appointments',
  ENCOUNTERS: 'encounters',
  OBSERVATIONS: 'observations',
  DIAGNOSES: 'diagnoses',
  PROCEDURES: 'procedures',
  MEDICATIONS: 'medications',
  ALLERGIES: 'allergies',
  IMMUNIZATIONS: 'immunizations',
  LAB_ORDERS: 'lab_orders',
  LAB_RESULTS: 'lab_results',
  IMAGING_ORDERS: 'imaging_orders',
  IMAGING_RESULTS: 'imaging_results',

  // Documentation
  CLINICAL_NOTES: 'clinical_notes',
  PRESCRIPTIONS: 'prescriptions',
  REPORTS: 'reports',
  FORMS: 'forms',
  TEMPLATES: 'templates',

  // Billing & Finance
  BILLING: 'billing',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  INSURANCE: 'insurance',
  CLAIMS: 'claims',

  // System & Admin
  AUDIT: 'audit',
  SETTINGS: 'settings',
  INTEGRATIONS: 'integrations',
  NOTIFICATIONS: 'notifications',

  // Platform (Super Admin)
  PLATFORM: 'platform',
};

// Pre-defined permission groups for common combinations
const PERMISSION_GROUPS = {
  // Resource-specific full access
  PATIENTS_FULL: [
    'patients:read',
    'patients:write',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'patients:print',
    'patients:send',
    'patients:export',
  ],

  PATIENTS_CLINICAL: [
    'patients:read',
    'patients:write',
    'patients:create',
    'patients:edit',
    'encounters:*',
    'observations:*',
    'diagnoses:*',
    'procedures:*',
    'medications:*',
    'allergies:*',
    'clinical_notes:*',
    'prescriptions:*',
  ],

  APPOINTMENTS_FULL: [
    'appointments:read',
    'appointments:create',
    'appointments:edit',
    'appointments:delete',
    'appointments:send',
  ],

  BILLING_FULL: [
    'billing:read',
    'billing:create',
    'billing:edit',
    'invoices:*',
    'payments:*',
    'insurance:read',
    'claims:*',
  ],

  REPORTS_VIEW: [
    'reports:read',
    'reports:print',
    'reports:export',
    'audit:read',
  ],

  ADMIN_ORG: [
    'org:read',
    'org:edit',
    'locations:*',
    'departments:*',
    'staff:*',
    'roles:*',
    'permissions:read',
    'settings:*',
    'audit:read',
  ],

  ADMIN_FULL: [
    'org:*',
    'locations:*',
    'departments:*',
    'staff:*',
    'roles:*',
    'permissions:*',
    'settings:*',
    'audit:*',
    'integrations:*',
  ],
};

// Feature-to-permission mapping (for UI components)
const FEATURE_PERMISSIONS = {
  // Dashboard
  'dashboard.overview': ['org:read'],
  'dashboard.analytics': ['reports:read'],
  'dashboard.patients': ['patients:read'],

  // Patient Management
  'patients.list': ['patients:read'],
  'patients.view': ['patients:read'],
  'patients.create': ['patients:create'],
  'patients.edit': ['patients:edit'],
  'patients.delete': ['patients:delete'],
  'patients.export': ['patients:export'],
  'patients.print': ['patients:print'],

  // Appointments
  'appointments.list': ['appointments:read'],
  'appointments.view': ['appointments:read'],
  'appointments.create': ['appointments:create'],
  'appointments.edit': ['appointments:edit'],
  'appointments.cancel': ['appointments:delete'],
  'appointments.reschedule': ['appointments:edit'],

  // Clinical
  'encounters.create': ['encounters:create'],
  'encounters.edit': ['encounters:edit'],
  'encounters.view': ['encounters:read'],
  'encounters.close': ['encounters:submit'],
  'prescriptions.create': ['prescriptions:create'],
  'prescriptions.print': ['prescriptions:print'],
  'prescriptions.send': ['prescriptions:send'],

  // Lab & Imaging
  'lab_orders.create': ['lab_orders:create'],
  'lab_orders.view': ['lab_orders:read'],
  'lab_results.view': ['lab_results:read'],
  'lab_results.approve': ['lab_results:approve'],
  'imaging_orders.create': ['imaging_orders:create'],
  'imaging_results.view': ['imaging_results:read'],

  // Reports
  'reports.view': ['reports:read'],
  'reports.print': ['reports:print'],
  'reports.export': ['reports:export'],

  // Billing
  'billing.view': ['billing:read'],
  'billing.create': ['billing:create'],
  'invoices.create': ['invoices:create'],
  'invoices.edit': ['invoices:edit'],
  'payments.record': ['payments:create'],

  // Admin
  'settings.view': ['settings:read'],
  'settings.edit': ['settings:edit'],
  'staff.manage': ['staff:read', 'staff:create', 'staff:edit'],
  'roles.manage': ['roles:read', 'roles:create', 'roles:edit'],
  'audit.view': ['audit:read'],
};

// Default system role definitions with permissions
const DEFAULT_SYSTEM_ROLES = {
  PLATFORM_ADMIN: {
    key: 'PLATFORM_ADMIN',
    name: 'Platform Administrator',
    description: 'Nirmitee super-admin with full platform access',
    scope_level: 'PLATFORM',
    permissions: ['platform:*'],
    is_system: true,
  },

  ORG_OWNER: {
    key: 'ORG_OWNER',
    name: 'Organization Owner',
    description: 'Full organization control',
    scope_level: 'ORG',
    permissions: [
      'org:*',
      'locations:*',
      'departments:*',
      'staff:*',
      'roles:*',
      'permissions:*',
      'settings:*',
      'patients:*',
      'appointments:*',
      'encounters:*',
      'billing:*',
      'reports:*',
      'audit:*',
    ],
    is_system: true,
  },

  ORG_ADMIN: {
    key: 'ORG_ADMIN',
    name: 'Organization Administrator',
    description: 'Manage organization settings and staff',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'org:edit',
      'locations:*',
      'departments:*',
      'staff:*',
      'roles:read',
      'roles:edit',
      'settings:*',
      'patients:read',
      'appointments:read',
      'reports:read',
      'audit:read',
    ],
    is_system: true,
  },

  CLINICIAN: {
    key: 'CLINICIAN',
    name: 'Clinician',
    description: 'Full clinical workflow access',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:create',
      'patients:edit',
      'appointments:read',
      'appointments:edit',
      'encounters:*',
      'observations:*',
      'diagnoses:*',
      'procedures:*',
      'medications:*',
      'allergies:*',
      'immunizations:*',
      'clinical_notes:*',
      'prescriptions:*',
      'lab_orders:*',
      'lab_results:read',
      'imaging_orders:*',
      'imaging_results:read',
      'reports:read',
      'reports:print',
    ],
    is_system: true,
  },

  NURSE: {
    key: 'NURSE',
    name: 'Nurse',
    description: 'Patient care and vitals management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'appointments:read',
      'encounters:read',
      'encounters:edit',
      'observations:*',
      'medications:read',
      'medications:submit',
      'allergies:read',
      'clinical_notes:read',
      'clinical_notes:create',
      'lab_results:read',
      'imaging_results:read',
    ],
    is_system: true,
  },

  FRONT_DESK: {
    key: 'FRONT_DESK',
    name: 'Front Desk',
    description: 'Patient registration and appointment management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:create',
      'patients:edit',
      'patient_demographics:*',
      'appointments:*',
      'billing:read',
      'billing:create',
      'payments:read',
      'payments:create',
    ],
    is_system: true,
  },

  LAB_TECHNICIAN: {
    key: 'LAB_TECHNICIAN',
    name: 'Lab Technician',
    description: 'Laboratory order and result management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'lab_orders:read',
      'lab_results:create',
      'lab_results:edit',
      'lab_results:submit',
    ],
    is_system: true,
  },

  PHARMACIST: {
    key: 'PHARMACIST',
    name: 'Pharmacist',
    description: 'Medication and prescription management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'prescriptions:read',
      'prescriptions:approve',
      'prescriptions:reject',
      'medications:read',
      'allergies:read',
    ],
    is_system: true,
  },

  BILLING_CLERK: {
    key: 'BILLING_CLERK',
    name: 'Billing Clerk',
    description: 'Billing and payment management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'appointments:read',
      'billing:*',
      'invoices:*',
      'payments:*',
      'insurance:read',
      'claims:create',
      'claims:edit',
      'claims:submit',
    ],
    is_system: true,
  },

  AUDITOR: {
    key: 'AUDITOR',
    name: 'Auditor',
    description: 'Read-only access for compliance and auditing',
    scope_level: 'ORG',
    permissions: [
      'audit:read',
      'org:read',
      'locations:read',
      'staff:read',
      'patients:read',
      'encounters:read',
      'billing:read',
      'reports:read',
      'reports:export',
    ],
    is_system: true,
  },

  VIEWER: {
    key: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access to basic information',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'appointments:read',
      'encounters:read',
      'reports:read',
    ],
    is_system: true,
  },

  // Patient Access Roles
  PATIENT: {
    key: 'PATIENT',
    name: 'Patient',
    description: 'Patient self-service access',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'patient_demographics:edit',
      'patient_documents:read',
      'patient_history:read',
      'appointments:read',
      'appointments:create',
      'appointments:edit',
      'encounters:read',
      'observations:read',
      'observations:create',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'allergies:read',
      'allergies:edit',
      'immunizations:read',
      'lab_results:read',
      'imaging_results:read',
      'prescriptions:read',
      'reports:read',
      'reports:print',
      'billing:read',
      'invoices:read',
      'payments:create',
      'notifications:read',
    ],
    is_system: true,
  },

  CAREGIVER: {
    key: 'CAREGIVER',
    name: 'Caregiver',
    description: 'Proxy access for dependent care',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'patient_demographics:edit',
      'patient_history:read',
      'appointments:read',
      'appointments:create',
      'appointments:edit',
      'encounters:read',
      'observations:read',
      'observations:create',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'allergies:read',
      'allergies:edit',
      'immunizations:read',
      'lab_results:read',
      'imaging_results:read',
      'prescriptions:read',
      'reports:read',
      'reports:print',
      'billing:read',
      'invoices:read',
      'payments:create',
      'notifications:read',
      'forms:read',
      'forms:create',
    ],
    is_system: true,
  },

  // Care Team Coordinators
  CASE_MANAGER: {
    key: 'CASE_MANAGER',
    name: 'Case Manager',
    description: 'Complex care management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:edit',
      'patient_demographics:read',
      'patient_history:read',
      'patient_history:edit',
      'appointments:read',
      'appointments:create',
      'appointments:edit',
      'encounters:read',
      'encounters:create',
      'encounters:edit',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'allergies:read',
      'immunizations:read',
      'clinical_notes:read',
      'clinical_notes:create',
      'clinical_notes:edit',
      'prescriptions:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'reports:read',
      'reports:create',
      'reports:print',
      'reports:send',
      'forms:*',
      'templates:read',
      'notifications:create',
      'notifications:send',
    ],
    is_system: true,
  },

  SOCIAL_WORKER: {
    key: 'SOCIAL_WORKER',
    name: 'Social Worker',
    description: 'Community resources and support services',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:edit',
      'patient_demographics:read',
      'patient_demographics:edit',
      'patient_history:read',
      'appointments:read',
      'appointments:create',
      'encounters:read',
      'encounters:create',
      'observations:read',
      'diagnoses:read',
      'clinical_notes:read',
      'clinical_notes:create',
      'clinical_notes:edit',
      'reports:read',
      'reports:create',
      'reports:print',
      'billing:read',
      'insurance:read',
      'insurance:edit',
      'forms:*',
      'notifications:create',
      'notifications:send',
    ],
    is_system: true,
  },

  CARE_COORDINATOR: {
    key: 'CARE_COORDINATOR',
    name: 'Care Coordinator',
    description: 'Longitudinal care planning and transitions',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:edit',
      'patient_demographics:read',
      'patient_history:read',
      'patient_history:edit',
      'appointments:*',
      'encounters:read',
      'encounters:create',
      'encounters:edit',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'allergies:read',
      'immunizations:read',
      'clinical_notes:read',
      'clinical_notes:create',
      'clinical_notes:edit',
      'prescriptions:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'reports:*',
      'forms:*',
      'templates:read',
      'notifications:*',
    ],
    is_system: true,
  },

  // Additional Provider Roles
  THERAPIST: {
    key: 'THERAPIST',
    name: 'Therapist',
    description: 'Physical, occupational, speech, behavioral therapy',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'patient_history:read',
      'appointments:read',
      'appointments:edit',
      'encounters:read',
      'encounters:create',
      'encounters:edit',
      'observations:*',
      'diagnoses:read',
      'procedures:read',
      'procedures:create',
      'procedures:edit',
      'medications:read',
      'allergies:read',
      'clinical_notes:*',
      'reports:read',
      'reports:create',
      'reports:print',
      'reports:send',
      'forms:*',
    ],
    is_system: true,
  },

  ALLIED_HEALTH: {
    key: 'ALLIED_HEALTH',
    name: 'Allied Health Professional',
    description: 'Dietitians, respiratory therapists, technicians',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'patient_history:read',
      'appointments:read',
      'encounters:read',
      'encounters:edit',
      'observations:*',
      'diagnoses:read',
      'procedures:read',
      'procedures:create',
      'medications:read',
      'allergies:read',
      'immunizations:read',
      'clinical_notes:read',
      'clinical_notes:create',
      'clinical_notes:edit',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'reports:read',
      'reports:print',
      'forms:read',
      'forms:create',
    ],
    is_system: true,
  },

  // Additional Administrative Staff
  SCHEDULER: {
    key: 'SCHEDULER',
    name: 'Scheduler',
    description: 'Appointment scheduling and calendar management',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:create',
      'patient_demographics:read',
      'patient_demographics:edit',
      'appointments:*',
      'staff:read',
      'locations:read',
      'departments:read',
      'reports:read',
      'notifications:create',
      'notifications:send',
    ],
    is_system: true,
  },

  MEDICAL_CODER: {
    key: 'MEDICAL_CODER',
    name: 'Medical Coder',
    description: 'Coding and billing compliance',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patient_demographics:read',
      'appointments:read',
      'encounters:read',
      'diagnoses:read',
      'diagnoses:edit',
      'procedures:read',
      'procedures:edit',
      'clinical_notes:read',
      'billing:read',
      'billing:edit',
      'invoices:read',
      'invoices:edit',
      'claims:create',
      'claims:edit',
      'claims:submit',
      'reports:read',
      'reports:export',
      'audit:read',
    ],
    is_system: true,
  },

  // Operational Leadership
  NURSING_DIRECTOR: {
    key: 'NURSING_DIRECTOR',
    name: 'Nursing Director',
    description: 'Nursing operations oversight',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'locations:read',
      'departments:read',
      'staff:read',
      'staff:edit',
      'patients:read',
      'appointments:read',
      'encounters:read',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'clinical_notes:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'reports:*',
      'audit:read',
      'settings:read',
      'notifications:read',
    ],
    is_system: true,
  },

  CLINIC_MANAGER: {
    key: 'CLINIC_MANAGER',
    name: 'Clinic Manager',
    description: 'Clinical operations management',
    scope_level: 'LOCATION',
    permissions: [
      'org:read',
      'locations:read',
      'locations:edit',
      'departments:*',
      'staff:*',
      'roles:read',
      'patients:read',
      'appointments:read',
      'encounters:read',
      'billing:read',
      'invoices:read',
      'payments:read',
      'reports:*',
      'settings:read',
      'settings:edit',
      'audit:read',
      'notifications:*',
    ],
    is_system: true,
  },

  COO: {
    key: 'COO',
    name: 'Chief Operating Officer',
    description: 'Executive operational oversight',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'org:edit',
      'locations:*',
      'departments:*',
      'staff:read',
      'staff:edit',
      'roles:read',
      'patients:read',
      'appointments:read',
      'encounters:read',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'billing:read',
      'invoices:read',
      'payments:read',
      'claims:read',
      'reports:*',
      'settings:read',
      'settings:edit',
      'audit:*',
      'integrations:read',
      'notifications:read',
    ],
    is_system: true,
  },

  // IT & Integration Teams
  IT_ADMIN: {
    key: 'IT_ADMIN',
    name: 'IT Administrator',
    description: 'System administration and technical support',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'locations:*',
      'departments:*',
      'staff:*',
      'roles:*',
      'permissions:*',
      'settings:*',
      'integrations:*',
      'audit:*',
      'notifications:*',
      'patients:read',
      'reports:read',
      'reports:export',
    ],
    is_system: true,
  },

  INTEGRATION_SPECIALIST: {
    key: 'INTEGRATION_SPECIALIST',
    name: 'Integration Specialist',
    description: 'EHR integrations and data exchange',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'locations:read',
      'settings:read',
      'settings:edit',
      'integrations:*',
      'patients:read',
      'patients:export',
      'appointments:export',
      'encounters:export',
      'observations:export',
      'lab_orders:export',
      'lab_results:export',
      'imaging_orders:export',
      'imaging_results:export',
      'audit:read',
      'reports:read',
      'reports:export',
    ],
    is_system: true,
  },

  // Research & Analytics
  RESEARCHER: {
    key: 'RESEARCHER',
    name: 'Researcher',
    description: 'Research and clinical trials data access',
    scope_level: 'ORG',
    permissions: [
      'patients:read',
      'patients:export',
      'patient_demographics:read',
      'appointments:read',
      'encounters:read',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'allergies:read',
      'immunizations:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'reports:read',
      'reports:export',
    ],
    is_system: true,
  },

  POPULATION_HEALTH_ANALYST: {
    key: 'POPULATION_HEALTH_ANALYST',
    name: 'Population Health Analyst',
    description: 'Population health analytics and registries',
    scope_level: 'ORG',
    permissions: [
      'org:read',
      'locations:read',
      'patients:read',
      'patients:export',
      'patient_demographics:read',
      'appointments:read',
      'encounters:read',
      'observations:read',
      'diagnoses:read',
      'procedures:read',
      'medications:read',
      'allergies:read',
      'immunizations:read',
      'lab_orders:read',
      'lab_results:read',
      'imaging_orders:read',
      'imaging_results:read',
      'billing:read',
      'reports:*',
      'audit:read',
    ],
    is_system: true,
  },
};

/**
 * Check if a user permission matches a required permission
 * Supports wildcard matching
 */
function matchesPermission(userPermission, requiredPermission) {
  if (userPermission === '*:*') return true;

  const [userResource, userAction] = userPermission.split(':');
  const [reqResource, reqAction] = requiredPermission.split(':');

  const resourceMatch = userResource === '*' || userResource === reqResource;
  const actionMatch = userAction === '*' || userAction === reqAction;

  return resourceMatch && actionMatch;
}

/**
 * Check if user has any of the required permissions
 */
function hasAnyPermission(userPermissions, requiredPermissions) {
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }

  return requiredPermissions.some(required =>
    userPermissions.some(userPerm => matchesPermission(userPerm, required))
  );
}

/**
 * Check if user has all required permissions
 */
function hasAllPermissions(userPermissions, requiredPermissions) {
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }

  return requiredPermissions.every(required =>
    userPermissions.some(userPerm => matchesPermission(userPerm, required))
  );
}

/**
 * Get permission matrix structure for UI
 * Groups permissions by resource for matrix display
 */
function getPermissionMatrix() {
  const matrix = {};

  Object.values(PERMISSION_RESOURCES).forEach(resource => {
    if (resource === 'platform') return; // Skip platform resource

    matrix[resource] = {
      label: resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      actions: Object.values(PERMISSION_ACTIONS).reduce((acc, action) => {
        acc[action] = {
          permission: `${resource}:${action}`,
          label: action.charAt(0).toUpperCase() + action.slice(1),
        };
        return acc;
      }, {}),
    };
  });

  return matrix;
}

module.exports = {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PERMISSION_GROUPS,
  FEATURE_PERMISSIONS,
  DEFAULT_SYSTEM_ROLES,
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionMatrix,
};
