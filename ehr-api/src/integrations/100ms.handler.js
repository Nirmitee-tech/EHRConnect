const BaseIntegrationHandler = require('./base-handler');

/**
 * 100ms Live Video Integration Handler
 * Provides video conferencing capabilities for telehealth
 */
class HundredMSHandler extends BaseIntegrationHandler {
  constructor() {
    super('100ms');
  }

  async initialize(integration) {
    await super.initialize(integration);

    // Parse credentials if they're stored as a string
    const credentials = typeof integration.credentials === 'string'
      ? JSON.parse(integration.credentials)
      : integration.credentials;

    const client = {
      appAccessKey: credentials.appId || credentials.appAccessKey, // Support both field names
      appSecret: credentials.appSecret,
      templateId: credentials.templateId || credentials.template_id,
      region: credentials.region || credentials.defaultRegion || 'us',
      apiEndpoint: credentials.apiEndpoint || 'https://api.100ms.live/v2'
    };

    this.setClient(integration.id, client);
    console.log(`✓ 100ms client initialized for ${integration.id}`, {
      hasAppId: !!client.appAccessKey,
      hasSecret: !!client.appSecret,
      templateId: client.templateId,
      region: client.region
    });
  }

  async execute(integration, operation, params) {
    let client = this.getClient(integration.id);

    // Auto-initialize if not already initialized
    if (!client) {
      console.log(`🔄 Auto-initializing 100ms client for integration ${integration.id}`);
      await this.initialize(integration);
      client = this.getClient(integration.id);

      if (!client) {
        throw new Error('100ms client not initialized');
      }
    }

    switch (operation) {
      case 'createRoom':
        return await this.createRoom(client, params);
      case 'getRoomDetails':
        return await this.getRoomDetails(client, params.roomId);
      case 'createAuthToken':
        return await this.createAuthToken(client, params);
      case 'endRoom':
        return await this.endRoom(client, params.roomId);
      case 'getActiveSessions':
        return await this.getActiveSessions(client, params.roomId);
      case 'startRecording':
        return await this.startRecording(client, params);
      case 'stopRecording':
        return await this.stopRecording(client, params.recordingId);
      case 'startLiveStream':
        return await this.startLiveStream(client, params);
      case 'stopLiveStream':
        return await this.stopLiveStream(client, params.streamId);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async testConnection(integration) {
    try {
      const client = this.getClient(integration.id);

      if (!client) {
        console.log('Client not initialized, attempting to initialize...');
        await this.initialize(integration);
        return true;
      }

      console.log('Testing 100ms connection...');

      const managementToken = this.generateManagementToken(client);
      const response = await fetch('https://api.100ms.live/v2/rooms?limit=1', {
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('100ms connection test failed:', response.status, await response.text());
        return false;
      }

      console.log('✅ 100ms connection test successful');
      return true;
    } catch (error) {
      console.error('100ms connection test failed:', error);
      return false;
    }
  }

  async createRoom(client, params) {
    console.log('Creating 100ms room:', params);

    const managementToken = this.generateManagementToken(client);

    const payload = {
      name: params.name,
      description: params.description || '',
      region: client.region
    };

    // Add template_id if provided
    if (client.templateId) {
      payload.template_id = client.templateId;
    }

    console.log('100ms createRoom payload:', payload);

    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms createRoom failed:', response.status, errorText);
      throw new Error(`Failed to create room: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ 100ms room created:', result.id);
    return result;
  }

  async getRoomDetails(client, roomId) {
    console.log('Fetching 100ms room details:', roomId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms getRoomDetails failed:', response.status, errorText);
      throw new Error(`Failed to get room details: ${response.status}`);
    }

    return await response.json();
  }

  async createAuthToken(client, params) {
    console.log('Creating 100ms auth token:', params);

    const jwt = require('jsonwebtoken');

    const payload = {
      access_key: client.appAccessKey,
      room_id: params.roomId,
      user_id: params.userId,
      role: params.role, // host, guest, viewer
      type: 'app',
      version: 2
    };

    const token = jwt.sign(payload, client.appSecret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: `${Date.now()}`
    });

    console.log('✅ 100ms auth token created for user:', params.userId);

    return {
      token,
      room_id: params.roomId,
      user_id: params.userId,
      role: params.role
    };
  }

  async endRoom(client, roomId) {
    console.log('Ending 100ms room:', roomId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/active-rooms/${roomId}/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Meeting ended by host'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms endRoom failed:', response.status, errorText);
      // Don't throw error if room is already ended
      if (response.status !== 404) {
        throw new Error(`Failed to end room: ${response.status}`);
      }
    }

    console.log('✅ 100ms room ended:', roomId);

    return {
      success: true,
      message: 'Room ended successfully'
    };
  }

  async getActiveSessions(client, roomId) {
    console.log('Fetching active sessions for room:', roomId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/active-rooms/${roomId}/sessions`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms getActiveSessions failed:', response.status, errorText);
      return {
        room_id: roomId,
        sessions: [],
        total: 0
      };
    }

    const result = await response.json();
    return {
      room_id: roomId,
      sessions: result.data || [],
      total: result.data?.length || 0
    };
  }

  async startRecording(client, params) {
    console.log('Starting recording for room:', params.roomId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/recordings/room/${params.roomId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_url: params.meetingUrl,
        resolution: params.resolution || { width: 1280, height: 720 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms startRecording failed:', response.status, errorText);
      throw new Error(`Failed to start recording: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 100ms recording started:', result.id);
    return result;
  }

  async stopRecording(client, recordingId) {
    console.log('Stopping recording:', recordingId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms stopRecording failed:', response.status, errorText);
      throw new Error(`Failed to stop recording: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 100ms recording stopped:', recordingId);
    return result;
  }

  async startLiveStream(client, params) {
    console.log('Starting live stream for room:', params.roomId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/live-streams/room/${params.roomId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_url: params.meetingUrl,
        rtmp_urls: params.rtmpUrls || []
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms startLiveStream failed:', response.status, errorText);
      throw new Error(`Failed to start live stream: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 100ms live stream started:', result.id);
    return result;
  }

  async stopLiveStream(client, streamId) {
    console.log('Stopping live stream:', streamId);

    const managementToken = this.generateManagementToken(client);

    const response = await fetch(`https://api.100ms.live/v2/live-streams/${streamId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('100ms stopLiveStream failed:', response.status, errorText);
      throw new Error(`Failed to stop live stream: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 100ms live stream stopped:', streamId);
    return result;
  }

  generateManagementToken(client) {
    const jwt = require('jsonwebtoken');
    const uuid = require('uuid');

    const payload = {
      access_key: client.appAccessKey,
      type: 'management',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(payload, client.appSecret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: uuid.v4()
    });

    return token;
  }
}

module.exports = new HundredMSHandler();
