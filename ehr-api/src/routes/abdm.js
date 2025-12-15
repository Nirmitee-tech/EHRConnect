const express = require('express');
const router = express.Router();
const abdmService = require('../services/abdm.service');
const { requireAuth } = require('../middleware/auth');

/**
 * @route   POST /api/abdm/config
 * @desc    Configure ABDM integration (supports multiple configs per org)
 * @access  Private
 */
router.post('/config', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { name, clientId, clientSecret, xCmId, publicKey, environment } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'clientId and clientSecret are required'
      });
    }

    const integration = await abdmService.saveIntegrationConfig(organizationId, {
      name,
      clientId,
      clientSecret,
      xCmId,
      publicKey,
      environment
    });

    res.json({
      message: 'ABDM integration configured successfully',
      integration: {
        id: integration.id,
        name: integration.name,
        environment: integration.credentials.environment,
        status: integration.status
      }
    });
  } catch (error) {
    console.error('Error configuring ABDM:', error);
    res.status(500).json({
      error: 'Failed to configure ABDM integration',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/config
 * @desc    List all ABDM integrations for organization
 * @access  Private
 */
router.get('/config', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const integrations = await abdmService.listIntegrations(organizationId);

    res.json({
      integrations: integrations.map(i => ({
        id: i.id,
        name: i.name,
        status: i.status,
        createdAt: i.created_at,
        updatedAt: i.updated_at
      }))
    });
  } catch (error) {
    console.error('Error listing ABDM integrations:', error);
    res.status(500).json({
      error: 'Failed to list ABDM integrations',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/abdm/config/:integrationId
 * @desc    Delete ABDM integration configuration
 * @access  Private
 */
router.delete('/config/:integrationId', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { integrationId } = req.params;

    const deleted = await abdmService.deleteIntegration(organizationId, integrationId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Integration not found'
      });
    }

    res.json({
      message: 'ABDM integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ABDM integration:', error);
    res.status(500).json({
      error: 'Failed to delete ABDM integration',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/test-connection
 * @desc    Test ABDM connection
 * @access  Private
 */
router.post('/test-connection', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { integrationName } = req.body;

    const success = await abdmService.testConnection(organizationId, integrationName);

    res.json({
      success,
      message: success ? 'Connection successful' : 'Connection failed'
    });
  } catch (error) {
    console.error('Error testing ABDM connection:', error);
    res.status(500).json({
      error: 'Failed to test connection',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/send-otp
 * @desc    Send OTP to Aadhaar registered mobile number
 * @access  Private
 */
router.post('/send-otp', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { aadhaar, integrationName } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        error: 'Valid 12-digit Aadhaar number is required'
      });
    }

    const result = await abdmService.sendOtp(organizationId, aadhaar, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);

    // Handle ABDM API errors
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/verify-otp
 * @desc    Verify OTP and create ABHA account
 * @access  Private
 */
router.post('/verify-otp', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, mobile, integrationName } = req.body;

    if (!txnId || !otp || !mobile) {
      return res.status(400).json({
        error: 'txnId, otp, and mobile are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifyOtpAndEnroll(
      organizationId,
      txnId,
      otp,
      mobile,
      integrationName
    );

    res.json({
      success: true,
      profile: result.ABHAProfile,
      tokens: {
        token: result.tokens?.token,
        refreshToken: result.tokens?.refreshToken,
        expiresIn: result.tokens?.expiresIn,
        tToken: result.tokens?.tToken
      },
      // Include txnId for address operations (if returned by ABDM)
      txnId: result.txnId || result.data?.txnId
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/send-mobile-otp
 * @desc    Send OTP to mobile for verification or mobile update
 * @access  Private
 * @body    { mobile, txnId (optional, from enrollment/login for mobile update), integrationName }
 */
router.post('/send-mobile-otp', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { mobile, txnId, integrationName } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        error: 'Valid 10-digit mobile number is required'
      });
    }

    console.log('Mobile OTP request:', {
      mobile: `******${mobile.slice(-4)}`,
      hasTxnId: !!txnId,
      flow: txnId ? 'mobile-update' : 'initial-verification'
    });

    const result = await abdmService.sendMobileOtp(organizationId, mobile, txnId, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending mobile OTP:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send mobile OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/verify-mobile-otp
 * @desc    Verify mobile OTP
 * @access  Private
 * @body    { txnId, otp, scope, integrationName }
 */
router.post('/verify-mobile-otp', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, scope, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    console.log('Verify mobile OTP request:', {
      txnId: txnId.substring(0, 20) + '...',
      scope: scope
    });

    const result = await abdmService.verifyMobileOtp(
      organizationId,
      txnId,
      otp,
      scope,
      integrationName
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error verifying mobile OTP:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify mobile OTP',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/address-suggestions
 * @desc    Get ABHA address suggestions
 * @access  Private
 */
router.get('/address-suggestions', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, integrationName } = req.query;

    if (!txnId) {
      return res.status(400).json({
        error: 'txnId is required'
      });
    }

    const result = await abdmService.getAddressSuggestions(
      organizationId,
      txnId,
      integrationName
    );

    // Ensure result.suggestions is an array
    const suggestions = Array.isArray(result.suggestions)
      ? result.suggestions
      : Array.isArray(result)
      ? result
      : [];

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error getting address suggestions:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to get address suggestions',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/set-address
 * @desc    Set ABHA address
 * @access  Private
 */
router.post('/set-address', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, abhaAddress, integrationName } = req.body;

    if (!txnId || !abhaAddress) {
      return res.status(400).json({
        error: 'txnId and abhaAddress are required'
      });
    }

    const result = await abdmService.setAbhaAddress(
      organizationId,
      txnId,
      abhaAddress,
      integrationName
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error setting ABHA address:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to set ABHA address',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/public-certificate
 * @desc    Get ABDM public certificate
 * @access  Private
 */
router.get('/public-certificate', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { integrationName } = req.query;

    const certificate = await abdmService.getPublicCertificate(organizationId, integrationName);

    res.json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error('Error getting public certificate:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to get public certificate',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/transactions
 * @desc    Get ABDM transaction history
 * @access  Private
 */
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await abdmService.getTransactionHistory(organizationId, limit, offset);

    res.json({
      success: true,
      transactions,
      pagination: {
        limit,
        offset,
        count: transactions.length
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      error: 'Failed to get transaction history',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/profile
 * @desc    Get ABHA profile details
 * @access  Private
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { xToken, integrationName } = req.query;

    if (!xToken) {
      return res.status(400).json({
        error: 'X-Token is required'
      });
    }

    const profile = await abdmService.getProfile(organizationId, xToken, integrationName);

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error getting profile:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to get profile',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/download-card
 * @desc    Download ABHA card
 * @access  Private
 */
router.get('/download-card', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { xToken, integrationName } = req.query;

    if (!xToken) {
      return res.status(400).json({
        error: 'X-Token is required'
      });
    }

    const result = await abdmService.downloadAbhaCard(organizationId, xToken, integrationName);

    res.json({
      success: true,
      card: result.card,
      contentType: result.contentType,
      format: result.format
    });
  } catch (error) {
    console.error('Error downloading card:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);

    if (error.response?.data) {
      // If arraybuffer, try to parse as JSON
      let errorDetails = error.response.data;
      if (error.response.data instanceof Buffer || error.response.data instanceof ArrayBuffer) {
        try {
          errorDetails = JSON.parse(Buffer.from(error.response.data).toString());
        } catch (e) {
          errorDetails = Buffer.from(error.response.data).toString();
        }
      }

      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: errorDetails,
        url: error.config?.url,
        method: error.config?.method
      });
    }

    res.status(500).json({
      error: 'Failed to download ABHA card',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/send-email-verification
 * @desc    Send email verification link
 * @access  Private
 * @body    { xToken, email, integrationName }
 */
router.post('/send-email-verification', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { xToken, email, integrationName } = req.body;

    if (!xToken) {
      return res.status(400).json({
        error: 'X-Token is required'
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Valid email address is required'
      });
    }

    console.log('Email verification link request:', {
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      hasXToken: true
    });

    const result = await abdmService.sendEmailVerification(
      organizationId,
      xToken,
      email,
      integrationName
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error sending email verification:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send email verification',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/login-with-address
 * @desc    Login with ABHA Address (send OTP)
 * @access  Private
 */
router.post('/login-with-address', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaAddress, integrationName } = req.body;

    if (!abhaAddress) {
      return res.status(400).json({
        error: 'ABHA Address is required'
      });
    }

    const result = await abdmService.loginWithAbhaAddress(
      organizationId,
      abhaAddress,
      integrationName
    );

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending login OTP:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send login OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/verify-login-otp
 * @desc    Verify login OTP and get Auth token
 * @access  Private
 */
router.post('/verify-login-otp', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifyLoginOtp(
      organizationId,
      txnId,
      otp,
      integrationName
    );

    res.json({
      success: true,
      tokens: result.tokens
    });
  } catch (error) {
    console.error('Error verifying login OTP:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify login OTP',
      details: error.message
    });
  }
});

/**
 * ABHA Verification APIs
 */

/**
 * @route   POST /api/abdm/auth/send-otp-aadhaar
 * @desc    Send OTP to Aadhaar registered mobile for ABHA verification
 * @access  Private
 */
router.post('/auth/send-otp-aadhaar', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { aadhaar, integrationName } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        error: 'Valid 12-digit Aadhaar number is required'
      });
    }

    const result = await abdmService.sendAuthOtpViaAadhaar(organizationId, aadhaar, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending auth OTP via Aadhaar:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/verify-otp-aadhaar
 * @desc    Verify Aadhaar OTP for ABHA authentication
 * @access  Private
 */
router.post('/auth/verify-otp-aadhaar', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifyAuthOtpViaAadhaar(organizationId, txnId, otp, integrationName);

    // ABDM API returns token and accounts array
    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      // Also include in legacy format for backwards compatibility
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying auth OTP via Aadhaar:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/send-otp-abha-aadhaar
 * @desc    Send OTP via Aadhaar for ABHA number verification
 * @access  Private
 */
router.post('/auth/send-otp-abha-aadhaar', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaNumber, integrationName } = req.body;

    if (!abhaNumber) {
      return res.status(400).json({
        error: 'ABHA Number is required'
      });
    }

    const result = await abdmService.sendAuthOtpViaAbhaAadhaar(organizationId, abhaNumber, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully to Aadhaar-linked mobile'
    });
  } catch (error) {
    console.error('Error sending auth OTP via ABHA+Aadhaar:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/verify-otp-abha-aadhaar
 * @desc    Verify Aadhaar OTP for ABHA number authentication
 * @access  Private
 */
router.post('/auth/verify-otp-abha-aadhaar', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifyAuthOtpViaAbhaAadhaar(organizationId, txnId, otp, integrationName);

    // ABDM API returns token and accounts array
    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      // Also include in legacy format for backwards compatibility
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying auth OTP via ABHA+Aadhaar:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/send-otp-abha-number
 * @desc    Send OTP to ABHA number for verification
 * @access  Private
 */
router.post('/auth/send-otp-abha-number', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaNumber, integrationName } = req.body;

    if (!abhaNumber) {
      return res.status(400).json({
        error: 'ABHA Number is required'
      });
    }

    const result = await abdmService.sendAuthOtpViaAbhaNumber(organizationId, abhaNumber, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending auth OTP via ABHA number:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/verify-otp-abha-number
 * @desc    Verify ABHA Number OTP for ABHA authentication
 * @access  Private
 */
router.post('/auth/verify-otp-abha-number', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifyAuthOtpViaAbhaNumber(organizationId, txnId, otp, integrationName);

    // ABDM API returns token and accounts array
    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      // Also include in legacy format for backwards compatibility
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying auth OTP via ABHA number:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/verify-password
 * @desc    Verify ABHA account using password
 * @access  Private
 */
router.post('/auth/verify-password', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaNumber, password, integrationName } = req.body;

    if (!abhaNumber || !password) {
      return res.status(400).json({
        error: 'ABHA Number and password are required'
      });
    }

    const result = await abdmService.verifyViaPassword(organizationId, abhaNumber, password, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      // Also include in legacy format for backwards compatibility
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying via password:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify via password',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/send-otp-mobile
 * @desc    Send OTP to mobile for ABHA verification
 * @access  Private
 */
router.post('/auth/send-otp-mobile', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { mobile, integrationName } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        error: 'Valid 10-digit mobile number is required'
      });
    }

    const result = await abdmService.sendAuthOtpViaMobile(organizationId, mobile, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending auth OTP via mobile:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/verify-otp-mobile
 * @desc    Verify mobile OTP for ABHA authentication
 * @access  Private
 */
router.post('/auth/verify-otp-mobile', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifyAuthOtpViaMobile(organizationId, txnId, otp, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      // Also include in legacy format for backwards compatibility
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying auth OTP via mobile:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify auth OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/auth/verify-user
 * @desc    Get user details after authentication
 * @access  Private
 */
router.post('/auth/verify-user', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { xToken, integrationName } = req.body;

    if (!xToken) {
      return res.status(400).json({
        error: 'X-Token is required'
      });
    }

    const result = await abdmService.verifyUser(organizationId, xToken, integrationName);

    res.json({
      success: true,
      user: result
    });
  } catch (error) {
    console.error('Error verifying user:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify user',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/qrcode
 * @desc    Get QR Code for ABHA profile
 * @access  Private
 */
router.get('/qrcode', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { xToken, integrationName } = req.query;

    if (!xToken) {
      return res.status(400).json({
        error: 'X-Token is required'
      });
    }

    const result = await abdmService.getQRCode(organizationId, xToken, integrationName);

    res.json({
      success: true,
      qrCode: result
    });
  } catch (error) {
    console.error('Error getting QR code:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to get QR code',
      details: error.message
    });
  }
});

/**
 * @route   PATCH /api/abdm/profile/photo
 * @desc    Update profile photo
 * @access  Private
 */
router.patch('/profile/photo', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { xToken, photoBase64, integrationName } = req.body;

    if (!xToken || !photoBase64) {
      return res.status(400).json({
        error: 'X-Token and photoBase64 are required'
      });
    }

    const result = await abdmService.updateProfilePhoto(organizationId, xToken, photoBase64, integrationName);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating profile photo:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to update profile photo',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/encrypt-data
 * @desc    Encrypt data using ABDM public key (utility endpoint)
 * @access  Private
 */
router.post('/encrypt-data', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { data, integrationName } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data to encrypt is required'
      });
    }

    // Get public certificate first
    const certificate = await abdmService.getPublicCertificate(organizationId, integrationName);

    // Use the handler to encrypt
    const abdmHandler = require('../integrations/abdm.handler');
    const encrypted = abdmHandler.encryptData(data, certificate);

    res.json({
      success: true,
      encrypted,
      original: data,
      publicKey: certificate.substring(0, 50) + '...'
    });
  } catch (error) {
    console.error('Error encrypting data:', error);
    res.status(500).json({
      error: 'Failed to encrypt data',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/abdm/stored-tokens/:abhaNumber
 * @desc    Get stored tokens for an ABHA profile
 * @access  Private
 */
router.get('/stored-tokens/:abhaNumber', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaNumber } = req.params;

    const tokens = await abdmService.getStoredTokens(organizationId, abhaNumber);

    if (!tokens) {
      return res.status(404).json({
        error: 'No tokens found for this ABHA profile'
      });
    }

    res.json({
      success: true,
      tokens
    });
  } catch (error) {
    console.error('Error getting stored tokens:', error);
    res.status(500).json({
      error: 'Failed to get stored tokens',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/mobile
 * @desc    Search ABHA account by mobile number (NOT SUPPORTED by PHR Web Login Search API)
 * @access  Private
 * @note    The PHR Web Login Search API only supports abhaAddress and healthIdNumber.
 *          Mobile number search is not available in this API.
 */
router.post('/search/mobile', requireAuth, async (req, res) => {
  // PHR Web Login Search API does not support mobile number search
  return res.status(400).json({
    error: 'Mobile number search not supported',
    details: 'The PHR Web Login Search API only supports searching by ABHA Number or ABHA Address. Mobile number search is not available.',
    supportedSearchTypes: ['abhaNumber', 'abhaAddress'],
    alternatives: {
      abhaNumber: 'Use POST /api/abdm/search/abha-number with healthIdNumber',
      abhaAddress: 'Use POST /api/abdm/search/abha-address with abhaAddress'
    }
  });
});

/**
 * @route   POST /api/abdm/search/abha-number
 * @desc    Search ABHA account by ABHA number (PHR Web Login Search API)
 * @access  Private
 */
router.post('/search/abha-number', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaNumber, integrationName } = req.body;

    if (!abhaNumber) {
      return res.status(400).json({
        error: 'ABHA Number is required'
      });
    }

    const result = await abdmService.searchAbhaByAbhaNumber(organizationId, abhaNumber, integrationName);

    // PHR Web Login Search returns a single profile, not an array
    res.json({
      success: true,
      profile: result,
      healthIdNumber: result.healthIdNumber,
      abhaAddress: result.abhaAddress,
      authMethods: result.authMethods || [],
      fullName: result.fullName,
      mobile: result.mobile,
      status: result.status,
      message: result.message || 'Search completed successfully'
    });
  } catch (error) {
    console.error('Error searching ABHA by ABHA number:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to search ABHA account',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/abha-address
 * @desc    Search ABHA account by ABHA address (PHR Web Login Search API)
 * @access  Private
 */
router.post('/search/abha-address', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { abhaAddress, integrationName } = req.body;

    if (!abhaAddress) {
      return res.status(400).json({
        error: 'ABHA Address is required'
      });
    }

    const result = await abdmService.searchAbhaByAbhaAddress(organizationId, abhaAddress, integrationName);

    // PHR Web Login Search returns a single profile, not an array
    res.json({
      success: true,
      profile: result,
      healthIdNumber: result.healthIdNumber,
      abhaAddress: result.abhaAddress,
      authMethods: result.authMethods || [],
      fullName: result.fullName,
      mobile: result.mobile,
      status: result.status,
      message: result.message || 'Search completed successfully'
    });
  } catch (error) {
    console.error('Error searching ABHA by ABHA address:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to search ABHA account',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/aadhaar
 * @desc    Search ABHA accounts by Aadhaar (NOT SUPPORTED BY ABDM API)
 * @access  Private
 * @note    ABDM does not support searching by Aadhaar for privacy reasons.
 *          Aadhaar can only be used for enrollment/authentication, not search.
 *          Use mobile/ABHA number/ABHA address for searching instead.
 */
router.post('/search/aadhaar', requireAuth, async (req, res) => {
  // ABDM API does not support searching by Aadhaar
  // Aadhaar is only for enrollment, not search
  return res.status(400).json({
    error: 'Aadhaar search not supported',
    details: 'ABDM does not allow searching by Aadhaar for privacy reasons. Use Mobile Number, ABHA Number, or ABHA Address instead.',
    supportedSearchTypes: ['mobile', 'abhaNumber', 'abhaAddress']
  });
});

/**
 * @route   POST /api/abdm/search/send-otp-mobile
 * @desc    Send OTP for search-based auth via Mobile (ABDM OTP)
 * @access  Private
 */
router.post('/search/send-otp-mobile', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { index, txnId, integrationName } = req.body;

    if (index === undefined || !txnId) {
      return res.status(400).json({
        error: 'index and txnId are required'
      });
    }

    const result = await abdmService.sendSearchOtpViaMobile(organizationId, index, txnId, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully to ABDM registered mobile'
    });
  } catch (error) {
    console.error('Error sending search OTP via mobile:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/send-otp-aadhaar
 * @desc    Send OTP for search-based auth via Aadhaar-linked mobile
 * @access  Private
 */
router.post('/search/send-otp-aadhaar', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { index, txnId, integrationName } = req.body;

    if (index === undefined || !txnId) {
      return res.status(400).json({
        error: 'index and txnId are required'
      });
    }

    const result = await abdmService.sendSearchOtpViaAadhaar(organizationId, index, txnId, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'OTP sent successfully to Aadhaar-linked mobile'
    });
  } catch (error) {
    console.error('Error sending search OTP via Aadhaar:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/verify-otp-mobile
 * @desc    Verify OTP for search-based auth via Mobile
 * @access  Private
 */
router.post('/search/verify-otp-mobile', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifySearchOtpViaMobile(organizationId, txnId, otp, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying search OTP via mobile:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/verify-otp-aadhaar
 * @desc    Verify OTP for search-based auth via Aadhaar
 * @access  Private
 */
router.post('/search/verify-otp-aadhaar', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, otp, integrationName } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({
        error: 'txnId and otp are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Valid 6-digit OTP is required'
      });
    }

    const result = await abdmService.verifySearchOtpViaAadhaar(organizationId, txnId, otp, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying search OTP via Aadhaar:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify OTP',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/send-bio-fingerprint
 * @desc    Send fingerprint bio request for search-based auth
 * @access  Private
 */
router.post('/search/send-bio-fingerprint', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { index, txnId, integrationName } = req.body;

    if (index === undefined || !txnId) {
      return res.status(400).json({
        error: 'index and txnId are required'
      });
    }

    const result = await abdmService.sendSearchBioFingerprint(organizationId, index, txnId, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'Fingerprint authentication request sent'
    });
  } catch (error) {
    console.error('Error sending fingerprint bio request:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send fingerprint request',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/verify-bio-fingerprint
 * @desc    Verify fingerprint bio for search-based auth
 * @access  Private
 */
router.post('/search/verify-bio-fingerprint', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, pid, integrationName } = req.body;

    if (!txnId || !pid) {
      return res.status(400).json({
        error: 'txnId and pid (fingerPrintAuthPid) are required'
      });
    }

    const result = await abdmService.verifySearchBioFingerprint(organizationId, txnId, pid, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying fingerprint bio:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify fingerprint',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/send-bio-face
 * @desc    Send face bio request for search-based auth
 * @access  Private
 */
router.post('/search/send-bio-face', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { index, txnId, integrationName } = req.body;

    if (index === undefined || !txnId) {
      return res.status(400).json({
        error: 'index and txnId are required'
      });
    }

    const result = await abdmService.sendSearchBioFace(organizationId, index, txnId, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'Face authentication request sent'
    });
  } catch (error) {
    console.error('Error sending face bio request:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send face request',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/verify-bio-face
 * @desc    Verify face bio for search-based auth
 * @access  Private
 */
router.post('/search/verify-bio-face', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, pid, integrationName } = req.body;

    if (!txnId || !pid) {
      return res.status(400).json({
        error: 'txnId and pid (faceAuthPid) are required'
      });
    }

    const result = await abdmService.verifySearchBioFace(organizationId, txnId, pid, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying face bio:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify face',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/send-bio-iris
 * @desc    Send IRIS bio request for search-based auth
 * @access  Private
 */
router.post('/search/send-bio-iris', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { index, txnId, integrationName } = req.body;

    if (index === undefined || !txnId) {
      return res.status(400).json({
        error: 'index and txnId are required'
      });
    }

    const result = await abdmService.sendSearchBioIris(organizationId, index, txnId, integrationName);

    res.json({
      success: true,
      txnId: result.txnId,
      message: result.message || 'IRIS authentication request sent'
    });
  } catch (error) {
    console.error('Error sending IRIS bio request:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to send IRIS request',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/abdm/search/verify-bio-iris
 * @desc    Verify IRIS bio for search-based auth
 * @access  Private
 */
router.post('/search/verify-bio-iris', requireAuth, async (req, res) => {
  try {
    const organizationId = req.userContext.orgId;
    const { txnId, pid, integrationName } = req.body;

    if (!txnId || !pid) {
      return res.status(400).json({
        error: 'txnId and pid (irisAuthPid) are required'
      });
    }

    const result = await abdmService.verifySearchBioIris(organizationId, txnId, pid, integrationName);

    res.json({
      success: true,
      data: {
        token: result.token,
        accounts: result.accounts || []
      },
      tokens: result.token ? { token: result.token } : undefined,
      profile: result.accounts && result.accounts.length > 0 ? result.accounts[0] : undefined
    });
  } catch (error) {
    console.error('Error verifying IRIS bio:', error);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'ABDM API error',
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to verify IRIS',
      details: error.message
    });
  }
});

module.exports = router;
