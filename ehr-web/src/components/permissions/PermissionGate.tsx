'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/types/permissions'

interface PermissionGateProps {
  /** Single permission or array of permissions required */
  permission?: Permission | Permission[]

  /** Feature key to check (uses feature-permission mapping) */
  feature?: string

  /** Require ALL permissions (default: require ANY) */
  requireAll?: boolean

  /** Children to render if permission check passes */
  children: ReactNode

  /** Fallback to render if permission check fails */
  fallback?: ReactNode

  /** Whether to show loading state */
  showLoading?: boolean

  /** Loading component */
  loadingComponent?: ReactNode

  /** Additional permission check function */
  customCheck?: (permissions: Permission[]) => boolean
}

/**
 * PermissionGate component - Controls visibility based on permissions
 *
 * Supports:
 * - Single or multiple permission checks
 * - Wildcard permissions (*:read, patients:*, *:*)
 * - Feature-based checks
 * - Custom permission logic
 * - Loading states
 *
 * @example
 * // Single permission
 * <PermissionGate permission="patients:read">
 *   <PatientList />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (ANY)
 * <PermissionGate permission={["patients:read", "patients:write"]}>
 *   <PatientList />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (ALL required)
 * <PermissionGate permission={["patients:read", "patients:write"]} requireAll>
 *   <PatientEditor />
 * </PermissionGate>
 *
 * @example
 * // Feature-based check
 * <PermissionGate feature="patients.create">
 *   <CreatePatientButton />
 * </PermissionGate>
 *
 * @example
 * // Wildcard permissions
 * <PermissionGate permission="patients:*">
 *   <PatientFullAccess />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate permission="admin:access" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  feature,
  requireAll = false,
  children,
  fallback = null,
  showLoading = false,
  loadingComponent,
  customCheck,
}: PermissionGateProps) {
  const {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasFeature,
    loading,
  } = usePermissions()

  // Show loading state if requested
  if (loading && showLoading) {
    return <>{loadingComponent || <PermissionGateLoading />}</>
  }

  // If still loading and not showing loading state, don't render anything
  if (loading) {
    return null
  }

  let hasAccess = false

  // Custom check function takes precedence
  if (customCheck) {
    hasAccess = customCheck(permissions)
  }
  // Feature-based check
  else if (feature) {
    hasAccess = hasFeature(feature)
  }
  // Permission-based check
  else if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission)
    } else {
      hasAccess = hasPermission(permission)
    }
  }
  // If no permission criteria specified, deny access by default
  else {
    console.warn('PermissionGate: No permission criteria specified')
    hasAccess = false
  }

  return <>{hasAccess ? children : fallback}</>
}

/**
 * Default loading component for PermissionGate
 */
function PermissionGateLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  )
}

/**
 * Require Permission HOC - Higher-order component version
 *
 * @example
 * const ProtectedComponent = requirePermission(MyComponent, "patients:read")
 */
export function requirePermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | Permission[],
  options?: {
    requireAll?: boolean
    fallback?: ReactNode
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGate
        permission={permission}
        requireAll={options?.requireAll}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </PermissionGate>
    )
  }
}

/**
 * Require Feature HOC - Higher-order component for feature-based checks
 *
 * @example
 * const ProtectedComponent = requireFeature(MyComponent, "patients.create")
 */
export function requireFeature<P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  fallback?: ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGate feature={feature} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    )
  }
}

/**
 * usePermissionGate - Hook version for imperative usage
 *
 * @example
 * const { canAccess, loading } = usePermissionGate({ permission: "patients:read" })
 * if (!canAccess) return <AccessDenied />
 */
export function usePermissionGate(options: {
  permission?: Permission | Permission[]
  feature?: string
  requireAll?: boolean
  customCheck?: (permissions: Permission[]) => boolean
}) {
  const {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasFeature,
    loading,
  } = usePermissions()

  let canAccess = false

  if (!loading) {
    if (options.customCheck) {
      canAccess = options.customCheck(permissions)
    } else if (options.feature) {
      canAccess = hasFeature(options.feature)
    } else if (options.permission) {
      if (Array.isArray(options.permission)) {
        canAccess = options.requireAll
          ? hasAllPermissions(options.permission)
          : hasAnyPermission(options.permission)
      } else {
        canAccess = hasPermission(options.permission)
      }
    }
  }

  return {
    canAccess,
    loading,
  }
}
