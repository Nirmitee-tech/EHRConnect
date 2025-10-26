import { DefaultSession } from 'next-auth';

// Extended JWT token with org claims
export interface ExtendedJWT {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  name?: string;
  email?: string;
  roles?: string[];
  fhirUser?: string;
  // Multi-tenant claims
  org_id?: string;
  org_slug?: string;
  location_ids?: string[];
  permissions?: string[];
}

// Extended session with org claims
declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    roles?: string[];
    hasMoreRoles?: boolean;
    fhirUser?: string;
    // Multi-tenant claims
    org_id?: string;
    org_slug?: string;
    location_ids?: string[];
    permissions?: string[];
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  // Extend JWT with org claims
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    name?: string;
    email?: string;
    roles?: string[];
    fhirUser?: string;
    // Multi-tenant claims
    org_id?: string;
    org_slug?: string;
    location_ids?: string[];
    permissions?: string[];
  }
}

// Organization context type
export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  status: 'pending_verification' | 'active' | 'suspended' | 'deactivated';
  onboarding_completed: boolean;
  onboarding_step?: string;
}

// Permission types
export type ResourceAction = 
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | '*';

export type ResourceType =
  | 'org'
  | 'locations'
  | 'staff'
  | 'roles'
  | 'patients'
  | 'encounters'
  | 'observations'
  | 'orders'
  | 'appointments'
  | 'visits'
  | 'reports'
  | 'audit'
  | 'platform';

export type Permission = `${ResourceType}:${ResourceAction}:${ResourceAction}` | `${ResourceType}:${ResourceAction}`;

// Role scope types
export type RoleScope = 'PLATFORM' | 'ORG' | 'LOCATION' | 'DEPARTMENT';

export interface Role {
  id: string;
  key: string;
  name: string;
  description?: string;
  scope_level: RoleScope;
  permissions: Permission[];
  is_system: boolean;
}

export interface RoleAssignment {
  id: string;
  user_id: string;
  org_id: string;
  role_id: string;
  role: Role;
  scope: 'ORG' | 'LOCATION' | 'DEPARTMENT';
  location_id?: string;
  department_id?: string;
  assigned_at: string;
  expires_at?: string;
  revoked_at?: string;
}
