const { query, transaction } = require('../database/connection');
const crypto = require('crypto');
const KeycloakService = require('./keycloak.service');

/**
 * Organization Management Service
 * Handles org registration, onboarding, and lifecycle
 */

class OrganizationService {
  /**
   * Register a new organization with owner
   * This is the signup flow
   */
  async registerOrganization(registrationData) {
    const {
      org_name,
      owner_email,
      owner_name,
      owner_password,
      legal_name,
      contact_phone,
      address,
      timezone = 'Asia/Kolkata',
      terms_accepted,
      baa_accepted
    } = registrationData;

    // Validate inputs
    if (!org_name || !owner_email || !owner_name || !owner_password) {
      throw new Error('Missing required fields');
    }

    if (!terms_accepted || !baa_accepted) {
      throw new Error('Terms and BAA must be accepted');
    }

    return await transaction(async (client) => {
      // Generate unique slug
      const baseSlug = org_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existing = await client.query(
          'SELECT id FROM organizations WHERE slug = $1',
          [slug]
        );
        if (existing.rows.length === 0) break;
        slug = `${baseSlug}-${counter++}`;
      }

      // Create organization (pending verification)
      const orgResult = await client.query(
        `INSERT INTO organizations (
          name, slug, legal_name, contact_email, contact_phone, 
          address, timezone, status, onboarding_completed, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_verification', false, '00000000-0000-0000-0000-000000000000')
        RETURNING id, name, slug, status, created_at`,
        [org_name, slug, legal_name, owner_email, contact_phone, JSON.stringify(address), timezone]
      );

      const org = orgResult.rows[0];

      // Create user in Keycloak
      const keycloakUser = await KeycloakService.createUser({
        email: owner_email,
        firstName: owner_name.split(' ')[0],
        lastName: owner_name.split(' ').slice(1).join(' '),
        password: owner_password,
        emailVerified: false,
        enabled: true,
        attributes: {
          org_id: org.id,
          org_slug: org.slug,
          location_ids: [], // Org owner has access to all locations
          permissions: [] // Will be set after role assignment
        }
      });

      // Create user in database
      const userResult = await client.query(
        `INSERT INTO users (
          email, name, keycloak_user_id, status
        )
        VALUES ($1, $2, $3, 'active')
        RETURNING id, email, name, keycloak_user_id`,
        [owner_email, owner_name, keycloakUser.id]
      );

      const user = userResult.rows[0];

      // Update org created_by
      await client.query(
        'UPDATE organizations SET created_by = $1 WHERE id = $2',
        [user.id, org.id]
      );

      // Get ORG_OWNER role
      const roleResult = await client.query(
        "SELECT id, key, permissions FROM roles WHERE key = 'ORG_OWNER' LIMIT 1"
      );

      if (roleResult.rows.length === 0) {
        throw new Error('ORG_OWNER role not found in database');
      }

      const ownerRole = roleResult.rows[0];

      // Assign ORG_OWNER role
      await client.query(
        `INSERT INTO role_assignments (
          user_id, org_id, role_id, scope, assigned_by
        )
        VALUES ($1, $2, $3, 'ORG', $4)`,
        [user.id, org.id, ownerRole.id, user.id]
      );

      // Update Keycloak user with permissions
      // PostgreSQL JSONB returns already-parsed object, not string
      const permissions = Array.isArray(ownerRole.permissions) 
        ? ownerRole.permissions 
        : JSON.parse(ownerRole.permissions);
      
      await KeycloakService.updateUserAttributes(keycloakUser.id, {
        org_id: org.id,
        org_slug: org.slug,
        location_ids: [],
        permissions: permissions
      });

      // Send verification email
      await KeycloakService.sendVerifyEmail(keycloakUser.id);

      // Create audit event
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'ORG.CREATED', 'Organization', $3, $4, 'success', $5)`,
        [org.id, user.id, org.id, org.name, JSON.stringify({ slug, owner_email })]
      );

      return {
        organization: org,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        message: 'Organization registered successfully. Please verify your email.'
      };
    });
  }

  /**
   * Update onboarding progress
   */
  async updateOnboardingStep(orgId, step, completed = false) {
    const result = await query(
      `UPDATE organizations
       SET onboarding_step = $1, 
           onboarding_completed = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, onboarding_step, onboarding_completed`,
      [step, completed, orgId]
    );

    if (result.rows.length === 0) {
      throw new Error('Organization not found');
    }

    return result.rows[0];
  }

  /**
   * Get organization details
   */
  async getOrganization(orgId) {
    const result = await query(
      `SELECT 
        o.*,
        u.name as created_by_name,
        u.email as created_by_email,
        (SELECT COUNT(*) FROM locations WHERE org_id = o.id AND active = true) as active_locations,
        (SELECT COUNT(*) FROM users u2 
         JOIN role_assignments ra ON u2.id = ra.user_id 
         WHERE ra.org_id = o.id AND u2.status = 'active' AND ra.revoked_at IS NULL) as active_users
       FROM organizations o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = $1`,
      [orgId]
    );

    if (result.rows.length === 0) {
      throw new Error('Organization not found');
    }

    return result.rows[0];
  }

  /**
   * Update organization profile
   */
  async updateOrganization(orgId, updates, updatedBy) {
    const {
      name,
      legal_name,
      contact_email,
      contact_phone,
      address,
      timezone,
      settings
    } = updates;

    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      params.push(name);
    }

    if (legal_name !== undefined) {
      updateFields.push(`legal_name = $${paramCount++}`);
      params.push(legal_name);
    }

    if (contact_email !== undefined) {
      updateFields.push(`contact_email = $${paramCount++}`);
      params.push(contact_email);
    }

    if (contact_phone !== undefined) {
      updateFields.push(`contact_phone = $${paramCount++}`);
      params.push(contact_phone);
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramCount++}`);
      params.push(JSON.stringify(address));
    }

    if (timezone !== undefined) {
      updateFields.push(`timezone = $${paramCount++}`);
      params.push(timezone);
    }

    if (settings !== undefined) {
      updateFields.push(`settings = $${paramCount++}`);
      params.push(JSON.stringify(settings));
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(orgId);

    const result = await query(
      `UPDATE organizations
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Organization not found');
    }

    // Audit log
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata
      )
      VALUES ($1, $2, 'ORG.UPDATED', 'Organization', $3, $4, 'success', $5)`,
      [orgId, updatedBy, orgId, result.rows[0].name, JSON.stringify(updates)]
    );

    return result.rows[0];
  }

  /**
   * Create a location for an organization
   */
  async createLocation(locationData, createdBy) {
    const {
      org_id,
      name,
      code,
      location_type,
      address,
      timezone = 'Asia/Kolkata',
      contact_email,
      contact_phone,
      contact_person,
      operational_hours
    } = locationData;

    return await transaction(async (client) => {
      // Check if code is unique within org
      if (code) {
        const existing = await client.query(
          'SELECT id FROM locations WHERE org_id = $1 AND code = $2',
          [org_id, code]
        );
        if (existing.rows.length > 0) {
          throw new Error('Location code already exists in this organization');
        }
      }

      const result = await client.query(
        `INSERT INTO locations (
          org_id, name, code, location_type, address, timezone,
          contact_email, contact_phone, contact_person, operational_hours
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          org_id, name, code, location_type, JSON.stringify(address),
          timezone, contact_email, contact_phone, contact_person,
          operational_hours ? JSON.stringify(operational_hours) : null
        ]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'LOCATION.CREATED', 'Location', $3, $4, 'success', $5)`,
        [org_id, createdBy, result.rows[0].id, name, JSON.stringify({ code, location_type })]
      );

      return result.rows[0];
    });
  }

  /**
   * Get all locations for an organization
   */
  async getLocations(orgId, activeOnly = false) {
    const whereClause = activeOnly ? 'AND active = true' : '';
    
    const result = await query(
      `SELECT * FROM locations 
       WHERE org_id = $1 ${whereClause}
       ORDER BY name`,
      [orgId]
    );

    return result.rows;
  }

  /**
   * Update location
   */
  async updateLocation(locationId, updates, updatedBy) {
    return await transaction(async (client) => {
      const result = await client.query(
        'SELECT org_id, name FROM locations WHERE id = $1',
        [locationId]
      );

      if (result.rows.length === 0) {
        throw new Error('Location not found');
      }

      const location = result.rows[0];
      const updateFields = [];
      const params = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          updateFields.push(`${key} = $${paramCount++}`);
          params.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
        }
      });

      if (updateFields.length === 0) {
        return location;
      }

      params.push(locationId);

      const updateResult = await client.query(
        `UPDATE locations
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING *`,
        params
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'LOCATION.UPDATED', 'Location', $3, $4, 'success', $5)`,
        [location.org_id, updatedBy, locationId, location.name, JSON.stringify(updates)]
      );

      return updateResult.rows[0];
    });
  }

  /**
   * Create department
   */
  async createDepartment(departmentData, createdBy) {
    const {
      org_id,
      location_id,
      name,
      code,
      department_type,
      head_user_id,
      description
    } = departmentData;

    return await transaction(async (client) => {
      // Check if code is unique within org/location
      if (code) {
        const existing = await client.query(
          'SELECT id FROM departments WHERE org_id = $1 AND code = $2 AND (location_id = $3 OR (location_id IS NULL AND $3 IS NULL))',
          [org_id, code, location_id || null]
        );

        if (existing.rows.length > 0) {
          throw new Error('Department code already exists in this location');
        }
      }

      // Create department
      const result = await client.query(
        `INSERT INTO departments (
          org_id, location_id, name, code, department_type,
          head_user_id, active, created_at, updated_at,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW(), $7)
        RETURNING *`,
        [
          org_id,
          location_id || null,
          name,
          code || null,
          department_type || null,
          head_user_id || null,
          JSON.stringify({ description: description || null })
        ]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'DEPARTMENT.CREATED', 'Department', $3, $4, 'success', $5)`,
        [org_id, createdBy, result.rows[0].id, name, JSON.stringify(departmentData)]
      );

      return result.rows[0];
    });
  }

  /**
   * Get departments
   */
  async getDepartments(orgId, activeOnly = false) {
    const whereClause = activeOnly ? 'AND active = true' : '';

    const result = await query(
      `SELECT
        d.*,
        l.name as location_name,
        u.name as head_name
       FROM departments d
       LEFT JOIN locations l ON d.location_id = l.id
       LEFT JOIN users u ON d.head_user_id = u.id
       WHERE d.org_id = $1 ${whereClause}
       ORDER BY d.name`,
      [orgId]
    );

    // Parse metadata JSON and add description
    return result.rows.map(row => ({
      ...row,
      description: row.metadata?.description || null
    }));
  }

  /**
   * Update department
   */
  async updateDepartment(departmentId, updates, updatedBy) {
    return await transaction(async (client) => {
      const result = await client.query(
        'SELECT org_id, name FROM departments WHERE id = $1',
        [departmentId]
      );

      if (result.rows.length === 0) {
        throw new Error('Department not found');
      }

      const department = result.rows[0];
      const updateFields = [];
      const params = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        params.push(updates.name);
      }

      if (updates.code !== undefined) {
        updateFields.push(`code = $${paramCount++}`);
        params.push(updates.code || null);
      }

      if (updates.department_type !== undefined) {
        updateFields.push(`department_type = $${paramCount++}`);
        params.push(updates.department_type || null);
      }

      if (updates.location_id !== undefined) {
        updateFields.push(`location_id = $${paramCount++}`);
        params.push(updates.location_id || null);
      }

      if (updates.head_user_id !== undefined) {
        updateFields.push(`head_user_id = $${paramCount++}`);
        params.push(updates.head_user_id || null);
      }

      if (updates.active !== undefined) {
        updateFields.push(`active = $${paramCount++}`);
        params.push(updates.active);
      }

      if (updates.description !== undefined) {
        updateFields.push(`metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{description}', $${paramCount++})`);
        params.push(JSON.stringify(updates.description));
      }

      updateFields.push(`updated_at = NOW()`);

      params.push(departmentId);
      const updateResult = await client.query(
        `UPDATE departments
         SET ${updateFields.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        params
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'DEPARTMENT.UPDATED', 'Department', $3, $4, 'success', $5)`,
        [department.org_id, updatedBy, departmentId, department.name, JSON.stringify(updates)]
      );

      const updated = updateResult.rows[0];
      return {
        ...updated,
        description: updated.metadata?.description || null
      };
    });
  }

  /**
   * Get organization theme settings
   */
  async getThemeSettings(orgId) {
    const result = await query(
      'SELECT theme_settings FROM organizations WHERE id = $1',
      [orgId]
    );

    if (result.rows.length === 0) {
      throw new Error('Organization not found');
    }

    // Return default theme if not set
    const defaultTheme = {
      primaryColor: '#4A90E2',
      secondaryColor: '#9B59B6',
      sidebarBackgroundColor: '#0F1E56',
      sidebarTextColor: '#B0B7D0',
      sidebarActiveColor: '#3342A5',
      accentColor: '#10B981',
      fontFamily: 'Inter, sans-serif',
      logoUrl: null,
      faviconUrl: null
    };

    return result.rows[0].theme_settings || defaultTheme;
  }

  /**
   * Update organization theme settings
   */
  async updateThemeSettings(orgId, themeSettings, userId) {
    // Validate theme settings
    const validColors = /^#[0-9A-Fa-f]{6}$/;
    const colorFields = [
      'primaryColor',
      'secondaryColor',
      'sidebarBackgroundColor',
      'sidebarTextColor',
      'sidebarActiveColor',
      'accentColor'
    ];

    // Validate color formats if provided
    for (const field of colorFields) {
      if (themeSettings[field] && !validColors.test(themeSettings[field])) {
        throw new Error(`Invalid color format for ${field}. Use hex format (#RRGGBB)`);
      }
    }

    // Get current theme settings
    const currentTheme = await this.getThemeSettings(orgId);
    
    // Merge with new settings
    const updatedTheme = {
      ...currentTheme,
      ...themeSettings
    };

    const result = await query(
      `UPDATE organizations 
       SET theme_settings = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING theme_settings`,
      [JSON.stringify(updatedTheme), orgId]
    );

    if (result.rows.length === 0) {
      throw new Error('Organization not found');
    }

    return result.rows[0].theme_settings;
  }
}

module.exports = new OrganizationService();
