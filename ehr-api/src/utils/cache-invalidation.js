/**
 * Bulk Cache Invalidation Utility
 * 
 * Provides helper functions for invalidating caches in bulk operations
 * to prevent stale data from being served.
 * 
 * Usage:
 *   const { invalidateBulk } = require('./utils/cache-invalidation');
 *   
 *   await invalidateBulk.patients([id1, id2, id3]);
 *   await invalidateBulk.allPatients();
 */

const multiCache = require('./multi-level-cache');
const queryCache = require('./query-cache');
const logger = require('./logger');

class BulkCacheInvalidation {
  /**
   * Invalidate caches for multiple patients
   */
  async patients(patientIds) {
    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      return;
    }

    logger.debug('Bulk invalidating patient caches', { count: patientIds.length });

    // Invalidate individual patient caches
    for (const id of patientIds) {
      multiCache.invalidate(multiCache.KEYS.PATIENT(id));
    }

    // Invalidate all patient search caches
    multiCache.invalidatePattern('patient-search:*');
    
    return { invalidated: patientIds.length };
  }

  /**
   * Invalidate all patient-related caches
   */
  async allPatients() {
    logger.info('Invalidating all patient caches');
    
    multiCache.invalidatePattern('patient:*');
    multiCache.invalidatePattern('patient-search:*');
    
    return { invalidated: 'all-patients' };
  }

  /**
   * Invalidate caches for multiple appointments
   */
  async appointments(appointmentIds) {
    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return;
    }

    logger.debug('Bulk invalidating appointment caches', { count: appointmentIds.length });

    for (const id of appointmentIds) {
      multiCache.invalidate(multiCache.KEYS.APPOINTMENT(id));
    }
    
    return { invalidated: appointmentIds.length };
  }

  /**
   * Invalidate caches for patient's appointments
   */
  async patientAppointments(patientId) {
    if (!patientId) return;

    logger.debug('Invalidating patient appointment caches', { patientId });
    
    multiCache.invalidate(multiCache.KEYS.APPOINTMENTS_BY_PATIENT(patientId));
    
    return { invalidated: 'patient-appointments' };
  }

  /**
   * Invalidate caches for multiple roles
   */
  async roles(orgIds) {
    if (!Array.isArray(orgIds) || orgIds.length === 0) {
      return;
    }

    logger.debug('Bulk invalidating role caches', { count: orgIds.length });

    for (const orgId of orgIds) {
      queryCache.invalidate(queryCache.KEYS.ROLES(orgId));
    }
    
    return { invalidated: orgIds.length };
  }

  /**
   * Invalidate all role caches (use after global role changes)
   */
  async allRoles() {
    logger.info('Invalidating all role caches');
    
    queryCache.invalidatePattern('roles:*');
    
    return { invalidated: 'all-roles' };
  }

  /**
   * Invalidate caches for multiple users
   */
  async users(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return;
    }

    logger.debug('Bulk invalidating user caches', { count: userIds.length });

    for (const userId of userIds) {
      multiCache.invalidate(multiCache.KEYS.USER_PERMISSIONS(userId));
    }
    
    return { invalidated: userIds.length };
  }

  /**
   * Invalidate caches for organization
   */
  async organization(orgId) {
    if (!orgId) return;

    logger.debug('Invalidating organization caches', { orgId });
    
    multiCache.invalidate(multiCache.KEYS.ORGANIZATION(orgId));
    queryCache.invalidate(queryCache.KEYS.ROLES(orgId));
    
    // Invalidate all org-specific caches
    multiCache.invalidatePattern(`*:${orgId}:*`);
    
    return { invalidated: 'organization' };
  }

  /**
   * Invalidate everything (nuclear option - use sparingly)
   */
  async all() {
    logger.warn('Invalidating ALL caches - nuclear option');
    
    multiCache.flush();
    queryCache.flush();
    
    return { invalidated: 'all-caches' };
  }

  /**
   * Get cache invalidation statistics
   */
  getStats() {
    return {
      multiCache: multiCache.getStats(),
      queryCache: queryCache.getStats(),
    };
  }
}

// Export singleton
const invalidateBulk = new BulkCacheInvalidation();

module.exports = invalidateBulk;
