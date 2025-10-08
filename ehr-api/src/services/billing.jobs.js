/**
 * Billing Background Jobs
 * Scheduled tasks for billing operations:
 * - Sync claim statuses from Claim.MD
 * - Fetch and process ERA files
 * - Auto-post payments
 * - Update prior authorization statuses
 */

const claimMDService = require('./claimmd.service');
const billingService = require('./billing.service');
const { pool } = require('../database/connection');

class BillingJobs {
  constructor() {
    this.isRunning = {
      claimStatusSync: false,
      remittanceFetch: false,
      priorAuthSync: false,
    };
  }

  /**
   * Initialize all background jobs
   */
  initialize() {
    console.log('🔄 Initializing billing background jobs...');

    // Sync claim statuses every 30 minutes
    this.scheduleJob('claimStatusSync', 30 * 60 * 1000, () => this.syncClaimStatuses());

    // Fetch remittance files hourly
    this.scheduleJob('remittanceFetch', 60 * 60 * 1000, () => this.fetchRemittanceFiles());

    // Sync prior auth statuses every 30 minutes
    this.scheduleJob('priorAuthSync', 30 * 60 * 1000, () => this.syncPriorAuthStatuses());

    console.log('✅ Billing background jobs initialized');
  }

  /**
   * Schedule a recurring job
   */
  scheduleJob(jobName, interval, jobFunction) {
    // Run immediately on startup
    setTimeout(() => jobFunction(), 5000); // Wait 5 seconds for server to be fully ready

    // Then run on schedule
    setInterval(async () => {
      if (this.isRunning[jobName]) {
        console.log(`⏭️ Skipping ${jobName} - previous run still in progress`);
        return;
      }

      try {
        this.isRunning[jobName] = true;
        await jobFunction();
      } catch (error) {
        console.error(`❌ Error in ${jobName}:`, error);
      } finally {
        this.isRunning[jobName] = false;
      }
    }, interval);

    console.log(`✅ Scheduled ${jobName} to run every ${interval / 1000}s`);
  }

  /**
   * Sync claim statuses from Claim.MD
   */
  async syncClaimStatuses() {
    console.log('🔄 Starting claim status sync...');

    try {
      // Get all active organizations with Claim.MD configured
      const orgsResult = await pool.query(`
        SELECT DISTINCT org_id
        FROM billing_tenant_settings
        WHERE active = true
      `).catch(err => {
        // Table might not exist yet if migrations haven't run
        if (err.code === '42P01') {
          console.log('⏭️ Billing tables not found, skipping claim status sync');
          return { rows: [] };
        }
        throw err;
      });

      for (const org of orgsResult.rows) {
        const orgId = org.org_id;

        // Get claims that are submitted but not yet paid/denied
        const claimsResult = await pool.query(`
          SELECT id, claim_md_id
          FROM billing_claims
          WHERE org_id = $1
          AND claim_md_id IS NOT NULL
          AND status IN ('submitted', 'accepted')
          AND (updated_at < NOW() - INTERVAL '1 hour' OR updated_at IS NULL)
          ORDER BY submission_date ASC
          LIMIT 50
        `, [orgId]);

        console.log(`📋 Syncing ${claimsResult.rows.length} claims for org ${orgId}`);

        for (const claim of claimsResult.rows) {
          try {
            await claimMDService.checkClaimStatus(orgId, claim.claim_md_id);
            console.log(`✅ Updated claim ${claim.claim_md_id}`);

            // Small delay to avoid rate limiting
            await this.sleep(500);
          } catch (error) {
            console.error(`❌ Failed to update claim ${claim.claim_md_id}:`, error.message);
          }
        }
      }

      console.log('✅ Claim status sync completed');
    } catch (error) {
      console.error('❌ Claim status sync failed:', error);
      throw error;
    }
  }

  /**
   * Fetch remittance files from Claim.MD
   */
  async fetchRemittanceFiles() {
    console.log('🔄 Starting remittance fetch...');

    try {
      // Get all active organizations
      const orgsResult = await pool.query(`
        SELECT DISTINCT org_id
        FROM billing_tenant_settings
        WHERE active = true
      `).catch(err => {
        // Table might not exist yet if migrations haven't run
        if (err.code === '42P01') {
          console.log('⏭️ Billing tables not found, skipping remittance fetch');
          return { rows: [] };
        }
        throw err;
      });

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 7 days

      for (const org of orgsResult.rows) {
        const orgId = org.org_id;

        try {
          // Fetch available ERA files
          const files = await claimMDService.fetchRemittanceFiles(orgId, startDate, endDate);

          console.log(`📥 Found ${files.length} remittance files for org ${orgId}`);

          for (const file of files) {
            // Check if already downloaded
            const existingResult = await pool.query(
              'SELECT id FROM billing_remittance WHERE era_file_id = $1',
              [file.fileId]
            );

            if (existingResult.rows.length > 0) {
              console.log(`⏭️ Skipping already downloaded file ${file.fileId}`);
              continue;
            }

            // Download and process file
            try {
              const result = await claimMDService.downloadRemittanceFile(orgId, file.fileId);
              console.log(`✅ Downloaded and processed ERA file ${file.fileId}: ${result.claimCount} claims`);

              // Small delay
              await this.sleep(1000);
            } catch (error) {
              console.error(`❌ Failed to download ERA file ${file.fileId}:`, error.message);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to fetch remittance files for org ${orgId}:`, error.message);
        }
      }

      console.log('✅ Remittance fetch completed');
    } catch (error) {
      console.error('❌ Remittance fetch failed:', error);
      throw error;
    }
  }

  /**
   * Sync prior authorization statuses
   */
  async syncPriorAuthStatuses() {
    console.log('🔄 Starting prior auth status sync...');

    try {
      // Get all active organizations
      const orgsResult = await pool.query(`
        SELECT DISTINCT org_id
        FROM billing_tenant_settings
        WHERE active = true
      `).catch(err => {
        // Table might not exist yet if migrations haven't run
        if (err.code === '42P01') {
          console.log('⏭️ Billing tables not found, skipping prior auth sync');
          return { rows: [] };
        }
        throw err;
      });

      for (const org of orgsResult.rows) {
        const orgId = org.org_id;

        // Get pending prior auths
        const authsResult = await pool.query(`
          SELECT id, auth_number
          FROM billing_prior_authorizations
          WHERE org_id = $1
          AND status = 'pending'
          AND requested_date >= NOW() - INTERVAL '90 days'
          AND (updated_at < NOW() - INTERVAL '1 hour' OR updated_at IS NULL)
          ORDER BY requested_date ASC
          LIMIT 50
        `, [orgId]);

        console.log(`📋 Syncing ${authsResult.rows.length} prior auths for org ${orgId}`);

        for (const auth of authsResult.rows) {
          try {
            await claimMDService.checkPriorAuthStatus(orgId, auth.auth_number);
            console.log(`✅ Updated prior auth ${auth.auth_number}`);

            // Small delay
            await this.sleep(500);
          } catch (error) {
            console.error(`❌ Failed to update prior auth ${auth.auth_number}:`, error.message);
          }
        }
      }

      console.log('✅ Prior auth status sync completed');
    } catch (error) {
      console.error('❌ Prior auth status sync failed:', error);
      throw error;
    }
  }

  /**
   * Auto-post received remittances
   * (Optional - may want manual review before posting)
   */
  async autoPostRemittances() {
    console.log('🔄 Starting auto-post remittances...');

    try {
      // Get received remittances older than 24 hours (for review period)
      const remittancesResult = await pool.query(`
        SELECT id, org_id
        FROM billing_remittance
        WHERE status = 'received'
        AND received_at < NOW() - INTERVAL '24 hours'
        LIMIT 20
      `);

      console.log(`📋 Auto-posting ${remittancesResult.rows.length} remittances`);

      for (const remittance of remittancesResult.rows) {
        try {
          // Use system user for auto-posting
          const systemUserId = await this.getSystemUserId(remittance.org_id);

          await billingService.postRemittancePayment(
            remittance.org_id,
            remittance.id,
            systemUserId
          );

          console.log(`✅ Auto-posted remittance ${remittance.id}`);
        } catch (error) {
          console.error(`❌ Failed to auto-post remittance ${remittance.id}:`, error.message);
        }
      }

      console.log('✅ Auto-post remittances completed');
    } catch (error) {
      console.error('❌ Auto-post remittances failed:', error);
      throw error;
    }
  }

  /**
   * Clean up old data (optional maintenance job)
   */
  async cleanupOldData() {
    console.log('🔄 Starting data cleanup...');

    try {
      // Archive eligibility checks older than 1 year
      const eligibilityResult = await pool.query(`
        DELETE FROM billing_eligibility_history
        WHERE checked_at < NOW() - INTERVAL '1 year'
      `);

      console.log(`🗑️ Cleaned up ${eligibilityResult.rowCount} old eligibility records`);

      // Archive claim status history older than 2 years
      const statusResult = await pool.query(`
        DELETE FROM billing_claim_status_history
        WHERE changed_at < NOW() - INTERVAL '2 years'
      `);

      console.log(`🗑️ Cleaned up ${statusResult.rowCount} old status history records`);

      console.log('✅ Data cleanup completed');
    } catch (error) {
      console.error('❌ Data cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get or create system user for automated tasks
   */
  async getSystemUserId(orgId) {
    const result = await pool.query(`
      SELECT id FROM users
      WHERE email = 'system@ehrconnect.internal'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Return null if system user doesn't exist
    // In production, create a dedicated system user
    return null;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manually trigger a job (for testing/admin use)
   */
  async triggerJob(jobName) {
    console.log(`🔄 Manually triggering job: ${jobName}`);

    switch (jobName) {
      case 'claimStatusSync':
        await this.syncClaimStatuses();
        break;
      case 'remittanceFetch':
        await this.fetchRemittanceFiles();
        break;
      case 'priorAuthSync':
        await this.syncPriorAuthStatuses();
        break;
      case 'autoPostRemittances':
        await this.autoPostRemittances();
        break;
      case 'cleanupOldData':
        await this.cleanupOldData();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }

    console.log(`✅ Job completed: ${jobName}`);
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      claimStatusSync: {
        running: this.isRunning.claimStatusSync,
        lastRun: this.lastRun?.claimStatusSync || null,
      },
      remittanceFetch: {
        running: this.isRunning.remittanceFetch,
        lastRun: this.lastRun?.remittanceFetch || null,
      },
      priorAuthSync: {
        running: this.isRunning.priorAuthSync,
        lastRun: this.lastRun?.priorAuthSync || null,
      },
    };
  }
}

module.exports = new BillingJobs();
