const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

/**
 * Socket.IO Service for Real-time Permission Updates
 */

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map of userId -> Set of socket IDs
    this.orgRooms = new Map(); // Map of orgId -> Set of socket IDs
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io/',
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        const isPublicWidget = socket.handshake.auth.publicWidget === true;
        const orgId = socket.handshake.auth.orgId;

        // Allow public widget connections without authentication
        if (isPublicWidget && orgId) {
          socket.isPublic = true;
          socket.orgId = orgId;
          socket.userId = null;
          console.log(`Public widget connection for org: ${orgId}`);
          return next();
        }

        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token (adjust based on your auth setup)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        socket.userId = decoded.userId || decoded.sub;
        socket.orgId = decoded.orgId || decoded.org_id;
        socket.email = decoded.email;
        socket.isPublic = false;

        if (!socket.userId || !socket.orgId) {
          return next(new Error('Invalid token: missing user or org context'));
        }

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      const connectionType = socket.isPublic ? 'Public Widget' : 'Authenticated User';
      console.log(`Socket connected: ${socket.id} (Type: ${connectionType}, User: ${socket.userId || 'N/A'}, Org: ${socket.orgId})`);

      // Track user socket connections (only for authenticated users)
      if (socket.userId) {
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, new Set());
        }
        this.userSockets.get(socket.userId).add(socket.id);
      }

      // Join org room for org-wide broadcasts
      const orgRoom = `org:${socket.orgId}`;
      socket.join(orgRoom);

      // Track org room membership
      if (!this.orgRooms.has(socket.orgId)) {
        this.orgRooms.set(socket.orgId, new Set());
      }
      this.orgRooms.get(socket.orgId).add(socket.id);

      // Join user-specific room for direct notifications (only for authenticated users)
      if (socket.userId) {
        const userRoom = `user:${socket.userId}`;
        socket.join(userRoom);
      }

      // Send welcome message
      if (socket.isPublic) {
        socket.emit('connected', {
          message: 'Connected to booking widget real-time service',
          orgId: socket.orgId,
        });
      } else {
        socket.emit('connected', {
          message: 'Connected to permission update service',
          userId: socket.userId,
          orgId: socket.orgId,
        });
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id} (User: ${socket.userId})`);

        // Remove from user sockets
        const userSocketSet = this.userSockets.get(socket.userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(socket.userId);
          }
        }

        // Remove from org rooms
        const orgSocketSet = this.orgRooms.get(socket.orgId);
        if (orgSocketSet) {
          orgSocketSet.delete(socket.id);
          if (orgSocketSet.size === 0) {
            this.orgRooms.delete(socket.orgId);
          }
        }
      });

      // Handle ping/pong for connection monitoring
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle permission refresh request
      socket.on('refresh-permissions', async () => {
        socket.emit('permissions-refresh-requested', {
          message: 'Permission refresh initiated',
        });
      });
    });

    console.log('Socket.IO service initialized');
  }

  /**
   * Broadcast permission update to specific user
   */
  notifyUserPermissionChange(userId, changeData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const userRoom = `user:${userId}`;
    this.io.to(userRoom).emit('permission-changed', {
      type: 'user_permission_change',
      userId,
      changeData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified user ${userId} of permission change`);
  }

  /**
   * Broadcast permission update to multiple users
   */
  notifyUsersPermissionChange(userIds, changeData) {
    if (!this.io || !Array.isArray(userIds)) {
      return;
    }

    userIds.forEach(userId => {
      this.notifyUserPermissionChange(userId, changeData);
    });

    console.log(`Notified ${userIds.length} users of permission change`);
  }

  /**
   * Broadcast role update to entire organization
   */
  notifyOrgRoleChange(orgId, changeData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('role-changed', {
      type: 'org_role_change',
      orgId,
      changeData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified org ${orgId} of role change`);
  }

  /**
   * Broadcast role assignment change
   */
  notifyRoleAssignment(userId, orgId, changeData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    // Notify the specific user
    this.notifyUserPermissionChange(userId, {
      type: 'role_assignment',
      ...changeData,
    });

    // Also notify admins in the org
    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('role-assignment-changed', {
      type: 'role_assignment_change',
      userId,
      orgId,
      changeData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified role assignment change for user ${userId} in org ${orgId}`);
  }

  /**
   * Broadcast role revocation
   */
  notifyRoleRevocation(userId, orgId, changeData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    // Notify the specific user
    this.notifyUserPermissionChange(userId, {
      type: 'role_revocation',
      ...changeData,
    });

    // Also notify admins
    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('role-revocation', {
      type: 'role_revocation',
      userId,
      orgId,
      changeData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified role revocation for user ${userId} in org ${orgId}`);
  }

  /**
   * Send custom notification to user
   */
  notifyUser(userId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const userRoom = `user:${userId}`;
    this.io.to(userRoom).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send custom notification to organization
   */
  notifyOrg(orgId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      totalConnections: this.io ? this.io.sockets.sockets.size : 0,
      uniqueUsers: this.userSockets.size,
      organizations: this.orgRooms.size,
      userConnections: Array.from(this.userSockets.entries()).map(([userId, sockets]) => ({
        userId,
        socketCount: sockets.size,
      })),
    };
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }

  /**
   * ========================================
   * APPOINTMENT BOOKING REAL-TIME EVENTS
   * ========================================
   */

  /**
   * Notify organization about appointment created
   * This refreshes slot availability in booking widgets
   */
  notifyAppointmentCreated(orgId, appointmentData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('appointment:created', {
      type: 'appointment_created',
      orgId,
      appointment: appointmentData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified org ${orgId} of new appointment creation`);
  }

  /**
   * Notify organization about appointment updated
   */
  notifyAppointmentUpdated(orgId, appointmentData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('appointment:updated', {
      type: 'appointment_updated',
      orgId,
      appointment: appointmentData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified org ${orgId} of appointment update`);
  }

  /**
   * Notify organization about appointment cancelled
   */
  notifyAppointmentCancelled(orgId, appointmentData) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('appointment:cancelled', {
      type: 'appointment_cancelled',
      orgId,
      appointment: appointmentData,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified org ${orgId} of appointment cancellation`);
  }

  /**
   * Notify organization to refresh slots for a specific date
   * This is more efficient than full refresh
   */
  notifySlotsChanged(orgId, date, practitionerId = null) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const orgRoom = `org:${orgId}`;
    this.io.to(orgRoom).emit('slots:changed', {
      type: 'slots_changed',
      orgId,
      date,
      practitionerId,
      timestamp: new Date().toISOString(),
    });

    console.log(`Notified org ${orgId} of slot changes for date ${date}`);
  }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;
