'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { io, Socket } from 'socket.io-client'
import type {
  Permission,
  RoleAssignment,
  PermissionChangeEvent,
} from '@/types/permissions'
import { PermissionUtils } from '@/types/permissions'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface UsePermissionsOptions {
  enableRealtime?: boolean
  autoRefresh?: boolean
}

interface UsePermissionsReturn {
  permissions: Permission[]
  roles: RoleAssignment[]
  loading: boolean
  error: Error | null
  hasPermission: (permission: Permission | Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasFeature: (feature: string) => boolean
  refreshPermissions: () => Promise<void>
  isConnected: boolean
}

/**
 * Hook to manage user permissions with real-time updates via Socket.IO
 */
export function usePermissions(options: UsePermissionsOptions = {}): UsePermissionsReturn {
  const { enableRealtime = true, autoRefresh = true } = options
  const { user, isAuthenticated, isLoading } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<RoleAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const [featurePermissions, setFeaturePermissions] = useState<Record<string, Permission[]>>({})

  // Fetch user permissions
  const fetchPermissions = useCallback(async () => {
    if (!session?.accessToken || !session?.org_id || status !== 'authenticated') {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userId = (session as any).user?.id || (session as any).userId

      // Fetch permissions
      const permissionsRes = await fetch(
        `${API_URL}/api/rbac/v2/users/${userId}/permissions`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
            'x-user-id': userId,
            'x-org-id': session.org_id,
          },
        }
      )

      if (!permissionsRes.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const permissionsData = await permissionsRes.json()
      setPermissions(permissionsData.permissions || [])

      // Fetch role assignments
      const rolesRes = await fetch(
        `${API_URL}/api/rbac/v2/users/${userId}/role-assignments`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
            'x-user-id': userId,
            'x-org-id': session.org_id,
          },
        }
      )

      if (!rolesRes.ok) {
        throw new Error('Failed to fetch role assignments')
      }

      const rolesData = await rolesRes.json()
      setRoles(rolesData.assignments || [])
    } catch (err) {
      console.error('Error fetching permissions:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [session, status])

  // Fetch feature permissions mapping
  useEffect(() => {
    async function fetchFeaturePermissions() {
      try {
        const res = await fetch(`${API_URL}/api/rbac/v2/feature-permissions`)
        if (res.ok) {
          const data = await res.json()
          setFeaturePermissions(data.featurePermissions || {})
        }
      } catch (err) {
        console.error('Error fetching feature permissions:', err)
      }
    }

    fetchFeaturePermissions()
  }, [])

  // Setup Socket.IO connection for real-time updates
  useEffect(() => {
    if (!enableRealtime || !session?.accessToken || status !== 'authenticated') {
      return
    }

    const socket = io(API_URL, {
      path: '/socket.io/',
      auth: {
        token: session.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket.IO connected for permission updates')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      setIsConnected(false)
    })

    socket.on('connected', (data) => {
      console.log('Permission update service connected:', data)
    })

    // Listen for permission changes
    socket.on('permission-changed', (event: PermissionChangeEvent) => {
      console.log('Permission changed:', event)

      // Refresh permissions when user's permissions change
      if (autoRefresh) {
        fetchPermissions()
      }
    })

    // Listen for role changes
    socket.on('role-changed', (event: PermissionChangeEvent) => {
      console.log('Role changed:', event)

      // Refresh permissions when org roles change (might affect user)
      if (autoRefresh) {
        fetchPermissions()
      }
    })

    // Listen for role assignment changes
    socket.on('role-assignment-changed', (event: PermissionChangeEvent) => {
      console.log('Role assignment changed:', event)

      if (autoRefresh) {
        fetchPermissions()
      }
    })

    // Listen for role revocations
    socket.on('role-revocation', (event: PermissionChangeEvent) => {
      console.log('Role revoked:', event)

      if (autoRefresh) {
        fetchPermissions()
      }
    })

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [enableRealtime, session, status, autoRefresh, fetchPermissions])

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPermissions()
    }
  }, [status, fetchPermissions])

  // Check if user has a single permission or any of multiple permissions
  const hasPermission = useCallback(
    (permission: Permission | Permission[]): boolean => {
      if (Array.isArray(permission)) {
        return PermissionUtils.hasAnyPermission(permissions, permission)
      }
      return PermissionUtils.hasAnyPermission(permissions, [permission])
    },
    [permissions]
  )

  // Check if user has ALL permissions
  const hasAllPermissions = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return PermissionUtils.hasAllPermissions(permissions, requiredPermissions)
    },
    [permissions]
  )

  // Check if user has ANY permission
  const hasAnyPermission = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return PermissionUtils.hasAnyPermission(permissions, requiredPermissions)
    },
    [permissions]
  )

  // Check if user has permission for a feature
  const hasFeature = useCallback(
    (feature: string): boolean => {
      const requiredPermissions = featurePermissions[feature]
      if (!requiredPermissions || requiredPermissions.length === 0) {
        // If feature not defined, default to allowing access
        return true
      }
      return PermissionUtils.hasAnyPermission(permissions, requiredPermissions)
    },
    [permissions, featurePermissions]
  )

  return {
    permissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasFeature,
    refreshPermissions: fetchPermissions,
    isConnected,
  }
}
