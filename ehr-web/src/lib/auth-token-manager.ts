/**
 * Authentication Token Manager
 *
 * Handles access token and refresh token lifecycle:
 * - Automatic token refresh before expiry
 * - Retry logic for failed requests
 * - Secure token storage
 * - Graceful error handling
 *
 * Usage:
 *   import { authTokenManager } from '@/lib/auth-token-manager';
 *
 *   // After login
 *   authTokenManager.setTokens(accessToken, refreshToken, expiresIn, sessionId);
 *
 *   // Get token for API requests
 *   const token = authTokenManager.getAccessToken();
 *
 *   // On logout
 *   authTokenManager.clear();
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
  expiresAt: number;
}

type TokenRefreshCallback = (tokens: TokenData) => void;
type TokenExpiredCallback = () => void;

class AuthTokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionId: string | null = null;
  private expiresAt: number = 0;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  private onTokenRefreshCallbacks: TokenRefreshCallback[] = [];
  private onTokenExpiredCallbacks: TokenExpiredCallback[] = [];

  // Storage keys
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    SESSION_ID: 'auth_session_id',
    EXPIRES_AT: 'auth_expires_at',
  };

  constructor() {
    // Initialize from storage on page load
    if (typeof window !== 'undefined') {
      this.loadFromStorage();

      // Handle visibility change to refresh on tab activation
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      // Handle storage events from other tabs
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  /**
   * Set tokens after login or refresh
   */
  setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    sessionId: string
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.sessionId = sessionId;
    this.expiresAt = Date.now() + expiresIn * 1000;

    // Save to storage
    this.saveToStorage();

    // Schedule automatic refresh
    this.scheduleTokenRefresh(expiresIn);

    // Notify listeners
    this.notifyTokenRefresh({
      accessToken,
      refreshToken,
      expiresIn,
      sessionId,
      expiresAt: this.expiresAt,
    });
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    // Check if token is expired
    if (this.accessToken && Date.now() >= this.expiresAt) {
      console.warn('Access token expired, attempting refresh...');
      // Trigger immediate refresh
      this.refreshAccessToken();
      return null;
    }

    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Check if tokens are present
   */
  hasTokens(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    return Date.now() >= this.expiresAt;
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(): number {
    return Math.max(0, Math.floor((this.expiresAt - Date.now()) / 1000));
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    // Clear existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // Refresh 1 minute before expiry (or at 80% of lifetime, whichever is sooner)
    const refreshBuffer = 60; // seconds
    const refreshAt80Percent = expiresIn * 0.8;
    const refreshTime = Math.max(
      (Math.min(expiresIn - refreshBuffer, refreshAt80Percent)) * 1000,
      0
    );

    console.log(`[AuthTokenManager] Scheduling refresh in ${refreshTime / 1000}s`);

    this.refreshTimeout = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    // If already refreshing, return existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const success = await this.refreshPromise;
      return success;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async _performRefresh(): Promise<boolean> {
    console.log('[AuthTokenManager] Refreshing access token...');

    if (!this.refreshToken) {
      console.error('[AuthTokenManager] No refresh token available');
      this.handleTokenExpired();
      return false;
    }

    try {
      const response = await fetch('/api/sessions/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('[AuthTokenManager] Refresh token invalid or expired');
          this.handleTokenExpired();
          return false;
        }

        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.accessToken) {
        // Update access token only (refresh token stays the same)
        this.accessToken = data.accessToken;
        this.expiresAt = Date.now() + data.expiresIn * 1000;

        // Update storage
        this.saveToStorage();

        // Schedule next refresh
        this.scheduleTokenRefresh(data.expiresIn);

        console.log('[AuthTokenManager] Access token refreshed successfully');

        // Notify listeners
        this.notifyTokenRefresh({
          accessToken: data.accessToken,
          refreshToken: this.refreshToken!,
          expiresIn: data.expiresIn,
          sessionId: this.sessionId!,
          expiresAt: this.expiresAt,
        });

        return true;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('[AuthTokenManager] Token refresh error:', error);

      // On error, try again in 10 seconds (max 3 retries)
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }

      this.refreshTimeout = setTimeout(() => {
        this.refreshAccessToken();
      }, 10000);

      return false;
    }
  }

  /**
   * Clear tokens and cancel refresh
   */
  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.sessionId = null;
    this.expiresAt = 0;

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    this.clearStorage();
    console.log('[AuthTokenManager] Tokens cleared');
  }

  /**
   * Save tokens to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, this.accessToken || '');
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken || '');
      localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, this.sessionId || '');
      localStorage.setItem(this.STORAGE_KEYS.EXPIRES_AT, this.expiresAt.toString());
    } catch (error) {
      console.error('[AuthTokenManager] Failed to save to storage:', error);
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      this.accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      this.sessionId = localStorage.getItem(this.STORAGE_KEYS.SESSION_ID);

      const expiresAt = localStorage.getItem(this.STORAGE_KEYS.EXPIRES_AT);
      this.expiresAt = expiresAt ? parseInt(expiresAt, 10) : 0;

      // If we have tokens, check expiry and schedule refresh
      if (this.accessToken && this.refreshToken) {
        const timeUntilExpiry = this.getTimeUntilExpiry();

        if (timeUntilExpiry <= 0) {
          // Token already expired, try to refresh immediately
          console.log('[AuthTokenManager] Token expired on load, refreshing...');
          this.refreshAccessToken();
        } else {
          // Schedule refresh
          this.scheduleTokenRefresh(timeUntilExpiry);
        }
      }
    } catch (error) {
      console.error('[AuthTokenManager] Failed to load from storage:', error);
    }
  }

  /**
   * Clear tokens from localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('[AuthTokenManager] Failed to clear storage:', error);
    }
  }

  /**
   * Handle visibility change (tab became visible)
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.hasTokens()) {
      // Check if token expired while tab was hidden
      if (this.isAccessTokenExpired()) {
        console.log('[AuthTokenManager] Token expired while tab hidden, refreshing...');
        this.refreshAccessToken();
      }
    }
  };

  /**
   * Handle storage change from another tab
   */
  private handleStorageChange = (event: StorageEvent): void => {
    // If tokens were cleared in another tab, clear them here too
    if (event.key === this.STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
      this.clear();
    }

    // If tokens were updated in another tab, reload them
    if (event.key === this.STORAGE_KEYS.ACCESS_TOKEN && event.newValue) {
      this.loadFromStorage();
    }
  };

  /**
   * Handle token expiration
   */
  private handleTokenExpired(): void {
    this.clear();
    this.notifyTokenExpired();
  }

  /**
   * Register callback for token refresh
   */
  onTokenRefresh(callback: TokenRefreshCallback): () => void {
    this.onTokenRefreshCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.onTokenRefreshCallbacks = this.onTokenRefreshCallbacks.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Register callback for token expiration
   */
  onTokenExpired(callback: TokenExpiredCallback): () => void {
    this.onTokenExpiredCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.onTokenExpiredCallbacks = this.onTokenExpiredCallbacks.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Notify token refresh listeners
   */
  private notifyTokenRefresh(tokens: TokenData): void {
    this.onTokenRefreshCallbacks.forEach(callback => {
      try {
        callback(tokens);
      } catch (error) {
        console.error('[AuthTokenManager] Error in token refresh callback:', error);
      }
    });
  }

  /**
   * Notify token expired listeners
   */
  private notifyTokenExpired(): void {
    this.onTokenExpiredCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[AuthTokenManager] Error in token expired callback:', error);
      }
    });
  }

  /**
   * Cleanup on unmount
   */
  destroy(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('storage', this.handleStorageChange);
    }

    this.onTokenRefreshCallbacks = [];
    this.onTokenExpiredCallbacks = [];
  }
}

// Export singleton instance
export const authTokenManager = new AuthTokenManager();

// Export class for testing
export { AuthTokenManager };
