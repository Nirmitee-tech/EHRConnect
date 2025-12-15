const BaseIntegrationHandler = require('./base-handler');
const crypto = require('crypto');
const axios = require('axios');

/**
 * ABDM (Ayushman Bharat Digital Mission) Integration Handler
 * Handles ABHA enrollment, authentication, and health data exchange
 */
class ABDMHandler extends BaseIntegrationHandler {
  constructor() {
    super('abdm');
    this.baseURL = 'https://abhasbx.abdm.gov.in';
    this.gatewayURL = 'https://dev.abdm.gov.in';
  }

  async initialize(integration) {
    await super.initialize(integration);

    const client = {
      clientId: integration.credentials.clientId,
      clientSecret: integration.credentials.clientSecret,
      xCmId: integration.credentials.xCmId || 'sbx',
      publicKey: integration.credentials.publicKey,
      environment: integration.credentials.environment || 'sandbox',
      accessToken: null,
      tokenExpiresAt: null
    };

    this.setClient(integration.id, client);
    console.log(`✓ ABDM client initialized for ${integration.id}`);
  }

  /**
   * Get or refresh access token
   */
  async getAccessToken(integrationId) {
    const client = this.getClient(integrationId);

    if (!client) {
      throw new Error('ABDM client not initialized');
    }

    // Check if token is still valid (with 5 min buffer)
    if (client.accessToken && client.tokenExpiresAt && Date.now() < client.tokenExpiresAt - 300000) {
      return client.accessToken;
    }

    // Get new token
    const response = await axios.post(
      `${this.gatewayURL}/api/hiecm/gateway/v3/sessions`,
      {
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        grantType: 'client_credentials'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp(),
          'X-CM-ID': client.xCmId
        }
      }
    );

    client.accessToken = response.data.accessToken;
    client.tokenExpiresAt = Date.now() + (response.data.expiresIn || 600) * 1000;

    return client.accessToken;
  }

  /**
   * Get ABDM public certificate for encryption
   */
  async getPublicCertificate(integrationId) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.get(
      `${this.baseURL}/abha/api/v3/profile/public/certificate`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Certificate API Response Type:', typeof response.data);
    console.log('Certificate API Response:', JSON.stringify(response.data).substring(0, 200));

    // Extract certificate string from response
    let certificateString;

    if (typeof response.data === 'string') {
      certificateString = response.data;
    } else if (typeof response.data === 'object') {
      // Try common property names
      certificateString = response.data.certificate ||
                         response.data.publicKey ||
                         response.data.key ||
                         response.data.data;

      if (!certificateString) {
        console.error('Could not find certificate in response. Keys:', Object.keys(response.data));
        throw new Error('Certificate not found in API response. Expected string or object with certificate property.');
      }
    } else {
      throw new Error('Unexpected certificate response format');
    }

    // Ensure it's a string
    if (typeof certificateString !== 'string') {
      throw new Error('Certificate must be a string');
    }

    // Update public key in client
    client.publicKey = certificateString;
    console.log('✓ Public key fetched and stored');
    return certificateString;
  }

  /**
   * Encrypt data using ABDM public key (RSA/ECB/OAEPWithSHA-1AndMGF1Padding)
   */
  encryptData(data, publicKey) {
    // Remove whitespace from base64 key
    const publicKeyBase64 = publicKey.replace(/\s+/g, '');

    // Convert Base64 to PEM format
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----
${publicKeyBase64.match(/.{1,64}/g).join('\n')}
-----END PUBLIC KEY-----`;

    // Encrypt using RSA-OAEP with SHA-1
    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha1'
      },
      Buffer.from(data, 'utf8')
    );

    return encryptedBuffer.toString('base64');
  }

  async execute(integration, operation, params) {
    const client = this.getClient(integration.id);

    if (!client) {
      throw new Error('ABDM client not initialized');
    }

    switch (operation) {
      case 'sendOtp':
        return await this.sendOtp(integration.id, params);
      case 'verifyOtpAndEnroll':
        return await this.verifyOtpAndEnroll(integration.id, params);
      case 'sendMobileOtp':
        return await this.sendMobileOtp(integration.id, params);
      case 'verifyMobileOtp':
        return await this.verifyMobileOtp(integration.id, params);
      case 'getAddressSuggestions':
        return await this.getAddressSuggestions(integration.id, params);
      case 'setAbhaAddress':
        return await this.setAbhaAddress(integration.id, params);
      case 'getPublicCertificate':
        return await this.getPublicCertificate(integration.id);
      case 'getProfile':
        return await this.getProfile(integration.id, params);
      case 'downloadAbhaCard':
        return await this.downloadAbhaCard(integration.id, params);
      case 'sendEmailVerification':
        return await this.sendEmailVerification(integration.id, params);
      case 'loginWithAbhaAddress':
        return await this.loginWithAbhaAddress(integration.id, params);
      case 'verifyLoginOtp':
        return await this.verifyLoginOtp(integration.id, params);
      // ABHA Verification operations
      case 'sendAuthOtpViaAadhaar':
        return await this.sendAuthOtpViaAadhaar(integration.id, params);
      case 'verifyAuthOtpViaAadhaar':
        return await this.verifyAuthOtpViaAadhaar(integration.id, params);
      case 'sendAuthOtpViaAbhaAadhaar':
        return await this.sendAuthOtpViaAbhaAadhaar(integration.id, params);
      case 'verifyAuthOtpViaAbhaAadhaar':
        return await this.verifyAuthOtpViaAbhaAadhaar(integration.id, params);
      case 'sendAuthOtpViaAbhaNumber':
        return await this.sendAuthOtpViaAbhaNumber(integration.id, params);
      case 'verifyAuthOtpViaAbhaNumber':
        return await this.verifyAuthOtpViaAbhaNumber(integration.id, params);
      case 'verifyViaPassword':
        return await this.verifyViaPassword(integration.id, params);
      case 'sendAuthOtpViaMobile':
        return await this.sendAuthOtpViaMobile(integration.id, params);
      case 'verifyAuthOtpViaMobile':
        return await this.verifyAuthOtpViaMobile(integration.id, params);
      case 'verifyUser':
        return await this.verifyUser(integration.id, params);
      // Search ABHA accounts
      case 'searchAbhaByMobile':
        return await this.searchAbhaByMobile(integration.id, params);
      case 'searchAbhaByAbhaNumber':
        return await this.searchAbhaByAbhaNumber(integration.id, params);
      case 'searchAbhaByAbhaAddress':
        return await this.searchAbhaByAbhaAddress(integration.id, params);
      case 'searchAbhaByAadhaar':
        return await this.searchAbhaByAadhaar(integration.id, params);
      // Search-based authentication flows
      case 'sendSearchOtpViaMobile':
        return await this.sendSearchOtpViaMobile(integration.id, params);
      case 'sendSearchOtpViaAadhaar':
        return await this.sendSearchOtpViaAadhaar(integration.id, params);
      case 'verifySearchOtpViaMobile':
        return await this.verifySearchOtpViaMobile(integration.id, params);
      case 'verifySearchOtpViaAadhaar':
        return await this.verifySearchOtpViaAadhaar(integration.id, params);
      case 'sendSearchBioFingerprint':
        return await this.sendSearchBioFingerprint(integration.id, params);
      case 'sendSearchBioFace':
        return await this.sendSearchBioFace(integration.id, params);
      case 'sendSearchBioIris':
        return await this.sendSearchBioIris(integration.id, params);
      case 'verifySearchBioFingerprint':
        return await this.verifySearchBioFingerprint(integration.id, params);
      case 'verifySearchBioFace':
        return await this.verifySearchBioFace(integration.id, params);
      case 'verifySearchBioIris':
        return await this.verifySearchBioIris(integration.id, params);
      case 'getQRCode':
        return await this.getQRCode(integration.id, params);
      case 'updateProfilePhoto':
        return await this.updateProfilePhoto(integration.id, params);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Send OTP to Aadhaar registered mobile
   */
  async sendOtp(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt Aadhaar number
    const encryptedAadhaar = this.encryptData(params.aadhaar, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/enrollment/request/otp`,
      {
        scope: ['abha-enrol'],
        loginHint: 'aadhaar',
        loginId: encryptedAadhaar,
        otpSystem: 'aadhaar'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Verify OTP and create ABHA account
   */
  async verifyOtpAndEnroll(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      console.log('Public key not found, fetching from ABDM...');
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt OTP
    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/enrollment/enrol/byAadhaar`,
      {
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp,
            mobile: params.mobile
          }
        },
        consent: {
          code: 'abha-enrollment',
          version: '1.4'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('ABDM enrollment response keys:', Object.keys(response.data));
    console.log('ABDM enrollment - has txnId:', !!response.data.txnId);
    console.log('ABDM enrollment - has tToken:', !!response.data.tokens?.tToken);

    return response.data;
  }

  /**
   * Send OTP to mobile for verification
   * Per official ABDM Postman collection: uses /enrollment/request/otp with txnId in body
   */
  async sendMobileOtp(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      console.log('Public key not found, fetching from ABDM...');
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt mobile number
    const encryptedMobile = this.encryptData(params.mobile, client.publicKey);

    const requestBody = {
      scope: ['abha-enrol', 'mobile-verify'],
      loginHint: 'mobile',
      loginId: encryptedMobile,
      otpSystem: 'abdm'
    };

    // Add txnId if provided (required for mobile updates)
    if (params.txnId) {
      requestBody.txnId = params.txnId;
      console.log('Sending mobile OTP with txnId (mobile update flow)');
    } else {
      console.log('Sending mobile OTP without txnId (initial mobile verification)');
    }

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/enrollment/request/otp`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Verify mobile OTP
   * Per official ABDM Postman collection: uses /enrollment/auth/byAbdm
   */
  async verifyMobileOtp(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      console.log('Public key not found, fetching from ABDM...');
      await this.getPublicCertificate(integrationId);
    }

    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/enrollment/auth/byAbdm`,
      {
        scope: params.scope || ['abha-enrol', 'mobile-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            timeStamp: this.generateTimestamp(),
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Get ABHA address suggestions
   * Per ABDM: uses Transaction_Id header (not T-Token)
   */
  async getAddressSuggestions(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.get(
      `${this.baseURL}/abha/api/v3/enrollment/enrol/suggestion`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Transaction_Id': params.txnId,
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('ABDM address suggestions response:', JSON.stringify(response.data, null, 2));

    // ABDM returns suggestions in abhaAddressList or similar field
    // Extract array from response
    const suggestions = response.data.abhaAddressList ||
                       response.data.suggestions ||
                       response.data.phrAddress ||
                       (Array.isArray(response.data) ? response.data : []);

    return {
      success: true,
      suggestions: suggestions
    };
  }

  /**
   * Set ABHA address
   */
  async setAbhaAddress(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/enrollment/enrol/abha-address`,
      {
        txnId: params.txnId,
        abhaAddress: params.abhaAddress,
        preferred: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Get ABHA profile details
   */
  async getProfile(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.get(
      `${this.baseURL}/abha/api/v3/profile/account`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${params.xToken}`,
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Download ABHA card
   * Note: ABDM sandbox may not support card download for all test accounts
   */
  async downloadAbhaCard(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    // Per user's working CURL: /abha-card endpoint works WITHOUT Accept header
    const endpoint = `${this.baseURL}/abha/api/v3/profile/account/abha-card`;

    console.log(`Attempting to download ABHA card from:`, endpoint);

    try {
      const response = await axios.get(
        endpoint,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-token': `Bearer ${params.xToken}`,
            'REQUEST-ID': this.generateRequestId(),
            'TIMESTAMP': this.generateTimestamp()
            // NOTE: No Accept header - ABDM returns 406 if Accept header is present
          },
          responseType: 'arraybuffer'
        }
      );

      console.log(`✓ ABHA card download successful:`, response.status);
      console.log(`✓ Content-Type:`, response.headers['content-type']);
      console.log(`✓ Response data length:`, response.data.length, 'bytes');

      // Detect content type from response
      const contentType = response.headers['content-type'] || 'application/pdf';
      const format = contentType.includes('png') ? 'png' : 'pdf';

      // Convert to base64
      const cardBase64 = Buffer.from(response.data).toString('base64');
      console.log(`✓ Base64 encoded length:`, cardBase64.length, 'characters');
      console.log(`✓ Base64 preview (first 100 chars):`, cardBase64.substring(0, 100));

      // Return base64 encoded card
      return {
        card: cardBase64,
        contentType: contentType,
        format: format
      };
    } catch (error) {
      console.error(`✗ ABHA card download failed:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  /**
   * Send email verification link
   * Uses /profile/account/request/emailVerificationLink with X-Token
   */
  async sendEmailVerification(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      console.log('Public key not found, fetching from ABDM...');
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt email
    const encryptedEmail = this.encryptData(params.email, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/account/request/emailVerificationLink`,
      {
        scope: ['abha-profile', 'email-link-verify'],
        loginHint: 'email',
        loginId: encryptedEmail,
        otpSystem: 'abdm'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${params.xToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Login with ABHA Address (send OTP)
   */
  async loginWithAbhaAddress(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    // According to ABDM docs, loginHint should be 'phr-address' for ABHA address login
    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-profile'],
        loginHint: 'phr-address',  // Changed from 'abha-address' to 'phr-address'
        loginId: params.abhaAddress,
        otpSystem: 'abdm'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Login with ABHA address response:', response.data);
    return response.data;
  }

  /**
   * Verify login OTP and get Auth token
   */
  async verifyLoginOtp(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt OTP
    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-profile'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * ABHA Verification APIs
   */

  /**
   * Verify Via ABHA Number - Using Aadhaar OTP (Send OTP)
   * This authenticates an existing ABHA account using Aadhaar OTP system
   */
  async sendAuthOtpViaAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available for encryption
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt Aadhaar number
    const encryptedAadhaar = this.encryptData(params.aadhaar, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'aadhaar-verify'],
        loginHint: 'aadhaar',
        loginId: encryptedAadhaar,
        otpSystem: 'aadhaar'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send auth OTP via Aadhaar response:', response.data);
    return response.data;
  }

  /**
   * Verify Via ABHA Number - Using Aadhaar OTP (Verify OTP)
   */
  async verifyAuthOtpViaAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt OTP
    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'aadhaar-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Verify Auth OTP via ABHA Number + Aadhaar OTP
   */
  async verifyAuthOtpViaAbhaAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt OTP
    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'aadhaar-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Verify Auth OTP via ABHA Number
   */
  async verifyAuthOtpViaAbhaNumber(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt OTP
    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'mobile-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Format ABHA Number with dashes (XX-XXXX-XXXX-XXXX)
   */
  formatAbhaNumber(abhaNumber) {
    // Remove any existing dashes
    const clean = abhaNumber.replace(/-/g, '');

    // Format as XX-XXXX-XXXX-XXXX
    if (clean.length === 14) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}-${clean.slice(10, 14)}`;
    }

    return abhaNumber; // Return as-is if not 14 digits
  }

  /**
   * Send Auth OTP via ABHA Number + Aadhaar OTP (ABHA number but OTP via Aadhaar)
   */
  async sendAuthOtpViaAbhaAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available for encryption
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Format and encrypt ABHA number
    const formattedAbhaNumber = this.formatAbhaNumber(params.abhaNumber);
    const encryptedAbhaNumber = this.encryptData(formattedAbhaNumber, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'aadhaar-verify'],
        loginHint: 'abha-number',
        loginId: encryptedAbhaNumber,
        otpSystem: 'aadhaar'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send auth OTP via ABHA+Aadhaar response:', response.data);
    return response.data;
  }

  /**
   * Verify Via ABHA Number - Using ABHA OTP (Send OTP)
   */
  async sendAuthOtpViaAbhaNumber(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available for encryption
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Format and encrypt ABHA number
    const formattedAbhaNumber = this.formatAbhaNumber(params.abhaNumber);
    const encryptedAbhaNumber = this.encryptData(formattedAbhaNumber, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'mobile-verify'],
        loginHint: 'abha-number',
        loginId: encryptedAbhaNumber,
        otpSystem: 'abdm'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send auth OTP via ABHA number response:', response.data);
    return response.data;
  }

  /**
   * Verify Via ABHA Number - Using Password
   */
  async verifyViaPassword(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Format and encrypt ABHA number and password
    const formattedAbhaNumber = this.formatAbhaNumber(params.abhaNumber);
    const encryptedAbhaNumber = this.encryptData(formattedAbhaNumber, client.publicKey);
    const encryptedPassword = this.encryptData(params.password, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'abha-verify'],
        authData: {
          authMethods: ['password'],
          password: {
            loginId: encryptedAbhaNumber,
            password: encryptedPassword
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Verify Via Mobile Number - Send OTP
   */
  async sendAuthOtpViaMobile(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available for encryption
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt mobile number
    const encryptedMobile = this.encryptData(params.mobile, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'mobile-verify'],
        loginHint: 'mobile',
        loginId: encryptedMobile,
        otpSystem: 'abdm'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send auth OTP via mobile response:', response.data);
    return response.data;
  }

  /**
   * Verify Via Mobile Number - Verify OTP
   */
  async verifyAuthOtpViaMobile(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Ensure public key is available
    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt OTP
    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'mobile-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Verify User (Get User Details after OTP verification)
   */
  async verifyUser(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.get(
      `${this.baseURL}/abha/api/v3/profile/account`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Token': params.xToken,
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Get QR Code for ABHA profile
   */
  async getQRCode(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.get(
      `${this.baseURL}/abha/api/v3/profile/account/qrCode`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Token': `Bearer ${params.xToken}`,
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  /**
   * Update Profile Photo
   */
  async updateProfilePhoto(integrationId, params) {
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.patch(
      `${this.baseURL}/abha/api/v3/profile/account/profile-photo`,
      {
        photo: params.photoBase64  // Base64 encoded photo
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Token': params.xToken,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    return response.data;
  }

  async testConnection(integration) {
    try {
      const client = this.getClient(integration.id);

      if (!client) {
        console.log('Client not initialized, attempting to initialize...');
        await this.initialize(integration);
      }

      // Test by getting access token
      const token = await this.getAccessToken(integration.id);

      if (token) {
        console.log('✓ ABDM connection successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('ABDM connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Generate UUID for REQUEST-ID header
   */
  generateRequestId() {
    return crypto.randomUUID();
  }

  /**
   * Search ABHA accounts by mobile number
   * Using PHR Web Login Search API
   */
  async searchAbhaByMobile(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/phr/web/login/abha/search`,
      {
        mobile: params.mobile
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Search ABHA by mobile response:', response.data);
    return response.data;
  }

  /**
   * Search ABHA accounts by ABHA Number
   * Using PHR Web Login Search API
   */
  async searchAbhaByAbhaNumber(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    // Format ABHA number (no encryption needed for this endpoint)
    const formattedAbhaNumber = this.formatAbhaNumber(params.abhaNumber);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/phr/web/login/abha/search`,
      {
        healthIdNumber: formattedAbhaNumber
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Search ABHA by ABHA number response:', response.data);
    return response.data;
  }

  /**
   * Search ABHA accounts by ABHA Address
   * Using PHR Web Login Search API
   */
  async searchAbhaByAbhaAddress(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/phr/web/login/abha/search`,
      {
        abhaAddress: params.abhaAddress
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Search ABHA by ABHA address response:', response.data);
    return response.data;
  }

  /**
   * Search ABHA accounts by Aadhaar
   */
  async searchAbhaByAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt Aadhaar number
    const encryptedAadhaar = this.encryptData(params.aadhaar, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/account/abha/search`,
      {
        scope: ['search-abha'],
        aadhaar: encryptedAadhaar
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Search ABHA by Aadhaar response:', response.data);
    return response.data;
  }

  /**
   * Send OTP for search-based authentication via Mobile (ABDM OTP)
   * After searching and selecting an account index
   */
  async sendSearchOtpViaMobile(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt the account index (from search results)
    const encryptedIndex = this.encryptData(params.index.toString(), client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'search-abha', 'mobile-verify'],
        loginHint: 'index',
        loginId: encryptedIndex,
        otpSystem: 'abdm',
        txnId: params.txnId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send search OTP via mobile response:', response.data);
    return response.data;
  }

  /**
   * Send OTP for search-based authentication via Aadhaar-linked mobile
   */
  async sendSearchOtpViaAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    // Encrypt the account index
    const encryptedIndex = this.encryptData(params.index.toString(), client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'search-abha', 'aadhaar-verify'],
        loginHint: 'index',
        loginId: encryptedIndex,
        otpSystem: 'aadhaar',
        txnId: params.txnId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send search OTP via Aadhaar response:', response.data);
    return response.data;
  }

  /**
   * Verify OTP for search-based authentication via Mobile
   */
  async verifySearchOtpViaMobile(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'mobile-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Verify search OTP via mobile response:', response.data);
    return response.data;
  }

  /**
   * Verify OTP for search-based authentication via Aadhaar
   */
  async verifySearchOtpViaAadhaar(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    const encryptedOtp = this.encryptData(params.otp, client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'aadhaar-verify'],
        authData: {
          authMethods: ['otp'],
          otp: {
            txnId: params.txnId,
            otpValue: encryptedOtp
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Verify search OTP via Aadhaar response:', response.data);
    return response.data;
  }

  /**
   * Send fingerprint authentication request for search-based auth
   */
  async sendSearchBioFingerprint(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    const encryptedIndex = this.encryptData(params.index.toString(), client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'search-abha', 'aadhaar-bio-verify'],
        loginHint: 'index',
        loginId: encryptedIndex,
        otpSystem: 'aadhaar',
        txnId: params.txnId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send search bio fingerprint response:', response.data);
    return response.data;
  }

  /**
   * Send face authentication request for search-based auth
   */
  async sendSearchBioFace(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    const encryptedIndex = this.encryptData(params.index.toString(), client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'search-abha', 'aadhaar-face-verify'],
        loginHint: 'index',
        loginId: encryptedIndex,
        otpSystem: 'aadhaar',
        txnId: params.txnId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send search bio face response:', response.data);
    return response.data;
  }

  /**
   * Send IRIS authentication request for search-based auth
   */
  async sendSearchBioIris(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    if (!client.publicKey) {
      await this.getPublicCertificate(integrationId);
    }

    const encryptedIndex = this.encryptData(params.index.toString(), client.publicKey);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/request/otp`,
      {
        scope: ['abha-login', 'search-abha', 'aadhaar-iris-verify'],
        loginHint: 'index',
        loginId: encryptedIndex,
        otpSystem: 'aadhaar',
        txnId: params.txnId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Send search bio IRIS response:', response.data);
    return response.data;
  }

  /**
   * Verify fingerprint biometric authentication
   */
  async verifySearchBioFingerprint(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'aadhaar-bio-verify'],
        authData: {
          authMethods: ['bio'],
          bio: {
            txnId: params.txnId,
            fingerPrintAuthPid: params.pid
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Verify search bio fingerprint response:', response.data);
    return response.data;
  }

  /**
   * Verify face biometric authentication
   */
  async verifySearchBioFace(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'aadhaar-face-verify'],
        authData: {
          authMethods: ['face'],
          face: {
            txnId: params.txnId,
            faceAuthPid: params.pid
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Verify search bio face response:', response.data);
    return response.data;
  }

  /**
   * Verify IRIS biometric authentication
   */
  async verifySearchBioIris(integrationId, params) {
    const client = this.getClient(integrationId);
    const accessToken = await this.getAccessToken(integrationId);

    const response = await axios.post(
      `${this.baseURL}/abha/api/v3/profile/login/verify`,
      {
        scope: ['abha-login', 'aadhaar-iris-verify'],
        authData: {
          authMethods: ['iris'],
          iris: {
            txnId: params.txnId,
            irisAuthPid: params.pid
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': this.generateRequestId(),
          'TIMESTAMP': this.generateTimestamp()
        }
      }
    );

    console.log('Verify search bio IRIS response:', response.data);
    return response.data;
  }

  /**
   * Generate timestamp in ABDM format (ISO 8601 with milliseconds)
   */
  generateTimestamp() {
    return new Date().toISOString();
  }
}

module.exports = new ABDMHandler();
