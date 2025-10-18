// RBAC Types for EHR Connect
export interface Permission {
  id: string
  name: string
  description: string
  resource: string // e.g., 'users', 'patients', 'appointments'
  action: string   // e.g., 'create', 'read', 'update', 'delete'
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem?: boolean // System roles cannot be deleted
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  roles: Role[]
  createdAt: string
  updatedAt?: string
  lastLogin?: string
}

// Permission constants for the EHR system
export const PERMISSIONS = {
  // User Management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Role Management
  ROLES_CREATE: 'roles:create',
  ROLES_READ: 'roles:read',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  
  // Patient Management
  PATIENTS_CREATE: 'patients:create',
  PATIENTS_READ: 'patients:read',
  PATIENTS_UPDATE: 'patients:update',
  PATIENTS_DELETE: 'patients:delete',
  
  // Practitioner Management
  PRACTITIONERS_CREATE: 'practitioners:create',
  PRACTITIONERS_READ: 'practitioners:read',
  PRACTITIONERS_UPDATE: 'practitioners:update',
  PRACTITIONERS_DELETE: 'practitioners:delete',
  
  // Appointment Management
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_UPDATE: 'appointments:update',
  APPOINTMENTS_DELETE: 'appointments:delete',
  
  // Medical Records
  RECORDS_CREATE: 'records:create',
  RECORDS_READ: 'records:read',
  RECORDS_UPDATE: 'records:update',
  RECORDS_DELETE: 'records:delete',
  
  // System Administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
  
  // Reports and Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  ANALYTICS_VIEW: 'analytics:view',
} as const

// Default roles for the system
export const DEFAULT_ROLES: Omit<Role, 'id'>[] = [
  {
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: Object.values(PERMISSIONS).map((permission) => ({
      id: permission,
      name: permission.split(':')[1] + ' ' + permission.split(':')[0],
      description: `Permission to ${permission.split(':')[1]} ${permission.split(':')[0]}`,
      resource: permission.split(':')[0],
      action: permission.split(':')[1],
    }))
  },
  {
    name: 'Administrator',
    description: 'Administrative access without system-level permissions',
    isSystem: true,
    permissions: [
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.ROLES_READ,
      PERMISSIONS.PATIENTS_CREATE,
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.PATIENTS_UPDATE,
      PERMISSIONS.PRACTITIONERS_READ,
      PERMISSIONS.APPOINTMENTS_CREATE,
      PERMISSIONS.APPOINTMENTS_READ,
      PERMISSIONS.APPOINTMENTS_UPDATE,
      PERMISSIONS.RECORDS_CREATE,
      PERMISSIONS.RECORDS_READ,
      PERMISSIONS.RECORDS_UPDATE,
      PERMISSIONS.REPORTS_VIEW,
    ].map((permission) => ({
      id: permission,
      name: permission.split(':')[1] + ' ' + permission.split(':')[0],
      description: `Permission to ${permission.split(':')[1]} ${permission.split(':')[0]}`,
      resource: permission.split(':')[0],
      action: permission.split(':')[1],
    }))
  },
  {
    name: 'Practitioner',
    description: 'Healthcare provider with patient care permissions',
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.PATIENTS_UPDATE,
      PERMISSIONS.APPOINTMENTS_CREATE,
      PERMISSIONS.APPOINTMENTS_READ,
      PERMISSIONS.APPOINTMENTS_UPDATE,
      PERMISSIONS.RECORDS_CREATE,
      PERMISSIONS.RECORDS_READ,
      PERMISSIONS.RECORDS_UPDATE,
      PERMISSIONS.PRACTITIONERS_READ,
    ].map((permission) => ({
      id: permission,
      name: permission.split(':')[1] + ' ' + permission.split(':')[0],
      description: `Permission to ${permission.split(':')[1]} ${permission.split(':')[0]}`,
      resource: permission.split(':')[0],
      action: permission.split(':')[1],
    }))
  },
  {
    name: 'Nurse',
    description: 'Nursing staff with patient care and appointment permissions',
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.PATIENTS_UPDATE,
      PERMISSIONS.APPOINTMENTS_CREATE,
      PERMISSIONS.APPOINTMENTS_READ,
      PERMISSIONS.APPOINTMENTS_UPDATE,
      PERMISSIONS.RECORDS_READ,
      PERMISSIONS.RECORDS_UPDATE,
    ].map((permission) => ({
      id: permission,
      name: permission.split(':')[1] + ' ' + permission.split(':')[0],
      description: `Permission to ${permission.split(':')[1]} ${permission.split(':')[0]}`,
      resource: permission.split(':')[0],
      action: permission.split(':')[1],
    }))
  },
  {
    name: 'Receptionist',
    description: 'Front desk staff with appointment and basic patient permissions',
    isSystem: true,
    permissions: [
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.APPOINTMENTS_CREATE,
      PERMISSIONS.APPOINTMENTS_READ,
      PERMISSIONS.APPOINTMENTS_UPDATE,
      PERMISSIONS.PRACTITIONERS_READ,
    ].map((permission) => ({
      id: permission,
      name: permission.split(':')[1] + ' ' + permission.split(':')[0],
      description: `Permission to ${permission.split(':')[1]} ${permission.split(':')[0]}`,
      resource: permission.split(':')[0],
      action: permission.split(':')[1],
    }))
  },
  {
    name: 'Patient',
    description: 'Patient with access to their own records and appointments',
    isSystem: true,
    permissions: [
      PERMISSIONS.APPOINTMENTS_READ,
      PERMISSIONS.RECORDS_READ,
    ].map((permission) => ({
      id: permission,
      name: permission.split(':')[1] + ' ' + permission.split(':')[0],
      description: `Permission to ${permission.split(':')[1]} ${permission.split(':')[0]}`,
      resource: permission.split(':')[0],
      action: permission.split(':')[1],
    }))
  }
]

// Helper functions
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes(PERMISSIONS.SYSTEM_ADMIN)
}

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission))
}

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission))
}
