/**
 * ABDM API Client
 * Functions for interacting with ABDM (Ayushman Bharat Digital Mission) API
 */

import { api, ApiRequestOptions } from '../api-client';

export interface ABDMConfig {
  id?: string;
  name: string;
  clientId: string;
  clientSecret: string;
  xCmId?: string;
  publicKey?: string;
  environment?: 'sandbox' | 'production';
}

export interface ABDMIntegration {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OTPResponse {
  success: boolean;
  txnId: string;
  message: string;
}

export interface ABHAProfile {
  ABHANumber: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  mobile: string;
  email?: string;
  preferredAbhaAddress?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  profile: ABHAProfile;
  tokens: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface ABDMTransaction {
  id: string;
  operation: string;
  metadata: any;
  created_at: string;
}

/**
 * Configure ABDM integration
 */
export async function configureABDM(
  config: ABDMConfig,
  options?: ApiRequestOptions
): Promise<{ message: string; integration: ABDMIntegration }> {
  return api.post('/api/abdm/config', config, options);
}

/**
 * List all ABDM integrations
 */
export async function listIntegrations(
  options?: ApiRequestOptions
): Promise<{ integrations: ABDMIntegration[] }> {
  return api.get('/api/abdm/config', options);
}

/**
 * Delete ABDM integration
 */
export async function deleteIntegration(
  integrationId: string,
  options?: ApiRequestOptions
): Promise<{ message: string }> {
  return api.delete(`/api/abdm/config/${integrationId}`, options);
}

/**
 * Test ABDM connection
 */
export async function testConnection(
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; message: string }> {
  return api.post(
    '/api/abdm/test-connection',
    { integrationName },
    options
  );
}

/**
 * Send OTP to Aadhaar registered mobile
 */
export async function sendOTP(
  aadhaar: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/send-otp',
    { aadhaar, integrationName },
    options
  );
}

/**
 * Verify OTP and create ABHA account
 */
export async function verifyOTP(
  txnId: string,
  otp: string,
  mobile: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<VerifyOTPResponse> {
  return api.post(
    '/api/abdm/verify-otp',
    { txnId, otp, mobile, integrationName },
    options
  );
}

/**
 * Send mobile OTP for verification or mobile update
 * @param mobile - Mobile number
 * @param txnId - Optional txnId from enrollment/login (for mobile update flow)
 * @param integrationName - Optional integration name
 * @param options - API request options
 */
export async function sendMobileOTP(
  mobile: string,
  txnId?: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/send-mobile-otp',
    { mobile, txnId, integrationName },
    options
  );
}

/**
 * Verify mobile OTP
 * @param txnId - Transaction ID from send mobile OTP
 * @param otp - OTP received
 * @param scope - Optional scope
 * @param integrationName - Optional integration name
 * @param options - API request options
 */
export async function verifyMobileOTP(
  txnId: string,
  otp: string,
  scope?: string[],
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; data: any }> {
  return api.post(
    '/api/abdm/verify-mobile-otp',
    { txnId, otp, scope, integrationName },
    options
  );
}

/**
 * Get ABHA address suggestions
 */
export async function getAddressSuggestions(
  txnId: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; suggestions: string[] }> {
  const params = new URLSearchParams({ txnId });
  if (integrationName) params.append('integrationName', integrationName);

  return api.get(`/api/abdm/address-suggestions?${params.toString()}`, options);
}

/**
 * Set ABHA address
 */
export async function setAbhaAddress(
  txnId: string,
  abhaAddress: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; data: any }> {
  return api.post(
    '/api/abdm/set-address',
    { txnId, abhaAddress, integrationName },
    options
  );
}

/**
 * Get ABDM public certificate
 */
export async function getPublicCertificate(
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; certificate: string }> {
  const params = new URLSearchParams();
  if (integrationName) params.append('integrationName', integrationName);

  return api.get(`/api/abdm/public-certificate${params.toString() ? `?${params.toString()}` : ''}`, options);
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  limit = 50,
  offset = 0,
  options?: ApiRequestOptions
): Promise<{
  success: boolean;
  transactions: ABDMTransaction[];
  pagination: { limit: number; offset: number; count: number };
}> {
  return api.get(`/api/abdm/transactions?limit=${limit}&offset=${offset}`, options);
}

/**
 * Get ABHA profile details
 */
export async function getProfile(
  xToken: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; profile: any }> {
  const params = new URLSearchParams({ xToken });
  if (integrationName) params.append('integrationName', integrationName);

  return api.get(`/api/abdm/profile?${params.toString()}`, options);
}

/**
 * Download ABHA card
 */
export async function downloadAbhaCard(
  xToken: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; card: string; contentType: string }> {
  const params = new URLSearchParams({ xToken });
  if (integrationName) params.append('integrationName', integrationName);

  return api.get(`/api/abdm/download-card?${params.toString()}`, options);
}

/**
 * Send email verification link
 * Requires X-Token (Auth token)
 */
export async function sendEmailVerification(
  xToken: string,
  email: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; data: any }> {
  return api.post(
    '/api/abdm/send-email-verification',
    { xToken, email, integrationName },
    options
  );
}

/**
 * Login with ABHA Address (send OTP)
 */
export async function loginWithAbhaAddress(
  abhaAddress: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/login-with-address',
    { abhaAddress, integrationName },
    options
  );
}

/**
 * Verify login OTP and get Auth token
 */
export async function verifyLoginOTP(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any }> {
  return api.post(
    '/api/abdm/verify-login-otp',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Encrypt data using ABDM public key (utility)
 */
export async function encryptData(
  data: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; encrypted: string; original: string; publicKey: string }> {
  return api.post(
    '/api/abdm/encrypt-data',
    { data, integrationName },
    options
  );
}

/**
 * ABHA Verification APIs
 */

/**
 * Send Auth OTP via Aadhaar (for existing ABHA verification)
 */
export async function sendAuthOtpViaAadhaar(
  aadhaar: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/auth/send-otp-aadhaar',
    { aadhaar, integrationName },
    options
  );
}

/**
 * Verify Auth OTP via Aadhaar
 */
export async function verifyAuthOtpViaAadhaar(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/auth/verify-otp-aadhaar',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Send Auth OTP via ABHA Number + Aadhaar OTP
 */
export async function sendAuthOtpViaAbhaAadhaar(
  abhaNumber: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/auth/send-otp-abha-aadhaar',
    { abhaNumber, integrationName },
    options
  );
}

/**
 * Verify Auth OTP via ABHA Number + Aadhaar OTP
 */
export async function verifyAuthOtpViaAbhaAadhaar(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/auth/verify-otp-abha-aadhaar',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Send Auth OTP via ABHA Number
 */
export async function sendAuthOtpViaAbhaNumber(
  abhaNumber: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/auth/send-otp-abha-number',
    { abhaNumber, integrationName },
    options
  );
}

/**
 * Verify Auth OTP via ABHA Number
 */
export async function verifyAuthOtpViaAbhaNumber(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/auth/verify-otp-abha-number',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Verify via Password
 */
export async function verifyViaPassword(
  abhaNumber: string,
  password: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/auth/verify-password',
    { abhaNumber, password, integrationName },
    options
  );
}

/**
 * Send Auth OTP via Mobile
 */
export async function sendAuthOtpViaMobile(
  mobile: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/auth/send-otp-mobile',
    { mobile, integrationName },
    options
  );
}

/**
 * Verify Auth OTP via Mobile
 */
export async function verifyAuthOtpViaMobile(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; data: any }> {
  return api.post(
    '/api/abdm/auth/verify-otp-mobile',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Verify User (Get user details after auth)
 */
export async function verifyUser(
  xToken: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; user: any }> {
  return api.post(
    '/api/abdm/auth/verify-user',
    { xToken, integrationName },
    options
  );
}

/**
 * Search ABHA accounts by mobile number
 */
export async function searchAbhaByMobile(
  mobile: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; accounts: any[]; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/mobile',
    { mobile, integrationName },
    options
  );
}

/**
 * Search ABHA accounts by ABHA Number
 */
export async function searchAbhaByAbhaNumber(
  abhaNumber: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; accounts: any[]; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/abha-number',
    { abhaNumber, integrationName },
    options
  );
}

/**
 * Search ABHA accounts by ABHA Address
 */
export async function searchAbhaByAbhaAddress(
  abhaAddress: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; accounts: any[]; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/abha-address',
    { abhaAddress, integrationName },
    options
  );
}

/**
 * Search ABHA accounts by Aadhaar
 */
export async function searchAbhaByAadhaar(
  aadhaar: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; accounts: any[]; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/aadhaar',
    { aadhaar, integrationName },
    options
  );
}

/**
 * Send OTP for search-based auth via Mobile (ABDM OTP)
 */
export async function sendSearchOtpViaMobile(
  index: number,
  txnId: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/search/send-otp-mobile',
    { index, txnId, integrationName },
    options
  );
}

/**
 * Send OTP for search-based auth via Aadhaar
 */
export async function sendSearchOtpViaAadhaar(
  index: number,
  txnId: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<OTPResponse> {
  return api.post(
    '/api/abdm/search/send-otp-aadhaar',
    { index, txnId, integrationName },
    options
  );
}

/**
 * Verify OTP for search-based auth via Mobile
 */
export async function verifySearchOtpViaMobile(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/search/verify-otp-mobile',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Verify OTP for search-based auth via Aadhaar
 */
export async function verifySearchOtpViaAadhaar(
  txnId: string,
  otp: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/search/verify-otp-aadhaar',
    { txnId, otp, integrationName },
    options
  );
}

/**
 * Send fingerprint bio request for search-based auth
 */
export async function sendSearchBioFingerprint(
  index: number,
  txnId: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/send-bio-fingerprint',
    { index, txnId, integrationName },
    options
  );
}

/**
 * Verify fingerprint bio for search-based auth
 */
export async function verifySearchBioFingerprint(
  txnId: string,
  pid: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/search/verify-bio-fingerprint',
    { txnId, pid, integrationName },
    options
  );
}

/**
 * Send face bio request for search-based auth
 */
export async function sendSearchBioFace(
  index: number,
  txnId: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/send-bio-face',
    { index, txnId, integrationName },
    options
  );
}

/**
 * Verify face bio for search-based auth
 */
export async function verifySearchBioFace(
  txnId: string,
  pid: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/search/verify-bio-face',
    { txnId, pid, integrationName },
    options
  );
}

/**
 * Send IRIS bio request for search-based auth
 */
export async function sendSearchBioIris(
  index: number,
  txnId: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; txnId: string; message: string }> {
  return api.post(
    '/api/abdm/search/send-bio-iris',
    { index, txnId, integrationName },
    options
  );
}

/**
 * Verify IRIS bio for search-based auth
 */
export async function verifySearchBioIris(
  txnId: string,
  pid: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; tokens: any; profile: any }> {
  return api.post(
    '/api/abdm/search/verify-bio-iris',
    { txnId, pid, integrationName },
    options
  );
}

/**
 * Get QR Code for ABHA profile
 */
export async function getQRCode(
  xToken: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; qrCode: string }> {
  const params = new URLSearchParams({ xToken });
  if (integrationName) params.append('integrationName', integrationName);

  return api.get(`/api/abdm/qrcode?${params.toString()}`, options);
}

/**
 * Update Profile Photo
 */
export async function updateProfilePhoto(
  xToken: string,
  photoBase64: string,
  integrationName?: string,
  options?: ApiRequestOptions
): Promise<{ success: boolean; data: any }> {
  return api.patch(
    '/api/abdm/profile/photo',
    { xToken, photoBase64, integrationName },
    options
  );
}
