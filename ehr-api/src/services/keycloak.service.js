const axios = require('axios');

/**
 * Keycloak Admin Service
 * Handles all Keycloak admin operations
 * IMPORTANT: Frontend should NEVER call Keycloak directly
 */

class KeycloakService {
  constructor() {
    this.baseUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    this.realm = process.env.KEYCLOAK_REALM || 'ehrconnect';
    this.adminUsername = process.env.KEYCLOAK_ADMIN_USER || 'admin';
    this.adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
    this.clientId = process.env.KEYCLOAK_CLIENT_ID || 'admin-cli';
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get admin access token
   */
  async getAdminToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const tokenUrl = `${this.baseUrl}/realms/master/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('grant_type', 'password');
      params.append('username', this.adminUsername);
      params.append('password', this.adminPassword);
      
      if (this.clientSecret) {
        params.append('client_secret', this.clientSecret);
      }

      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Keycloak admin token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Keycloak');
    }
  }

  /**
   * Make authenticated request to Keycloak Admin API
   */
  async adminRequest(method, path, data = null) {
    const token = await this.getAdminToken();
    const url = `${this.baseUrl}/admin/realms/${this.realm}${path}`;

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Keycloak ${method} ${path} failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new user in Keycloak
   */
  async createUser(userData) {
    const {
      email,
      firstName,
      lastName,
      password,
      emailVerified = false,
      enabled = true,
      attributes = {}
    } = userData;

    // Check if user already exists
    const existing = await this.findUserByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const user = {
      username: email,
      email,
      firstName,
      lastName,
      enabled,
      emailVerified,
      attributes,
      credentials: password ? [{
        type: 'password',
        value: password,
        temporary: false
      }] : []
    };

    try {
      // Create user
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/admin/realms/${this.realm}/users`,
        data: user,
        headers: {
          'Authorization': `Bearer ${await this.getAdminToken()}`,
          'Content-Type': 'application/json'
        }
      });

      // Extract user ID from Location header
      const location = response.headers.location;
      const userId = location.substring(location.lastIndexOf('/') + 1);

      return { id: userId, email, firstName, lastName };
    } catch (error) {
      console.error('Failed to create Keycloak user:', error.response?.data || error.message);
      throw new Error('Failed to create user in Keycloak');
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    try {
      const users = await this.adminRequest('GET', `/users?email=${encodeURIComponent(email)}&exact=true`);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Failed to find user:', error);
      return null;
    }
  }

  /**
   * Update user attributes
   */
  async updateUserAttributes(userId, attributes) {
    try {
      // Get current user
      const user = await this.adminRequest('GET', `/users/${userId}`);

      // Merge attributes
      const updatedAttributes = {
        ...user.attributes,
        ...attributes
      };

      // Update user
      await this.adminRequest('PUT', `/users/${userId}`, {
        ...user,
        attributes: updatedAttributes
      });

      return true;
    } catch (error) {
      console.error('Failed to update user attributes:', error);
      throw new Error('Failed to update user attributes in Keycloak');
    }
  }

  /**
   * Send email verification
   */
  async sendVerifyEmail(userId) {
    try {
      await this.adminRequest('PUT', `/users/${userId}/send-verify-email`);
      return true;
    } catch (error) {
      console.error('Failed to send verify email:', error);
      // Don't throw, email sending is not critical
      return false;
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(userId, password, temporary = false) {
    try {
      await this.adminRequest('PUT', `/users/${userId}/reset-password`, {
        type: 'password',
        value: password,
        temporary
      });
      return true;
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw new Error('Failed to reset password in Keycloak');
    }
  }

  /**
   * Disable user account
   */
  async disableUser(userId) {
    try {
      const user = await this.adminRequest('GET', `/users/${userId}`);
      await this.adminRequest('PUT', `/users/${userId}`, {
        ...user,
        enabled: false
      });
      return true;
    } catch (error) {
      console.error('Failed to disable user:', error);
      throw new Error('Failed to disable user in Keycloak');
    }
  }

  /**
   * Enable user account
   */
  async enableUser(userId) {
    try {
      const user = await this.adminRequest('GET', `/users/${userId}`);
      await this.adminRequest('PUT', `/users/${userId}`, {
        ...user,
        enabled: true
      });
      return true;
    } catch (error) {
      console.error('Failed to enable user:', error);
      throw new Error('Failed to enable user in Keycloak');
    }
  }

  /**
   * Logout user (revoke all sessions)
   */
  async logoutUser(userId) {
    try {
      await this.adminRequest('POST', `/users/${userId}/logout`);
      return true;
    } catch (error) {
      console.error('Failed to logout user:', error);
      throw new Error('Failed to logout user from Keycloak');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      await this.adminRequest('DELETE', `/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error('Failed to delete user from Keycloak');
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId) {
    try {
      const sessions = await this.adminRequest('GET', `/users/${userId}/sessions`);
      return sessions;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }
}

module.exports = new KeycloakService();
