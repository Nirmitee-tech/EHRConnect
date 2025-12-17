/**
 * Fixed Billing Background Jobs
 * 
 * Fixes:
 * 1. Memory leak prevention - store and clear timer IDs
 * 2. Parallel query execution instead of sequential
 * 3. Proper error handling and logging
 * 4. Graceful shutdown support
 */

const claimMDService = require('./claimmd.service');
const billingService = require('./billing.service');
const { pool } = require('../database/connection');
const logger = require('../utils/logger');

class BillingJobs {
  constructor() {
    this.isRunning = {
      claimStatusSync: false,
      remittanceFetch: false,
      priorAuthSync: false,
    };
    
    // Store timer IDs for cleanup
    this.timers = {
      intervals: [],
      timeouts: [],
    };
  }

  /**
   * Initialize all background jobs
   */
  initialize() {
    logger.info('Initializing billing background jobs');

    // Sync claim statuses every 30 minutes
    this.scheduleJob('claimStatusSync', 30 * 60 * 1000, () => this.syncClaimStatuses());

    // Fetch remittance files hourly
    this.scheduleJob('remittanceFetch', 60 * 60 * 1000, () => this.fetchRemittanceFiles());

    // Sync prior auth statuses every 30 minutes
    this.scheduleJob('priorAuthSync', 30 * 60 * 1000, () => this.syncPriorAuthStatuses());

    logger.info('Billing background jobs initialized');
  }

  /**
   * Schedule a recurring job with proper cleanup
   */
  scheduleJob(jobName, interval, jobFunction) {
    // Run immediately on startup (after 5 seconds)
    const initialTimeout = setTimeout(() => jobFunction(), 5000);
    this.timers.timeouts.push(initialTimeout);

    // Then run on schedule
    const jobInterval = setInterval(async () => {
      if (this.isRunning[jobName]) {
        logger.warn('Skipping job - previous run still in progress', { jobName });
        return;
      }

      try {
        this.isRunning[jobName] = true;
        await jobFunction();
      } catch (error) {
        logger.error('Error in background job', {
          jobName,
          error: error.message,
          stack: error.stack
        });
      } finally {
        this.isRunning[jobName] = false;
      }
    }, interval);
    
    this.timers.intervals.push(jobInterval);
    logger.info('Scheduled job', { jobName, intervalSeconds: interval / 1000 });
  }

  /**
   * Sync claim statuses from Claim.MD - WITH PARALLELIZATION
   */
  async syncClaimStatuses() {
    logger.info('Starting claim status sync');
    const startTime = Date.now();

    try {
      // Get all active organizations
      const orgsResult = await pool.query(`
        SELECT DISTINCT org_id
        FROM billing_tenant_settings
        WHERE active = true
      `).catch(err => {
        if (err.code === '42P01') {
          logger.info('Billing tables not found, skipping sync');
          return { rows: [] };
        }
        throw err;
      });

      if (orgsResult.rows.length === 0) {
        logger.info('No active organizations for claim sync');
        return;
      }

      // Process organizations in parallel (with concurrency limit)
      const batchSize = 5; // Process 5 orgs at a time
      for (let i = 0; i < orgsResult.rows.length; i += batchSize) {
        const batch = orgsResult.rows.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (org) => {
          try {
            await this.syncOrgClaims(org.org_id);
          } catch (error) {
            logger.error('Error syncing org claims', {
              orgId: org.org_id,
              error: error.message
            });
          }
        }));
      }

      const duration = Date.now() - startTime;
      logger.info('Claim status sync completed', {
        duration: `${duration}ms`,
        orgCount: orgsResult.rows.length
      });
    } catch (error) {
      logger.error('Claim status sync failed', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Sync claims for a single organization - PARALLELIZED
   */
  async syncOrgClaims(orgId) {
    // Get claims that need syncing
    const claimsResult = await pool.query(`
      SELECT id, claim_md_id
      FROM billing_claims
      WHERE org_id = $1
      AND claim_md_id IS NOT NULL
      AND status IN ('submitted', 'accepted')
      AND (updated_at < NOW() - INTERVAL '1 hour' OR updated_at IS NULL)
      ORDER BY submission_date ASC
      LIMIT 100
    `, [orgId]);

    if (claimsResult.rows.length === 0) {
      return;
    }

    logger.info('Syncing claims for organization', {
      orgId,
      claimCount: claimsResult.rows.length
    });

    // Sync claims in parallel batches
    const batchSize = 10;
    for (let i = 0; i < claimsResult.rows.length; i += batchSize) {
      const batch = claimsResult.rows.slice(i, i + batchSize);
      
      await Promise.allSettled(batch.map(async (claim) => {
        try {
          const status = await claimMDService.getClaimStatus(orgId, claim.claim_md_id);
          if (status) {
            await billingService.updateClaimStatus(claim.id, status);
          }
        } catch (error) {
          logger.error('Error syncing individual claim', {
            claimId: claim.id,
            error: error.message
          });
        }
      }));
    }
  }

  /**
   * Fetch remittance files - WITH PARALLELIZATION
   */
  async fetchRemittanceFiles() {
    logger.info('Starting remittance file fetch');
    const startTime = Date.now();

    try {
      // Get organizations with Claim.MD configured
      const orgsResult = await pool.query(`
        SELECT DISTINCT org_id
        FROM billing_tenant_settings
        WHERE active = true
      `).catch(err => {
        if (err.code === '42P01') {
          logger.info('Billing tables not found, skipping remittance fetch');
          return { rows: [] };
        }
        throw err;
      });

      // Fetch in parallel
      await Promise.allSettled(orgsResult.rows.map(async (org) => {
        try {
          await claimMDService.fetchAndProcessERA(org.org_id);
        } catch (error) {
          logger.error('Error fetching remittance for org', {
            orgId: org.org_id,
            error: error.message
          });
        }
      }));

      const duration = Date.now() - startTime;
      logger.info('Remittance file fetch completed', {
        duration: `${duration}ms`,
        orgCount: orgsResult.rows.length
      });
    } catch (error) {
      logger.error('Remittance fetch failed', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Sync prior authorization statuses - WITH PARALLELIZATION
   */
  async syncPriorAuthStatuses() {
    logger.info('Starting prior auth status sync');
    const startTime = Date.now();

    try {
      // Get pending prior auths
      const authsResult = await pool.query(`
        SELECT id, org_id, claim_md_id
        FROM billing_prior_authorizations
        WHERE status = 'pending'
        AND claim_md_id IS NOT NULL
        AND (updated_at < NOW() - INTERVAL '1 hour' OR updated_at IS NULL)
        LIMIT 200
      `).catch(err => {
        if (err.code === '42P01') {
          logger.info('Prior auth table not found, skipping sync');
          return { rows: [] };
        }
        throw err;
      });

      if (authsResult.rows.length === 0) {
        return;
      }

      // Sync in parallel batches
      const batchSize = 10;
      for (let i = 0; i < authsResult.rows.length; i += batchSize) {
        const batch = authsResult.rows.slice(i, i + batchSize);
        
        await Promise.allSettled(batch.map(async (auth) => {
          try {
            const status = await claimMDService.getPriorAuthStatus(auth.org_id, auth.claim_md_id);
            if (status) {
              await pool.query(
                'UPDATE billing_prior_authorizations SET status = $1, updated_at = NOW() WHERE id = $2',
                [status, auth.id]
              );
            }
          } catch (error) {
            logger.error('Error syncing prior auth', {
              authId: auth.id,
              error: error.message
            });
          }
        }));
      }

      const duration = Date.now() - startTime;
      logger.info('Prior auth status sync completed', {
        duration: `${duration}ms`,
        authCount: authsResult.rows.length
      });
    } catch (error) {
      logger.error('Prior auth sync failed', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Graceful shutdown - clear all timers
   */
  shutdown() {
    logger.info('Shutting down billing background jobs');

    // Clear all intervals
    this.timers.intervals.forEach(interval => clearInterval(interval));
    
    // Clear all timeouts
    this.timers.timeouts.forEach(timeout => clearTimeout(timeout));
    
    // Reset arrays
    this.timers.intervals = [];
    this.timers.timeouts = [];

    logger.info('Billing background jobs shut down');
  }
}

// Export singleton
const billingJobs = new BillingJobs();

module.exports = billingJobs;
