const crypto = require('crypto');
const { query, transaction } = require('../database/connection');
const redis = require('redis');

/**
 * Session Management Service
 *
 * Features:
 * - Redis-based token blacklist
 * - Session tracking in database
 * - Refresh token management
 * - Multi-device session support
 * - Session revocation
 * - Token rotation
 */

class SessionService {
  constructor() {
    this.redisClient = null;
    this.accessTokenTTL = 15 * 60; // 15 minutes in seconds
    this.refreshTokenTTL = 7 * 24 * 60 * 60; // 7 days in seconds
    this.initRedis();
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.redisClient = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis: Max reconnection attempts reached');
              return new Error('Redis max reconnection attempts reached');
            }
            const delay = Math.min(retries * 100, 3000);
            console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})...`);
            return delay;
          },
        },
      });

      this.redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      this.redisClient.on('ready', () => {
        console.log('✅ Redis ready to accept commands');
      });

      this.redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      await this.redisClient.connect();
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      // Don't throw - allow app to start without Redis but log the error
    }
  }

  /**
   * Check if Redis is available
   */
  isRedisAvailable() {
    return this.redisClient && this.redisClient.isOpen;
  }

  /**
   * Generate session tokens (access token + refresh token)
   */
  async generateTokens(userId, deviceInfo = {}) {
    const accessToken = this.generateSecureToken(32);
    const refreshToken = this.generateSecureToken(48);

    const accessTokenHash = this.hashToken(accessToken);
    const refreshTokenHash = this.hashToken(refreshToken);

    return {
      accessToken,
      refreshToken,
      accessTokenHash,
      refreshTokenHash,
      expiresIn: this.accessTokenTTL,
      refreshExpiresIn: this.refreshTokenTTL,
    };
  }

  /**
   * Create a new session
   */
  async createSession(userId, tokens, metadata = {}) {
    return await transaction(async (client) => {
      const { accessTokenHash, refreshTokenHash } = tokens;

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + this.refreshTokenTTL);

      // Insert session into database
      const result = await client.query(
        `INSERT INTO user_sessions (
          user_id, access_token_hash, refresh_token_hash,
          expires_at, ip_address, user_agent, device_info, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at`,
        [
          userId,
          accessTokenHash,
          refreshTokenHash,
          expiresAt,
          metadata.ipAddress || null,
          metadata.userAgent || null,
          JSON.stringify(metadata.deviceInfo || {}),
          JSON.stringify(metadata.extra || {}),
        ]
      );

      const session = result.rows[0];

      // Store access token in Redis for quick blacklist checks
      if (this.isRedisAvailable()) {
        await this.redisClient.setEx(
          `session:access:${accessTokenHash}`,
          this.accessTokenTTL,
          JSON.stringify({ userId, sessionId: session.id, active: true })
        );

        await this.redisClient.setEx(
          `session:refresh:${refreshTokenHash}`,
          this.refreshTokenTTL,
          JSON.stringify({ userId, sessionId: session.id, active: true })
        );
      }

      return {
        sessionId: session.id,
        createdAt: session.created_at,
      };
    });
  }

  /**
   * Verify access token and check if it's blacklisted
   */
  async verifyAccessToken(accessToken) {
    const tokenHash = this.hashToken(accessToken);

    // Check Redis blacklist first (fast)
    if (this.isRedisAvailable()) {
      const redisKey = `session:access:${tokenHash}`;
      const sessionData = await this.redisClient.get(redisKey);

      if (!sessionData) {
        // Token not in Redis - check if it's blacklisted
        const isBlacklisted = await this.redisClient.exists(`blacklist:${tokenHash}`);
        if (isBlacklisted) {
          return { valid: false, reason: 'token_revoked' };
        }

        // Not in Redis and not blacklisted - check database
        const dbSession = await this.getSessionByAccessToken(tokenHash);
        if (!dbSession) {
          return { valid: false, reason: 'session_not_found' };
        }
        if (!dbSession.is_active) {
          return { valid: false, reason: 'session_revoked' };
        }
        if (new Date(dbSession.expires_at) < new Date()) {
          return { valid: false, reason: 'session_expired' };
        }

        // Valid session found in DB - cache it in Redis
        await this.redisClient.setEx(
          redisKey,
          Math.floor((new Date(dbSession.expires_at) - new Date()) / 1000),
          JSON.stringify({
            userId: dbSession.user_id,
            sessionId: dbSession.id,
            active: true
          })
        );

        return {
          valid: true,
          userId: dbSession.user_id,
          sessionId: dbSession.id,
        };
      }

      const session = JSON.parse(sessionData);
      if (!session.active) {
        return { valid: false, reason: 'session_inactive' };
      }

      // Update last activity
      await this.updateSessionActivity(session.sessionId);

      return {
        valid: true,
        userId: session.userId,
        sessionId: session.sessionId,
      };
    }

    // Fallback to database if Redis unavailable
    const dbSession = await this.getSessionByAccessToken(tokenHash);
    if (!dbSession) {
      return { valid: false, reason: 'session_not_found' };
    }
    if (!dbSession.is_active) {
      return { valid: false, reason: 'session_revoked' };
    }
    if (new Date(dbSession.expires_at) < new Date()) {
      return { valid: false, reason: 'session_expired' };
    }

    await this.updateSessionActivity(dbSession.id);

    return {
      valid: true,
      userId: dbSession.user_id,
      sessionId: dbSession.id,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    const refreshTokenHash = this.hashToken(refreshToken);

    return await transaction(async (client) => {
      // Verify refresh token
      const sessionResult = await client.query(
        `SELECT id, user_id, is_active, expires_at, access_token_hash
         FROM user_sessions
         WHERE refresh_token_hash = $1`,
        [refreshTokenHash]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error('Invalid refresh token');
      }

      const session = sessionResult.rows[0];

      if (!session.is_active) {
        throw new Error('Session has been revoked');
      }

      if (new Date(session.expires_at) < new Date()) {
        throw new Error('Refresh token expired');
      }

      // Blacklist old access token
      await this.blacklistToken(session.access_token_hash, this.accessTokenTTL);

      // Generate new access token
      const newAccessToken = this.generateSecureToken(32);
      const newAccessTokenHash = this.hashToken(newAccessToken);

      // Update session with new access token
      await client.query(
        `UPDATE user_sessions
         SET access_token_hash = $1, last_activity_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newAccessTokenHash, session.id]
      );

      // Update Redis
      if (this.isRedisAvailable()) {
        await this.redisClient.setEx(
          `session:access:${newAccessTokenHash}`,
          this.accessTokenTTL,
          JSON.stringify({
            userId: session.user_id,
            sessionId: session.id,
            active: true
          })
        );
      }

      return {
        accessToken: newAccessToken,
        expiresIn: this.accessTokenTTL,
        sessionId: session.id,
      };
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId, userId) {
    return await transaction(async (client) => {
      // Get session details
      const sessionResult = await client.query(
        `SELECT access_token_hash, refresh_token_hash
         FROM user_sessions
         WHERE id = $1 AND user_id = $2`,
        [sessionId, userId]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error('Session not found or unauthorized');
      }

      const session = sessionResult.rows[0];

      // Mark session as inactive
      await client.query(
        `UPDATE user_sessions
         SET is_active = false, revoked_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [sessionId]
      );

      // Blacklist tokens
      await this.blacklistToken(session.access_token_hash, this.accessTokenTTL);
      await this.blacklistToken(session.refresh_token_hash, this.refreshTokenTTL);

      // Remove from Redis
      if (this.isRedisAvailable()) {
        await this.redisClient.del(`session:access:${session.access_token_hash}`);
        await this.redisClient.del(`session:refresh:${session.refresh_token_hash}`);
      }

      return { success: true, message: 'Session revoked successfully' };
    });
  }

  /**
   * Revoke all sessions for a user (except optionally the current one)
   */
  async revokeAllSessions(userId, exceptSessionId = null) {
    return await transaction(async (client) => {
      let query_text;
      let params;

      if (exceptSessionId) {
        query_text = `SELECT id, access_token_hash, refresh_token_hash
                      FROM user_sessions
                      WHERE user_id = $1 AND id != $2 AND is_active = true`;
        params = [userId, exceptSessionId];
      } else {
        query_text = `SELECT id, access_token_hash, refresh_token_hash
                      FROM user_sessions
                      WHERE user_id = $1 AND is_active = true`;
        params = [userId];
      }

      const sessionsResult = await client.query(query_text, params);
      const sessions = sessionsResult.rows;

      if (sessions.length === 0) {
        return { success: true, revokedCount: 0 };
      }

      // Blacklist all tokens
      for (const session of sessions) {
        await this.blacklistToken(session.access_token_hash, this.accessTokenTTL);
        await this.blacklistToken(session.refresh_token_hash, this.refreshTokenTTL);

        if (this.isRedisAvailable()) {
          await this.redisClient.del(`session:access:${session.access_token_hash}`);
          await this.redisClient.del(`session:refresh:${session.refresh_token_hash}`);
        }
      }

      // Mark all sessions as inactive
      if (exceptSessionId) {
        await client.query(
          `UPDATE user_sessions
           SET is_active = false, revoked_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND id != $2`,
          [userId, exceptSessionId]
        );
      } else {
        await client.query(
          `UPDATE user_sessions
           SET is_active = false, revoked_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId]
        );
      }

      return {
        success: true,
        revokedCount: sessions.length,
        message: `${sessions.length} session(s) revoked successfully`,
      };
    });
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId) {
    const result = await query(
      `SELECT
        id,
        created_at,
        last_activity_at,
        expires_at,
        ip_address,
        user_agent,
        device_info,
        is_active
       FROM user_sessions
       WHERE user_id = $1 AND is_active = true
       ORDER BY last_activity_at DESC`,
      [userId]
    );

    return result.rows.map(session => ({
      id: session.id,
      createdAt: session.created_at,
      lastActivityAt: session.last_activity_at,
      expiresAt: session.expires_at,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      deviceInfo: session.device_info,
      isActive: session.is_active,
      isCurrent: false, // Will be set by caller if needed
    }));
  }

  /**
   * Blacklist a token in Redis
   */
  async blacklistToken(tokenHash, ttlSeconds) {
    if (!this.isRedisAvailable()) {
      console.warn('⚠️ Redis unavailable - token blacklist not updated');
      return;
    }

    try {
      await this.redisClient.setEx(
        `blacklist:${tokenHash}`,
        ttlSeconds,
        JSON.stringify({ blacklistedAt: new Date().toISOString() })
      );
    } catch (error) {
      console.error('❌ Failed to blacklist token:', error);
    }
  }

  /**
   * Get session by access token hash
   */
  async getSessionByAccessToken(tokenHash) {
    const result = await query(
      `SELECT id, user_id, is_active, expires_at
       FROM user_sessions
       WHERE access_token_hash = $1`,
      [tokenHash]
    );

    return result.rows[0] || null;
  }

  /**
   * Update session last activity timestamp
   */
  async updateSessionActivity(sessionId) {
    try {
      await query(
        'UPDATE user_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
        [sessionId]
      );
    } catch (error) {
      // Don't throw - this is a non-critical operation
      console.error('Failed to update session activity:', error);
    }
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  async cleanupExpiredSessions() {
    const result = await query(
      `UPDATE user_sessions
       SET is_active = false
       WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true
       RETURNING id`
    );

    return {
      success: true,
      cleanedCount: result.rowCount,
    };
  }

  /**
   * Force logout user (revoke all sessions)
   * Called when user is disabled or roles revoked
   */
  async forceLogout(userId, reason) {
    const result = await query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Revoke all sessions
    await this.revokeAllSessions(userId);

    // Log the forced logout
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata
      )
      SELECT
        ra.org_id, $2, 'AUTH.FORCED_LOGOUT', 'User', $1,
        $3, 'success', $4
      FROM role_assignments ra
      WHERE ra.user_id = $1
      LIMIT 1`,
      [userId, userId, user.email, JSON.stringify({ reason })]
    );

    return { success: true, message: 'User sessions revoked' };
  }

  /**
   * Check if user session is still valid
   */
  async validateUserSession(userId, orgId) {
    const result = await query(
      `SELECT u.status, ra.revoked_at
       FROM users u
       LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.org_id = $2
       WHERE u.id = $1
       LIMIT 1`,
      [userId, orgId]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'User not found in organization' };
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return { valid: false, reason: 'User account is not active' };
    }

    if (user.revoked_at) {
      return { valid: false, reason: 'User access has been revoked' };
    }

    return { valid: true };
  }

  /**
   * Generate cryptographically secure random token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Hash token for storage
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parse device info from user agent
   */
  parseDeviceInfo(userAgent) {
    if (!userAgent) {
      return { type: 'Unknown', name: 'Unknown', os: 'Unknown' };
    }

    let type = 'Desktop';
    let os = 'Unknown';
    let browser = 'Unknown';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    // Detect device type
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      type = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      type = 'Tablet';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      type,
      os,
      browser,
      name: `${browser} on ${os}`,
    };
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

module.exports = new SessionService();
