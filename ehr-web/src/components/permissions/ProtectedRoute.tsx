'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/types/permissions'

interface ProtectedRouteProps {
  /** Permission(s) required to access this route */
  permission?: Permission | Permission[]

  /** Feature required to access this route */
  feature?: string

  /** Require ALL permissions (default: ANY) */
  requireAll?: boolean

  /** Redirect path if unauthorized (default: /unauthorized) */
  redirectTo?: string

  /** Children to render if authorized */
  children: ReactNode

  /** Custom unauthorized component instead of redirect */
  fallback?: ReactNode

  /** Whether to show loading state */
  showLoading?: boolean

  /** Loading component */
  loadingComponent?: ReactNode
}

/**
 * ProtectedRoute - Page-level permission guard with redirect
 *
 * Protects entire pages/routes based on permissions
 * Redirects to unauthorized page or shows fallback if access denied
 *
 * @example
 * // In a page component
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute permission="admin:access">
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   )
 * }
 *
 * @example
 * // With feature check
 * export default function PatientsPage() {
 *   return (
 *     <ProtectedRoute feature="patients.list">
 *       <PatientList />
 *     </ProtectedRoute>
 *   )
 * }
 *
 * @example
 * // With custom fallback
 * export default function BillingPage() {
 *   return (
 *     <ProtectedRoute
 *       permission="billing:read"
 *       fallback={<AccessDeniedPage />}
 *     >
 *       <BillingDashboard />
 *     </ProtectedRoute>
 *   )
 * }
 */
export function ProtectedRoute({
  permission,
  feature,
  requireAll = false,
  redirectTo = '/unauthorized',
  children,
  fallback,
  showLoading = true,
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter()
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasFeature,
    loading,
  } = usePermissions()

  useEffect(() => {
    if (loading) return

    let hasAccess = false

    // Check feature permission
    if (feature) {
      hasAccess = hasFeature(feature)
    }
    // Check direct permissions
    else if (permission) {
      if (Array.isArray(permission)) {
        hasAccess = requireAll
          ? hasAllPermissions(permission)
          : hasAnyPermission(permission)
      } else {
        hasAccess = hasPermission(permission)
      }
    }

    // Redirect if unauthorized and no fallback
    if (!hasAccess && !fallback) {
      router.push(redirectTo)
    }
  }, [
    permission,
    feature,
    requireAll,
    redirectTo,
    fallback,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasFeature,
    loading,
    router,
  ])

  // Show loading state
  if (loading && showLoading) {
    return <>{loadingComponent || <RouteLoading />}</>
  }

  // If still loading, don't render anything
  if (loading) {
    return null
  }

  // Check access
  let hasAccess = false

  if (feature) {
    hasAccess = hasFeature(feature)
  } else if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission)
    } else {
      hasAccess = hasPermission(permission)
    }
  }

  // Show fallback or children
  return <>{hasAccess ? children : fallback}</>
}

/**
 * Default loading component for protected routes
 */
function RouteLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Default unauthorized page component
 */
export function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You dont have permission to access this page.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Higher-order component for protecting pages
 *
 * @example
 * const ProtectedAdminPage = withPermission(AdminPage, "admin:access")
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | Permission[],
  options?: {
    requireAll?: boolean
    redirectTo?: string
    fallback?: ReactNode
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        permission={permission}
        requireAll={options?.requireAll}
        redirectTo={options?.redirectTo}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Higher-order component for protecting pages by feature
 *
 * @example
 * const ProtectedPatientsPage = withFeature(PatientsPage, "patients.list")
 */
export function withFeature<P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  options?: {
    redirectTo?: string
    fallback?: ReactNode
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        feature={feature}
        redirectTo={options?.redirectTo}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
