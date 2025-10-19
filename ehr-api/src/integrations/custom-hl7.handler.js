const BaseIntegrationHandler = require('./base-handler');

/**
 * Custom HL7 Integration Handler
 * Supports HL7 v2.x message parsing, generation, and field mapping
 */
class CustomHL7Handler extends BaseIntegrationHandler {
  constructor() {
    super('custom-hl7');
  }

  async initialize(integration) {
    await super.initialize(integration);

    const client = {
      endpointUrl: integration.credentials.endpointUrl || integration.apiEndpoint,
      protocol: integration.credentials.protocol || 'mllp', // mllp, http, https
      port: integration.credentials.port || 2575,
      hl7Version: integration.credentials.hl7Version || '2.5.1',
      authMethod: integration.credentials.authMethod, // none, basic, token
      username: integration.credentials.username,
      password: integration.credentials.password,
      token: integration.credentials.token,
      messageTypes: integration.credentials.messageTypes || ['ADT', 'ORM', 'ORU'], // Supported message types
      // Field mappings stored in integration.usage_mappings
      fieldMappings: integration.usageMappings || []
    };

    this.setClient(integration.id, client);
    console.log(`✓ Custom HL7 client initialized for ${integration.id}`);
  }

  async execute(integration, operation, params) {
    const client = this.getClient(integration.id);

    if (!client) {
      throw new Error('Custom HL7 client not initialized');
    }

    switch (operation) {
      case 'sendMessage':
        return await this.sendMessage(client, params);
      case 'parseMessage':
        return await this.parseMessage(client, params.hl7Message);
      case 'generateMessage':
        return await this.generateMessage(client, params);
      case 'validateMessage':
        return await this.validateMessage(client, params.hl7Message);
      case 'applyMapping':
        return await this.applyMapping(client, params);
      case 'testMapping':
        return await this.testMapping(client, params);
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

      console.log('Testing Custom HL7 connection...');

      if (client.protocol === 'http' || client.protocol === 'https') {
        // In production: Test HTTP endpoint
        // const response = await fetch(client.endpointUrl, {
        //   method: 'GET',
        //   headers: this.getAuthHeaders(client)
        // });
        // return response.ok;
      } else if (client.protocol === 'mllp') {
        // In production: Test MLLP connection
        // const net = require('net');
        // const socket = new net.Socket();
        // return new Promise((resolve) => {
        //   socket.connect(client.port, client.endpointUrl, () => {
        //     socket.end();
        //     resolve(true);
        //   });
        //   socket.on('error', () => resolve(false));
        // });
      }

      return true; // Simulated success
    } catch (error) {
      console.error('Custom HL7 connection test failed:', error);
      return false;
    }
  }

  async sendMessage(client, params) {
    console.log('Sending HL7 message:', params.messageType);

    // Apply field mappings before sending
    let hl7Message = params.hl7Message;
    if (params.applyMapping && client.fieldMappings.length > 0) {
      hl7Message = await this.applyMapping(client, {
        sourceData: params.sourceData,
        messageType: params.messageType
      });
    }

    // In production:
    if (client.protocol === 'mllp') {
      // const net = require('net');
      // const MLLP_START = String.fromCharCode(0x0B);
      // const MLLP_END = String.fromCharCode(0x1C, 0x0D);
      // const socket = new net.Socket();
      //
      // return new Promise((resolve, reject) => {
      //   socket.connect(client.port, client.endpointUrl, () => {
      //     const mllpMessage = MLLP_START + hl7Message + MLLP_END;
      //     socket.write(mllpMessage);
      //   });
      //
      //   socket.on('data', (data) => {
      //     const response = data.toString().replace(/[\x0B\x1C\x0D]/g, '');
      //     socket.end();
      //     resolve(this.parseMessage(client, response));
      //   });
      //
      //   socket.on('error', (err) => {
      //     socket.destroy();
      //     reject(err);
      //   });
      // });
    } else if (client.protocol === 'http' || client.protocol === 'https') {
      // const response = await fetch(client.endpointUrl, {
      //   method: 'POST',
      //   headers: {
      //     ...this.getAuthHeaders(client),
      //     'Content-Type': 'text/plain'
      //   },
      //   body: hl7Message
      // });
      // const responseMessage = await response.text();
      // return this.parseMessage(client, responseMessage);
    }

    // Mock response
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      acknowledgment: 'AA', // AA = Application Accept
      sentAt: new Date().toISOString(),
      response: this.generateAckMessage(params.messageType)
    };
  }

  async parseMessage(client, hl7Message) {
    console.log('Parsing HL7 message...');

    // Remove MLLP framing characters if present
    const cleanMessage = hl7Message.replace(/[\x0B\x1C\x0D]/g, '');

    // Split into segments
    const segments = cleanMessage.split(/\r\n|\r|\n/).filter(s => s.trim());

    if (segments.length === 0) {
      throw new Error('Invalid HL7 message: no segments found');
    }

    // Parse MSH (Message Header) segment
    const mshSegment = segments[0];
    const fieldSeparator = mshSegment[3];
    const encodingChars = mshSegment.substring(4, 8);

    const componentSeparator = encodingChars[0];
    const repetitionSeparator = encodingChars[1];
    const escapeChar = encodingChars[2];
    const subComponentSeparator = encodingChars[3];

    // Parse all segments
    const parsedSegments = segments.map(segment => {
      const fields = segment.split(fieldSeparator);
      const segmentType = fields[0];

      return {
        segmentType,
        fields: fields.slice(1).map((field, index) => ({
          fieldNumber: index + 1,
          value: field,
          components: field.split(componentSeparator).map(comp => ({
            value: comp,
            subComponents: comp.split(subComponentSeparator)
          }))
        }))
      };
    });

    const msh = parsedSegments[0];

    // Extract common fields
    const messageType = msh.fields[7]?.value || 'Unknown'; // MSH-9
    const messageControlId = msh.fields[8]?.value || ''; // MSH-10
    const sendingApplication = msh.fields[1]?.value || ''; // MSH-3
    const sendingFacility = msh.fields[2]?.value || ''; // MSH-4
    const receivingApplication = msh.fields[3]?.value || ''; // MSH-5
    const receivingFacility = msh.fields[4]?.value || ''; // MSH-6
    const timestamp = msh.fields[5]?.value || ''; // MSH-7

    return {
      rawMessage: cleanMessage,
      messageType,
      messageControlId,
      sendingApplication,
      sendingFacility,
      receivingApplication,
      receivingFacility,
      timestamp,
      version: client.hl7Version,
      segments: parsedSegments,
      delimiters: {
        field: fieldSeparator,
        component: componentSeparator,
        repetition: repetitionSeparator,
        escape: escapeChar,
        subComponent: subComponentSeparator
      }
    };
  }

  async generateMessage(client, params) {
    console.log('Generating HL7 message:', params.messageType);

    const now = new Date();
    const timestamp = this.formatHL7DateTime(now);
    const messageControlId = params.messageControlId || `${Date.now()}`;

    // Field separator and encoding characters
    const fieldSep = '|';
    const compSep = '^';
    const repSep = '~';
    const escapeChar = '\\';
    const subCompSep = '&';
    const encodingChars = `${compSep}${repSep}${escapeChar}${subCompSep}`;

    // Build MSH segment
    const msh = [
      'MSH',
      encodingChars,
      params.sendingApplication || 'EHRConnect',
      params.sendingFacility || 'EHR',
      params.receivingApplication || params.receivingSystem || 'External',
      params.receivingFacility || 'EXT',
      timestamp,
      '',
      params.messageType || 'ADT^A01',
      messageControlId,
      params.processingId || 'P', // P = Production, T = Test
      client.hl7Version
    ].join(fieldSep);

    // Build additional segments based on message type
    const segments = [msh];

    // Apply data mappings if provided
    if (params.data && client.fieldMappings.length > 0) {
      const mappedSegments = this.generateSegmentsFromMapping(
        client,
        params.data,
        params.messageType,
        { fieldSep, compSep, repSep, subCompSep }
      );
      segments.push(...mappedSegments);
    } else if (params.segments) {
      // Use provided segments
      segments.push(...params.segments);
    }

    const hl7Message = segments.join('\r');

    return {
      hl7Message,
      messageType: params.messageType,
      messageControlId,
      timestamp,
      segments: segments.length
    };
  }

  async validateMessage(client, hl7Message) {
    console.log('Validating HL7 message...');

    try {
      const parsed = await this.parseMessage(client, hl7Message);

      const errors = [];
      const warnings = [];

      // Check required segments
      if (!parsed.segments.find(s => s.segmentType === 'MSH')) {
        errors.push('Missing required MSH segment');
      }

      // Validate message type is supported
      const messageType = parsed.messageType.split('^')[0];
      if (!client.messageTypes.includes(messageType)) {
        warnings.push(`Message type ${messageType} not in configured supported types`);
      }

      // Check for empty required fields in MSH
      if (!parsed.messageControlId) {
        errors.push('MSH-10 (Message Control ID) is required');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        parsedMessage: parsed
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }

  async applyMapping(client, params) {
    console.log('Applying field mappings...');

    const { sourceData, messageType } = params;

    // Filter mappings for this message type
    const relevantMappings = client.fieldMappings.filter(
      mapping => !mapping.messageType || mapping.messageType === messageType
    );

    // Generate HL7 message with mapped fields
    const segments = this.generateSegmentsFromMapping(
      client,
      sourceData,
      messageType,
      { fieldSep: '|', compSep: '^', repSep: '~', subCompSep: '&' }
    );

    return {
      mappedData: segments,
      mappingsApplied: relevantMappings.length,
      messageType
    };
  }

  async testMapping(client, params) {
    console.log('Testing field mapping...');

    const { mapping, sampleData } = params;

    try {
      // Apply single mapping to sample data
      const result = this.applyFieldMapping(mapping, sampleData);

      return {
        success: true,
        mapping,
        sampleData,
        result,
        hl7Field: mapping.hl7Field,
        transformedValue: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        mapping,
        sampleData
      };
    }
  }

  // Helper methods

  generateSegmentsFromMapping(client, sourceData, messageType, delimiters) {
    const segments = {};
    const { fieldSep, compSep, repSep, subCompSep } = delimiters;

    // Process each mapping
    for (const mapping of client.fieldMappings) {
      if (mapping.messageType && mapping.messageType !== messageType) {
        continue;
      }

      const value = this.applyFieldMapping(mapping, sourceData);

      if (value === null || value === undefined) {
        continue;
      }

      // Parse HL7 field location (e.g., "PID-3.1" or "PV1-2")
      const [segmentType, fieldLocation] = mapping.hl7Field.split('-');

      if (!segments[segmentType]) {
        segments[segmentType] = { type: segmentType, fields: {} };
      }

      segments[segmentType].fields[fieldLocation] = value;
    }

    // Convert segment objects to HL7 format
    return Object.values(segments).map(segment => {
      const fields = [];
      const maxField = Math.max(...Object.keys(segment.fields).map(k => parseInt(k.split('.')[0])));

      for (let i = 1; i <= maxField; i++) {
        const fieldKey = Object.keys(segment.fields).find(k => k.startsWith(`${i}.`) || k === `${i}`);
        fields.push(fieldKey ? segment.fields[fieldKey] : '');
      }

      return `${segment.type}${fieldSep}${fields.join(fieldSep)}`;
    });
  }

  applyFieldMapping(mapping, sourceData) {
    // Get source value using JSONPath or dot notation
    let value = this.getValueFromPath(sourceData, mapping.sourcePath);

    // Apply transformation if specified
    if (mapping.transform) {
      value = this.applyTransform(value, mapping.transform);
    }

    return value;
  }

  getValueFromPath(data, path) {
    // Simple dot notation path resolver
    const parts = path.split('.');
    let current = data;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return null;
      }
      current = current[part];
    }

    return current;
  }

  applyTransform(value, transform) {
    switch (transform.type) {
      case 'uppercase':
        return value?.toString().toUpperCase();
      case 'lowercase':
        return value?.toString().toLowerCase();
      case 'date':
        return this.formatHL7Date(new Date(value));
      case 'datetime':
        return this.formatHL7DateTime(new Date(value));
      case 'phone':
        return value?.replace(/\D/g, ''); // Remove non-digits
      case 'concat':
        return transform.fields.map(f => this.getValueFromPath(value, f)).join(transform.separator || ' ');
      case 'static':
        return transform.value;
      case 'lookup':
        return transform.map[value] || value;
      default:
        return value;
    }
  }

  formatHL7Date(date) {
    return date.toISOString().replace(/[-:]/g, '').split('T')[0];
  }

  formatHL7DateTime(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');
  }

  generateAckMessage(messageType) {
    const timestamp = this.formatHL7DateTime(new Date());
    const controlId = `ACK${Date.now()}`;

    return [
      `MSH|^~\\&|EHRConnect|EHR|External|EXT|${timestamp}||ACK|${controlId}|P|2.5.1`,
      `MSA|AA|${controlId}`
    ].join('\r');
  }

  getAuthHeaders(client) {
    const headers = {
      'Content-Type': 'text/plain'
    };

    if (client.authMethod === 'basic' && client.username && client.password) {
      const credentials = Buffer.from(`${client.username}:${client.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (client.authMethod === 'token' && client.token) {
      headers['Authorization'] = `Bearer ${client.token}`;
    }

    return headers;
  }
}

module.exports = new CustomHL7Handler();
