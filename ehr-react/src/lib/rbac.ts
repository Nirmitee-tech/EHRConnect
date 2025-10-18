import { Session } from 'next-auth';
import type { Permission } from '@/types/auth';

/**
 * Dynamic RBAC utilities
 * All role and permission data is fetched from the database, nothing is hardcoded
 */

/**
 * Parse permission string into components
 */
function parsePermission(permission: string): {
  resource: string;
  action: string;
  subAction?: string;
} {
  const parts = permission.split(':');
  return {
    resource: parts[0] || '*',
    action: parts[1] || '*',
    subAction: parts[2],
  };
}

/**
 * Check if a permission matches a required permission pattern
 * Supports wildcard matching
 */
function matchesPermission(
  userPermission: string,
  requiredPermission: string
): boolean {
  const user = parsePermission(userPermission);
  const required = parsePermission(requiredPermission);

  // Check resource match
  if (user.resource !== '*' && user.resource !== required.resource) {
    return false;
  }

  // Check action match
  if (user.action !== '*' && user.action !== required.action) {
    return false;
  }

  // Check sub-action match if present
  if (required.subAction) {
    if (user.subAction && user.subAction !== '*' && user.subAction !== required.subAction) {
      return false;
    }
  }

  return true;
}

/**
 * Check if user has a specific permission
 * All permissions are dynamically loaded from session (which comes from DB)
 */
export function hasPermission(
  session: Session | null,
  requiredPermission: Permission | string
): boolean {
  if (!session?.permissions) {
    return false;
  }

  const permissions = session.permissions as string[];

  // Check if any user permission matches the required permission
  return permissions.some(userPerm => matchesPermission(userPerm, requiredPermission));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  session: Session | null,
  requiredPermissions: (Permission | string)[]
): boolean {
  return requiredPermissions.some(permission => hasPermission(session, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  session: Session | null,
  requiredPermissions: (Permission | string)[]
): boolean {
  return requiredPermissions.every(permission => hasPermission(session, permission));
}

/**
 * Check if user has a specific role
 * Roles are dynamically loaded from session (which comes from DB)
 */
export function hasRole(
  session: Session | null,
  requiredRole: string
): boolean {
  if (!session?.roles) {
    return false;
  }

  const roles = session.roles as string[];
  return roles.includes(requiredRole);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  session: Session | null,
  requiredRoles: string[]
): boolean {
  if (!session?.roles) {
    return false;
  }

  const roles = session.roles as string[];
  return requiredRoles.some(role => roles.includes(role));
}

/**
 * Check if user belongs to the specified organization
 */
export function belongsToOrg(
  session: Session | null,
  orgId: string
): boolean {
  return session?.org_id === orgId;
}

/**
 * Check if user has access to a specific location
 * Users with org-wide permissions (empty location_ids) have access to all locations
 */
export function hasLocationAccess(
  session: Session | null,
  locationId: string
): boolean {
  if (!session) {
    return false;
  }

  const locationIds = session.location_ids as string[] | undefined;
  
  // Empty or undefined location_ids means org-wide access
  if (!locationIds || locationIds.length === 0) {
    return true;
  }

  return locationIds.includes(locationId);
}

/**
 * Check if user has access to any of the specified locations
 */
export function hasAnyLocationAccess(
  session: Session | null,
  locationIds: string[]
): boolean {
  if (!session) {
    return false;
  }

  const userLocationIds = session.location_ids as string[] | undefined;
  
  // Empty or undefined location_ids means org-wide access
  if (!userLocationIds || userLocationIds.length === 0) {
    return true;
  }

  return locationIds.some(locId => userLocationIds.includes(locId));
}

/**
 * Get list of accessible location IDs for user
 * Empty array means all locations are accessible
 */
export function getAccessibleLocations(session: Session | null): string[] | null {
  if (!session) {
    return null;
  }

  const locationIds = session.location_ids as string[] | undefined;
  
  // Null indicates all locations accessible
  if (!locationIds || locationIds.length === 0) {
    return null;
  }

  return locationIds;
}

/**
 * Get user's roles
 */
export function getUserRoles(session: Session | null): string[] {
  if (!session?.roles) {
    return [];
  }

  return session.roles as string[];
}

/**
 * Get user's permissions
 */
export function getUserPermissions(session: Session | null): string[] {
  if (!session?.permissions) {
    return [];
  }

  return session.permissions as string[];
}

/**
 * Resource authorization check
 * Validates if user can perform action on resource considering org and location isolation
 */
export interface AuthorizationContext {
  resourceOrgId?: string;
  resourceLocationId?: string;
  requiredPermission: Permission | string;
  requireOrgMatch?: boolean;
  requireLocationAccess?: boolean;
}

export function authorize(
  session: Session | null,
  context: AuthorizationContext
): { authorized: boolean; reason?: string } {
  if (!session) {
    return { authorized: false, reason: 'Not authenticated' };
  }

  // Check organization match if required
  if (context.requireOrgMatch !== false && context.resourceOrgId) {
    if (!belongsToOrg(session, context.resourceOrgId)) {
      return { authorized: false, reason: 'Organization mismatch' };
    }
  }

  // Check location access if required
  if (context.requireLocationAccess && context.resourceLocationId) {
    if (!hasLocationAccess(session, context.resourceLocationId)) {
      return { authorized: false, reason: 'No access to this location' };
    }
  }

  // Check permission
  if (!hasPermission(session, context.requiredPermission)) {
    return { authorized: false, reason: 'Insufficient permissions' };
  }

  return { authorized: true };
}

/**
 * Build query filter for location-scoped data access
 * Returns null for org-wide access, or array of location IDs for restricted access
 */
export function buildLocationFilter(session: Session | null): string[] | null {
  return getAccessibleLocations(session);
}

/**
 * Check if session is valid and has required org context
 */
export function hasValidOrgContext(session: Session | null): boolean {
  return !!(session?.org_id && session?.org_slug);
}
