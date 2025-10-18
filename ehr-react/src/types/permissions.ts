/**
 * Permission System Types
 * Frontend TypeScript definitions for the permission system
 */

// Permission Actions
export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  PRINT = 'print',
  SEND = 'send',
  EXPORT = 'export',
  IMPORT = 'import',
}

// Permission Resources
export enum PermissionResource {
  ORG = 'org',
  LOCATIONS = 'locations',
  DEPARTMENTS = 'departments',
  STAFF = 'staff',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  PATIENTS = 'patients',
  PATIENT_DEMOGRAPHICS = 'patient_demographics',
  PATIENT_DOCUMENTS = 'patient_documents',
  PATIENT_HISTORY = 'patient_history',
  APPOINTMENTS = 'appointments',
  ENCOUNTERS = 'encounters',
  OBSERVATIONS = 'observations',
  DIAGNOSES = 'diagnoses',
  PROCEDURES = 'procedures',
  MEDICATIONS = 'medications',
  ALLERGIES = 'allergies',
  IMMUNIZATIONS = 'immunizations',
  LAB_ORDERS = 'lab_orders',
  LAB_RESULTS = 'lab_results',
  IMAGING_ORDERS = 'imaging_orders',
  IMAGING_RESULTS = 'imaging_results',
  CLINICAL_NOTES = 'clinical_notes',
  PRESCRIPTIONS = 'prescriptions',
  REPORTS = 'reports',
  FORMS = 'forms',
  TEMPLATES = 'templates',
  BILLING = 'billing',
  INVOICES = 'invoices',
  PAYMENTS = 'payments',
  INSURANCE = 'insurance',
  CLAIMS = 'claims',
  AUDIT = 'audit',
  SETTINGS = 'settings',
  INTEGRATIONS = 'integrations',
  NOTIFICATIONS = 'notifications',
  PLATFORM = 'platform',
}

// Permission string type (e.g., "patients:read")
export type Permission = string | `${PermissionResource}:${PermissionAction}` | `${PermissionResource}:*` | '*:*';

// Role scope levels
export enum RoleScopeLevel {
  PLATFORM = 'PLATFORM',
  ORG = 'ORG',
  LOCATION = 'LOCATION',
  DEPARTMENT = 'DEPARTMENT',
}

// Assignment scope
export enum AssignmentScope {
  ORG = 'ORG',
  LOCATION = 'LOCATION',
  DEPARTMENT = 'DEPARTMENT',
}

// Role interface
export interface Role {
  id: string;
  key: string;
  name: string;
  description?: string;
  scope_level: RoleScopeLevel;
  permissions: Permission[];
  is_system: boolean;
  org_id?: string;
  parent_role_id?: string;
  parent_role_key?: string;
  parent_role_name?: string;
  is_modified?: boolean;
  created_at: string;
  updated_at: string;
}

// Role assignment interface
export interface RoleAssignment {
  id: string;
  user_id: string;
  org_id: string;
  role_id: string;
  role_key: string;
  role_name: string;
  permissions: Permission[];
  scope: AssignmentScope;
  location_id?: string;
  location_name?: string;
  department_id?: string;
  department_name?: string;
  assigned_at: string;
  expires_at?: string;
  is_system: boolean;
  parent_role_id?: string;
  is_modified?: boolean;
}

// Permission matrix structure for UI
export interface PermissionMatrixResource {
  label: string;
  actions: {
    [action: string]: {
      permission: Permission;
      label: string;
    };
  };
}

export interface PermissionMatrix {
  [resource: string]: PermissionMatrixResource;
}

// Feature permissions mapping
export interface FeaturePermissions {
  [feature: string]: Permission[];
}

// Permission check result
export interface PermissionCheckResult {
  hasPermission: boolean;
  feature?: string;
  requiredPermissions?: Permission[];
}

// Socket.IO permission change events
export interface PermissionChangeEvent {
  type: 'user_permission_change' | 'org_role_change';
  userId?: string;
  orgId?: string;
  changeData: {
    type: 'role_updated' | 'role_assigned' | 'role_revoked' | 'role_created' | 'role_deleted';
    roleId?: string;
    roleName?: string;
    roleKey?: string;
    permissions?: Permission[];
    scope?: AssignmentScope;
    locationId?: string;
    departmentId?: string;
    reason?: string;
  };
  timestamp: string;
}

// Permission context
export interface PermissionContext {
  permissions: Permission[];
  roles: RoleAssignment[];
  loading: boolean;
  error?: Error;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasFeature: (feature: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

// API response types
export interface RolesResponse {
  roles: Role[];
}

export interface RoleResponse {
  role: Role;
}

export interface RoleAssignmentsResponse {
  assignments: RoleAssignment[];
}

export interface PermissionsResponse {
  permissions: Permission[];
}

export interface PermissionMatrixResponse {
  matrix: PermissionMatrix;
}

export interface FeaturePermissionsResponse {
  featurePermissions: FeaturePermissions;
}

// Create/Update role DTOs
export interface CreateRoleDTO {
  key?: string;
  name: string;
  description?: string;
  scope_level: RoleScopeLevel;
  permissions: Permission[];
  parent_role_id?: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

export interface AssignRoleDTO {
  user_id: string;
  role_id: string;
  scope: AssignmentScope;
  location_id?: string;
  department_id?: string;
  expires_at?: string;
}

// Permission utilities
export class PermissionUtils {
  /**
   * Check if a user permission matches a required permission
   * Supports wildcard matching
   */
  static matchesPermission(userPermission: Permission, requiredPermission: Permission): boolean {
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
  static hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(required =>
      userPermissions.some(userPerm => this.matchesPermission(userPerm, required))
    );
  }

  /**
   * Check if user has all required permissions
   */
  static hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(required =>
      userPermissions.some(userPerm => this.matchesPermission(userPerm, required))
    );
  }

  /**
   * Format permission for display
   */
  static formatPermission(permission: Permission): string {
    const [resource, action] = permission.split(':');
    const resourceLabel = resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const actionLabel = action === '*' ? 'All Actions' : action.charAt(0).toUpperCase() + action.slice(1);
    return `${resourceLabel}: ${actionLabel}`;
  }

  /**
   * Group permissions by resource
   */
  static groupPermissionsByResource(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((acc, permission) => {
      const [resource] = permission.split(':');
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }
}
