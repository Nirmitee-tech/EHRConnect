'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Settings,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Shield,
  Key,
  FileText,
  Phone,
  UserCheck,
  Home,
  Download,
  User,
  Mail,
  Code,
  Lock,
  Unlock,
  Copy,
  ChevronDown,
  ChevronUp,
  Plus,
  Fingerprint,
  QrCode,
  XCircle,
  Eye,
  Hash,
  AtSign,
  CreditCard
} from 'lucide-react';
import * as ABDM from '@/lib/api/abdm';
import { generateCurlCommand, getFormattedHeaders } from '@/lib/api-client';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

type Step = 'configure' | 'send-otp' | 'verify-otp' | 'set-address' | 'complete' | 'view-profile' | 'manage-addresses' | 'mobile-update' | 'email-verification' | 'login-with-address' | 'verify-aadhaar-otp' | 'verify-abha-otp' | 'verify-abha-aadhaar-otp' | 'verify-password' | 'verify-mobile-otp' | 'download-card' | 'get-profile' | 'search-abha';

// Token Type Detector
function detectTokenType(token: string): 'Transaction' | 'Auth' | 'Unknown' {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.typ || 'Unknown';
    }
  } catch (e) {
    // Invalid token
  }
  return 'Unknown';
}

// API Response Viewer Component
function ApiResponseViewer({ title, data }: { title: string; data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  // Detect token types
  const xTokenType = data.tokens?.token ? detectTokenType(data.tokens.token) : null;
  const tTokenType = data.tokens?.tToken ? detectTokenType(data.tokens.tToken) : null;

  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-700">Click to {isExpanded ? 'hide' : 'show'} response data</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-blue-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-700">Response Data (JSON)</span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>

          {/* Extract and display important fields */}
          {data.txnId && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-yellow-900">Transaction ID:</span>
                <button
                  onClick={() => copyToClipboard(data.txnId)}
                  className="text-xs text-yellow-700 hover:text-yellow-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <code className="text-xs font-mono text-yellow-900 break-all">{data.txnId}</code>
            </div>
          )}

          {data.tokens && (
            <div className="mt-3 space-y-2">
              {data.tokens.token && (
                <div className={`p-3 rounded-lg border ${
                  xTokenType === 'Transaction'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${
                        xTokenType === 'Transaction' ? 'text-yellow-900' : 'text-green-900'
                      }`}>
                        X-Token ({xTokenType} Token):
                      </span>
                      {xTokenType === 'Transaction' && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded font-medium">
                          ⚠️ Enrollment Only
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(data.tokens.token)}
                      className={`text-xs flex items-center gap-1 ${
                        xTokenType === 'Transaction'
                          ? 'text-yellow-700 hover:text-yellow-800'
                          : 'text-green-700 hover:text-green-800'
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <code className={`text-xs font-mono break-all block ${
                    xTokenType === 'Transaction' ? 'text-yellow-900' : 'text-green-900'
                  }`}>
                    {data.tokens.token}
                  </code>
                  {xTokenType === 'Transaction' && (
                    <div className="mt-2 pt-2 border-t border-yellow-300">
                      <p className="text-xs text-yellow-800">
                        <strong>⚠️ This is a Transaction token</strong> - only valid for enrollment (setting ABHA address).
                        <br />
                        For profile operations (get profile, download card), you need an <strong>Auth token</strong>.
                        <br />
                        Use the "ABHA Login" flow below to get an Auth token.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {data.tokens.tToken && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-purple-900">T-Token (Transaction Token):</span>
                    <button
                      onClick={() => copyToClipboard(data.tokens.tToken)}
                      className="text-xs text-purple-700 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <code className="text-xs font-mono text-purple-900 break-all block">{data.tokens.tToken}</code>
                </div>
              )}

              {data.tokens.refreshToken && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-900">Refresh Token:</span>
                    <button
                      onClick={() => copyToClipboard(data.tokens.refreshToken)}
                      className="text-xs text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <code className="text-xs font-mono text-indigo-900 break-all block">{data.tokens.refreshToken}</code>
                </div>
              )}

              {data.tokens.expiresIn && (
                <div className="text-xs text-gray-600 mt-2">
                  <strong>Token expires in:</strong> {data.tokens.expiresIn} seconds ({Math.floor(data.tokens.expiresIn / 60)} minutes)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Developer Utilities Component
function DeveloperUtilities({ session, publicKey }: { session: any; publicKey?: string }) {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'token' | 'headers' | 'curl'>('encrypt');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const encryptText = async () => {
    try {
      const result = await ABDM.encryptData(inputText, 'abdm-default', { session });
      setOutputText(result.encrypted || 'Encryption failed');
    } catch (err: any) {
      setOutputText('Error: ' + err.message);
    }
  };

  const decodeToken = () => {
    try {
      const parts = tokenInput.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        setDecodedToken(payload);
      } else {
        setDecodedToken({ error: 'Invalid JWT format' });
      }
    } catch (err) {
      setDecodedToken({ error: 'Failed to decode token' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('encrypt')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === 'encrypt'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Encrypt
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === 'token'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="w-4 h-4 inline mr-2" />
          Token Inspector
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === 'headers'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Auth Headers
        </button>
        <button
          onClick={() => setActiveTab('curl')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === 'curl'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          cURL Examples
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'encrypt' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to encrypt (e.g., Aadhaar, OTP, Mobile)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                rows={3}
              />
            </div>
            <button
              onClick={encryptText}
              disabled={!inputText || !publicKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Encrypt (RSA-OAEP SHA-1)
            </button>
            {!publicKey && (
              <p className="text-sm text-yellow-800">Configure ABDM to get public key first</p>
            )}
            {outputText && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Encrypted Output</label>
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
                  rows={5}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'token' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste JWT token here"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                rows={3}
              />
            </div>
            <button
              onClick={decodeToken}
              disabled={!tokenInput}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Unlock className="w-4 h-4 inline mr-2" />
              Decode Token
            </button>
            {decodedToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decoded Payload</label>
                <pre className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50 overflow-auto max-h-96">
                  {JSON.stringify(decodedToken, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm text-green-800">
                <strong>All API requests automatically include these headers.</strong> Copy them for use in Postman or other API testing tools.
              </p>
            </div>

            {session ? (
              <>
                <div className="space-y-3">
                  {Object.entries(getFormattedHeaders(session)).map(([key, value]) => (
                    value && (
                      <div key={key} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-700">{key}</label>
                          <button
                            onClick={() => {
                              copyToClipboard(value);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded break-all">
                          {key === 'Authorization' ? `${value.substring(0, 30)}...` : value}
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const headers = getFormattedHeaders(session);
                      const formatted = Object.entries(headers)
                        .filter(([_, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join('\n');
                      copyToClipboard(formatted);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied All Headers!' : 'Copy All Headers'}
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Session Info:</strong>
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-blue-900">
                    <div>User ID: <span className="font-mono">{session.user?.id || 'N/A'}</span></div>
                    <div>Org ID: <span className="font-mono">{session.org_id || 'N/A'}</span></div>
                    <div>Org Slug: <span className="font-mono">{session.org_slug || 'N/A'}</span></div>
                    {session.roles && session.roles.length > 0 && (
                      <div>Roles: <span className="font-mono">{session.roles.join(', ')}</span></div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">No session found. Please log in to view authentication headers.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'curl' && (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800">
                <strong>✓ All headers automatically included!</strong> These cURL commands contain your actual session auth headers. Just copy and paste into your terminal or Postman.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Send OTP</h3>
                <button
                  onClick={() => {
                    const curl = generateCurlCommand(
                      '/api/abdm/send-otp',
                      'POST',
                      session,
                      { aadhaar: '946495363918', integrationName: 'abdm-default' }
                    );
                    copyToClipboard(curl);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{generateCurlCommand(
  '/api/abdm/send-otp',
  'POST',
  session,
  { aadhaar: '946495363918', integrationName: 'abdm-default' }
)}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Verify OTP</h3>
                <button
                  onClick={() => {
                    const curl = generateCurlCommand(
                      '/api/abdm/verify-otp',
                      'POST',
                      session,
                      { txnId: 'TRANSACTION_ID_FROM_SEND_OTP', otp: '123456', mobile: '9876543210' }
                    );
                    copyToClipboard(curl);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{generateCurlCommand(
  '/api/abdm/verify-otp',
  'POST',
  session,
  { txnId: 'TRANSACTION_ID_FROM_SEND_OTP', otp: '123456', mobile: '9876543210' }
)}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Get Profile</h3>
                <button
                  onClick={() => {
                    const curl = generateCurlCommand(
                      '/api/abdm/profile?xToken=X_TOKEN_FROM_LOGIN',
                      'GET',
                      session
                    );
                    copyToClipboard(curl);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{generateCurlCommand('/api/abdm/profile?xToken=X_TOKEN_FROM_LOGIN', 'GET', session)}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Encrypt Data</h3>
                <button
                  onClick={() => {
                    const curl = generateCurlCommand(
                      '/api/abdm/encrypt-data',
                      'POST',
                      session,
                      { data: '123456', integrationName: 'abdm-default' }
                    );
                    copyToClipboard(curl);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{generateCurlCommand(
  '/api/abdm/encrypt-data',
  'POST',
  session,
  { data: '123456', integrationName: 'abdm-default' }
)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Fetcher Component
function ProfileFetcher({ xToken, session, onResponse }: { xToken: string; session: any; onResponse?: (title: string, data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await ABDM.getProfile(xToken, undefined, { session });
      setProfileData(result.profile);
      if (onResponse) {
        onResponse('Get Profile Response', result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      if (onResponse) {
        onResponse('Get Profile Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <User className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Get Profile Details</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Fetch the complete ABHA profile using the X-Token received after enrollment.
      </p>

      <button
        onClick={fetchProfile}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Fetching...
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            Fetch Profile
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {profileData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900 mb-2">Profile Fetched Successfully!</p>
          <pre className="text-xs text-green-800 overflow-auto max-h-64">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Mobile Update Component
// Note: Requires txnId from enrollment/login session for mobile updates
function MobileUpdateFlow({ enrollmentTxnId, session }: { enrollmentTxnId?: string; session: any }) {
  const [step, setStep] = useState<'initial' | 'otp-sent' | 'verified'>('initial');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMobileOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Pass enrollmentTxnId if available (for mobile updates)
      const result = await ABDM.sendMobileOTP(mobile, enrollmentTxnId, undefined, { session });
      setTxnId(result.txnId);
      setStep('otp-sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Use correct scope per ABDM Postman: ["abha-enrol", "mobile-verify"]
      await ABDM.verifyMobileOTP(txnId, otp, ['abha-enrol', 'mobile-verify'], undefined, { session });
      setStep('verified');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('initial');
    setMobile('');
    setOtp('');
    setTxnId('');
    setError('');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Phone className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Update Mobile Number</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Update the mobile number associated with your ABHA account.
        {!enrollmentTxnId && (
          <span className="block mt-2 text-yellow-700">
            ⚠️ Note: You need to complete enrollment first to get a transaction ID for mobile updates.
          </span>
        )}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {step === 'initial' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Mobile Number
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={sendMobileOtp}
            disabled={loading || mobile.length !== 10}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
            Send OTP
          </button>
        </div>
      )}

      {step === 'otp-sent' && (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">OTP sent to {mobile}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={verifyMobileOtp}
            disabled={loading || otp.length !== 6}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify OTP
          </button>
        </div>
      )}

      {step === 'verified' && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Mobile number updated successfully!</p>
              <p className="text-xs text-green-700">Your ABHA account now uses {mobile}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Update Another Number
          </button>
        </div>
      )}
    </div>
  );
}

// Email Verification Component
function EmailVerificationFlow({ xToken, session }: { xToken: string; session: any }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const sendVerification = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSent(false);
      await ABDM.sendEmailVerification(xToken, email, undefined, { session });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification link');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setEmail('');
    setSent(false);
    setError('');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Add and verify an email address for your ABHA account.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!sent ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={sendVerification}
            disabled={loading || !email}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send Verification Link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Verification link sent!</p>
                <p className="text-xs text-green-700 mt-1">
                  Please check your email at <strong>{email}</strong> and click the verification link.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Send to Another Email
          </button>
        </div>
      )}
    </div>
  );
}

// Profile Viewer Component (Comprehensive Display)
function ProfileViewer({ xToken, session, existingProfile, onResponse }: {
  xToken: string;
  session: any;
  existingProfile?: any;
  onResponse?: (title: string, data: any) => void
}) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(existingProfile || null);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await ABDM.getProfile(xToken, undefined, { session });
      setProfileData(result.profile);
      if (onResponse) {
        onResponse('Get Profile Response', result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      if (onResponse) {
        onResponse('Get Profile Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if no existing profile
  React.useEffect(() => {
    if (!existingProfile) {
      fetchProfile();
    }
  }, []);

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm font-semibold text-red-900">Error Loading Profile</p>
        </div>
        <p className="text-xs text-red-700">{error}</p>
        <button
          onClick={fetchProfile}
          className="mt-3 px-3 py-1 text-xs bg-red-600 text-white rounded font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="space-y-3">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">ABHA Profile Details</h2>
          <p className="text-xs text-gray-600">Complete profile information</p>
        </div>
        <button
          onClick={fetchProfile}
          disabled={loading}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <User className="w-3 h-3" />}
          Refresh
        </button>
      </div>

      {/* Comprehensive Profile Card (Same as Complete Step) */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profileData.photo ? (
              <img
                src={`data:image/jpeg;base64,${profileData.photo}`}
                alt="Profile"
                className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="mt-2 px-2 py-0.5 bg-green-100 border border-green-300 rounded-full text-center">
              <span className="text-[9px] font-semibold text-green-700 uppercase">Active</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            {/* Name and ABHA Number */}
            <div className="mb-3">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">
                {profileData.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">ABHA Number:</span>
                <span className="text-xs font-mono font-semibold text-purple-700">
                  {profileData.ABHANumber}
                </span>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {/* Gender & DOB */}
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Gender</p>
                <p className="font-medium text-gray-900">{profileData.gender}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Date of Birth</p>
                <p className="font-medium text-gray-900">{profileData.dateOfBirth}</p>
              </div>

              {/* Mobile & Email */}
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Mobile</p>
                <p className="font-mono font-medium text-gray-900">{profileData.mobile}</p>
              </div>
              {profileData.email && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">Email</p>
                  <p className="font-medium text-gray-900 truncate">{profileData.email}</p>
                </div>
              )}

              {/* ABHA Address */}
              {(profileData.preferredAbhaAddress || profileData.phrAddress?.[0]) && (
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-600 mb-0.5">ABHA Address</p>
                  <p className="font-mono font-medium text-blue-700">
                    {profileData.preferredAbhaAddress || profileData.phrAddress?.[0]}
                  </p>
                </div>
              )}

              {/* State & District */}
              {profileData.stateName && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">State</p>
                  <p className="font-medium text-gray-900">{profileData.stateName}</p>
                </div>
              )}
              {profileData.districtName && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">District</p>
                  <p className="font-medium text-gray-900">{profileData.districtName}</p>
                </div>
              )}

              {/* Pin Code */}
              {profileData.pinCode && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">Pin Code</p>
                  <p className="font-mono font-medium text-gray-900">{profileData.pinCode}</p>
                </div>
              )}

              {/* Address */}
              {profileData.address && (
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-600 mb-0.5">Address</p>
                  <p className="text-xs font-medium text-gray-900">{profileData.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">{error}</p>
        </div>
      )}
    </div>
  );
}

// ABHA Login Flow Component
function ABHALoginFlow({
  abhaAddress,
  session,
  onLoginSuccess,
  onLoginOtpResponse,
  onVerifyLoginOtpResponse,
  onResponse
}: {
  abhaAddress: string;
  session: any;
  onLoginSuccess: (authToken: string) => void;
  onLoginOtpResponse?: (data: any) => void;
  onVerifyLoginOtpResponse?: (data: any) => void;
  onResponse?: (title: string, data: any) => void;
}) {
  const [step, setStep] = useState<'initial' | 'otp-sent'>('initial');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendLoginOtp = async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Call login API
      const response = await fetch('/api/abdm/login-with-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id,
          'x-org-id': session?.org_id
        },
        body: JSON.stringify({ abhaAddress })
      });

      const data = await response.json();
      if (data.success) {
        setTxnId(data.txnId);
        setStep('otp-sent');
        // Store response for API viewer
        if (onLoginOtpResponse) {
          onLoginOtpResponse(data);
        }
        if (onResponse) {
          onResponse('Login with ABHA Address - OTP Sent', data);
        }
      } else {
        setError(data.error || 'Failed to send OTP');
        if (onResponse) {
          onResponse('Login with ABHA Address Error', { error: data.error });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      if (onResponse) {
        onResponse('Login with ABHA Address Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/abdm/verify-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id,
          'x-org-id': session?.org_id
        },
        body: JSON.stringify({ txnId, otp })
      });

      const data = await response.json();
      if (data.success && data.tokens?.token) {
        onLoginSuccess(data.tokens.token);
        // Store response for API viewer
        if (onVerifyLoginOtpResponse) {
          onVerifyLoginOtpResponse(data);
        }
        if (onResponse) {
          onResponse('Verify Login OTP Success', data);
        }
      } else {
        setError(data.error || 'Failed to verify OTP');
        if (onResponse) {
          onResponse('Verify Login OTP Error', { error: data.error });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      if (onResponse) {
        onResponse('Verify Login OTP Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {step === 'initial' && (
        <div>
          <p className="text-sm text-blue-800 mb-3">
            ABHA Address: <strong>{abhaAddress}</strong>
          </p>
          <button
            onClick={sendLoginOtp}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            Send Login OTP
          </button>
        </div>
      )}

      {step === 'otp-sent' && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">OTP sent to your registered mobile</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={verifyLoginOtp}
            disabled={loading || otp.length !== 6}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify & Login
          </button>
        </div>
      )}
    </div>
  );
}

// ABHA Verification Flow Component
function ABHAVerificationFlow({
  method,
  session,
  onResponse
}: {
  method: 'verify-aadhaar-otp' | 'verify-abha-aadhaar-otp' | 'verify-abha-otp' | 'verify-password' | 'verify-mobile-otp';
  session: any;
  onResponse?: (title: string, data: any) => void;
}) {
  const [step, setStep] = useState<'input' | 'verify-otp' | 'complete'>('input');
  const [aadhaar, setAadhaar] = useState('');  // For ABHA number (with Aadhaar OTP)
  const [abhaNumber, setAbhaNumber] = useState('');  // For ABHA number (with ABHA OTP)
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [xToken, setXToken] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!session) return;

    setLoading(true);
    setError('');

    try {
      let result;

      switch (method) {
        case 'verify-aadhaar-otp':
          result = await ABDM.sendAuthOtpViaAadhaar(aadhaar, undefined, { session });
          break;
        case 'verify-abha-aadhaar-otp':
          result = await ABDM.sendAuthOtpViaAbhaAadhaar(abhaNumber, undefined, { session });
          break;
        case 'verify-abha-otp':
          result = await ABDM.sendAuthOtpViaAbhaNumber(abhaNumber, undefined, { session });
          break;
        case 'verify-mobile-otp':
          result = await ABDM.sendAuthOtpViaMobile(mobile, undefined, { session });
          break;
        default:
          throw new Error('Invalid method');
      }

      setTxnId(result.txnId);
      if (onResponse) {
        onResponse(`Send OTP Response (${method})`, result);
      }
      setStep('verify-otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      if (onResponse) {
        onResponse('Send OTP Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!session) return;

    setLoading(true);
    setError('');

    try {
      let result;

      switch (method) {
        case 'verify-aadhaar-otp':
          result = await ABDM.verifyAuthOtpViaAadhaar(txnId, otp, undefined, { session });
          break;
        case 'verify-abha-aadhaar-otp':
          result = await ABDM.verifyAuthOtpViaAbhaAadhaar(txnId, otp, undefined, { session });
          break;
        case 'verify-abha-otp':
          result = await ABDM.verifyAuthOtpViaAbhaNumber(txnId, otp, undefined, { session });
          break;
        case 'verify-mobile-otp':
          result = await ABDM.verifyAuthOtpViaMobile(txnId, otp, undefined, { session });
          break;
        default:
          throw new Error('Invalid method');
      }

      // Extract token and profile from response
      const responseData = (result as any).data || result;
      const authToken = responseData.token || (result as any).tokens?.token || '';
      const accounts = responseData.accounts || [];
      const profileData = accounts.length > 0 ? accounts[0] : ((result as any).profile || responseData);

      setXToken(authToken);
      setProfile(profileData);
      if (onResponse) {
        onResponse(`Verify OTP Response (${method})`, result);
      }
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      if (onResponse) {
        onResponse('Verify OTP Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!session) return;

    setLoading(true);
    setError('');

    try {
      const result = await ABDM.verifyViaPassword(abhaNumber, password, undefined, { session });

      setXToken(result.tokens?.token || '');
      setProfile(result.profile);
      if (onResponse) {
        onResponse('Password Verification Response', result);
      }
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to verify password');
      if (onResponse) {
        onResponse('Password Verification Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const getMethodLabel = () => {
    switch (method) {
      case 'verify-aadhaar-otp': return 'Aadhaar OTP';
      case 'verify-abha-aadhaar-otp': return 'ABHA + Aadhaar OTP';
      case 'verify-abha-otp': return 'ABHA OTP';
      case 'verify-password': return 'Password';
      case 'verify-mobile-otp': return 'Mobile OTP';
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Step */}
      {step === 'input' && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Verify via {getMethodLabel()}</h2>
            <p className="text-xs text-gray-600">
              {method === 'verify-password' ? 'Enter ABHA Number and Password' : 'Enter details to receive OTP'}
            </p>
          </div>

          {/* Aadhaar OTP Form - Uses ABHA Number with Aadhaar OTP system */}
          {method === 'verify-aadhaar-otp' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                ABHA Number * (OTP via Aadhaar)
              </label>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 14))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="12345678901234"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">OTP will be sent to Aadhaar-registered mobile</p>
            </div>
          )}

          {/* ABHA + Aadhaar OTP Form */}
          {method === 'verify-abha-aadhaar-otp' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                ABHA Number *
              </label>
              <input
                type="text"
                value={abhaNumber}
                onChange={(e) => setAbhaNumber(e.target.value.replace(/\D/g, '').slice(0, 14))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-transparent font-mono"
                placeholder="91734518160779 (14 digits)"
              />
              <p className="text-[9px] text-gray-500 mt-0.5">Enter 14-digit ABHA Number (without dashes)</p>
              <p className="text-[10px] text-cyan-700 mt-1 font-medium">OTP will be sent to Aadhaar-registered mobile</p>
            </div>
          )}

          {/* ABHA OTP Form */}
          {method === 'verify-abha-otp' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                ABHA Number *
              </label>
              <input
                type="text"
                value={abhaNumber}
                onChange={(e) => setAbhaNumber(e.target.value.replace(/\D/g, '').slice(0, 14))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent font-mono"
                placeholder="91734518160779 (14 digits)"
              />
              <p className="text-[9px] text-gray-500 mt-0.5">Enter 14-digit ABHA Number (without dashes)</p>
            </div>
          )}

          {/* Mobile OTP Form */}
          {method === 'verify-mobile-otp' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Mobile Number *
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent font-mono"
                placeholder="9876543210"
              />
            </div>
          )}

          {/* Password Form */}
          {method === 'verify-password' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  ABHA Number *
                </label>
                <input
                  type="text"
                  value={abhaNumber}
                  onChange={(e) => setAbhaNumber(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent font-mono"
                  placeholder="91734518160779 (14 digits)"
                />
                <p className="text-[9px] text-gray-500 mt-0.5">Enter 14-digit ABHA Number (without dashes)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={method === 'verify-password' ? handleVerifyPassword : handleSendOTP}
            disabled={loading ||
              (method === 'verify-aadhaar-otp' && !aadhaar) ||
              (method === 'verify-abha-aadhaar-otp' && !abhaNumber) ||
              (method === 'verify-abha-otp' && !abhaNumber) ||
              (method === 'verify-mobile-otp' && !mobile) ||
              (method === 'verify-password' && (!abhaNumber || !password))
            }
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {method === 'verify-password' ? 'Verify' : 'Send OTP'}
          </button>
        </>
      )}

      {/* Verify OTP Step */}
      {step === 'verify-otp' && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Verify OTP</h2>
            <p className="text-xs text-gray-600">Enter the OTP sent to your registered number</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              OTP *
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono tracking-wider text-center"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Verify OTP
          </button>
        </>
      )}

      {/* Complete Step */}
      {step === 'complete' && xToken && (
        <>
          <div className="p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-green-900">
              Verification Successful! Authentication token received.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Fetch Profile Button */}
            <button
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const result = await ABDM.getProfile(xToken, undefined, { session });
                  if (result.success && result.profile) {
                    setProfile(result.profile);
                    if (onResponse) {
                      onResponse('Get Profile Success', result);
                    }
                  } else {
                    throw new Error('No profile data received');
                  }
                } catch (err: any) {
                  setError(err.message || 'Failed to fetch profile');
                  if (onResponse) {
                    onResponse('Get Profile Error', { error: err.message });
                  }
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-3 py-2 text-xs bg-teal-600 text-white rounded font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              <UserCheck className="w-3.5 h-3.5" />
              Show Profile
            </button>

            {/* Download Card Button */}
            <button
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const result = await ABDM.downloadAbhaCard(xToken, undefined, { session });

                  const contentType = result.contentType || 'application/pdf';
                  const format = (result as any).format || 'pdf';
                  const extension = format === 'png' ? 'png' : 'pdf';

                  // Convert base64 to blob and download
                  const byteCharacters = atob(result.card);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: contentType });

                  // Create download link
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `ABHA-Card.${extension}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);

                  if (onResponse) {
                    onResponse('Download ABHA Card Success', { success: true, format, size: blob.size });
                  }
                } catch (err: any) {
                  setError(err.message || 'Failed to download card');
                  if (onResponse) {
                    onResponse('Download ABHA Card Error', { error: err.message });
                  }
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-3 py-2 text-xs bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              <Download className="w-3.5 h-3.5" />
              Download Card
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-900">{error}</p>
            </div>
          )}

          {/* Profile Card - Show when profile exists */}
          {profile && (
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {(profile.profilePhoto || profile.photo) ? (
                  <img
                    src={`data:image/jpeg;base64,${profile.profilePhoto || profile.photo}`}
                    alt="Profile"
                    className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center border-2 border-white shadow-md">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="mt-2 px-2 py-0.5 bg-green-100 border border-green-300 rounded-full text-center">
                  <span className="text-[9px] font-semibold text-green-700 uppercase">Verified</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">
                    {profile.name || 'N/A'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">ABHA Number:</span>
                    <span className="text-xs font-mono font-semibold text-purple-700">
                      {profile.ABHANumber || profile.abhaNumber || 'N/A'}
                    </span>
                  </div>
                  {(profile.preferredAbhaAddress || profile.abhaAddress) && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-600">ABHA Address:</span>
                      <span className="text-xs font-mono font-medium text-blue-600">
                        {profile.preferredAbhaAddress || profile.abhaAddress}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Gender</p>
                    <p className="font-medium text-gray-900">{profile.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Date of Birth</p>
                    <p className="font-medium text-gray-900">{profile.dob || profile.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">Mobile</p>
                    <p className="font-mono font-medium text-gray-900">{profile.mobile || 'N/A'}</p>
                  </div>
                  {profile.email && (
                    <div>
                      <p className="text-[10px] text-gray-600 mb-0.5">Email</p>
                      <p className="font-medium text-gray-900 truncate">{profile.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* X-Token Display */}
          {xToken && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-[10px] font-semibold text-blue-900 mb-1">X-Token (Auth Token)</p>
              <code className="text-[9px] font-mono text-blue-700 break-all">
                {xToken.substring(0, 80)}...
              </code>
            </div>
          )}

          {/* Profile Management Actions */}
          {xToken && profile && (
            <div className="space-y-2">
              <ProfileQRCodeViewer xToken={xToken} session={session} onResponse={onResponse} />
              <ProfilePhotoUpdater xToken={xToken} session={session} onResponse={onResponse} onPhotoUpdate={(newPhoto) => setProfile({ ...profile, profilePhoto: newPhoto })} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Profile QR Code Viewer Component
function ProfileQRCodeViewer({ xToken, session, onResponse }: { xToken: string; session: any; onResponse?: (title: string, data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const fetchQRCode = async () => {
    if (qrCode) {
      setShowQR(!showQR);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await ABDM.getQRCode(xToken, undefined, { session });

      if (result.success && result.qrCode) {
        setQrCode(result.qrCode);
        setShowQR(true);
        if (onResponse) {
          onResponse('QR Code Generated', result);
        }
      } else {
        throw new Error('Failed to generate QR code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch QR code');
      if (onResponse) {
        onResponse('QR Code Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-semibold text-gray-900">Profile QR Code</h4>
        </div>
        <button
          onClick={fetchQRCode}
          disabled={loading}
          className="px-2 py-1 text-xs bg-purple-600 text-white rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {qrCode ? (showQR ? 'Hide QR' : 'Show QR') : 'Generate QR'}
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <XCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-red-900">{error}</p>
        </div>
      )}

      {showQR && qrCode && (
        <div className="flex justify-center p-3 bg-white border-2 border-purple-200 rounded-lg">
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="ABHA QR Code"
            className="w-48 h-48"
          />
        </div>
      )}
    </div>
  );
}

// Profile Photo Updater Component
function ProfilePhotoUpdater({
  xToken,
  session,
  onResponse,
  onPhotoUpdate
}: {
  xToken: string;
  session: any;
  onResponse?: (title: string, data: any) => void;
  onPhotoUpdate?: (newPhoto: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError('Image size should be less than 1MB');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(',')[1];

          const result = await ABDM.updateProfilePhoto(xToken, base64Data, undefined, { session });

          if (result.success) {
            setSuccess(true);
            if (onPhotoUpdate) {
              onPhotoUpdate(base64Data);
            }
            if (onResponse) {
              onResponse('Photo Updated', result);
            }
            // Clear file input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else {
            throw new Error('Failed to update photo');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to update photo');
          if (onResponse) {
            onResponse('Photo Update Error', { error: err.message });
          }
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-semibold text-gray-900">Update Profile Photo</h4>
        </div>
        <label className="px-2 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 cursor-pointer flex items-center gap-1">
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {loading ? 'Uploading...' : 'Choose Photo'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <XCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-red-900">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          <p className="text-[10px] text-green-900 font-medium">Photo updated successfully!</p>
        </div>
      )}

      <p className="text-[9px] text-gray-500">Max size: 1MB. Formats: JPG, PNG</p>
    </div>
  );
}

// ABHA Card Downloader Component
function ABHACardDownloader({ xToken, session, onResponse }: { xToken: string; session: any; onResponse?: (title: string, data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const downloadCard = async () => {
    try {
      setLoading(true);
      setError('');
      setDownloaded(false);

      const result = await ABDM.downloadAbhaCard(xToken, undefined, { session });

      console.log('Download card result:', {
        contentType: result.contentType,
        format: (result as any).format,
        cardLength: result.card?.length,
        cardPreview: result.card?.substring(0, 100)
      });

      // Determine file extension and MIME type
      const contentType = result.contentType || 'application/pdf';
      const format = (result as any).format || 'pdf';
      const extension = format === 'png' ? 'png' : 'pdf';

      console.log('Detected format:', extension, 'Content-Type:', contentType);

      // Convert base64 to blob and download
      const byteCharacters = atob(result.card);
      console.log('Decoded byte characters length:', byteCharacters.length);

      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });

      console.log('Created blob:', blob.size, 'bytes, type:', blob.type);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ABHA-Card.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
      if (onResponse) {
        onResponse('Download ABHA Card Success', { success: true, format, contentType, cardSize: blob.size });
      }
    } catch (err: any) {
      // Enhanced error message for common issues
      let errorMessage = err.message || 'Failed to download card';
      if (onResponse) {
        onResponse('Download ABHA Card Error', { error: errorMessage });
      }

      if (errorMessage.includes('User not found') || errorMessage.includes('ABDM-1114')) {
        errorMessage = 'Card not available. This may occur if:\n• Account is newly created\n• KYC verification is incomplete\n• Sandbox account has no card data\n\nTry again later or contact ABDM support.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Download className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Download ABHA Card</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Download the ABHA card as a PDF document using the X-Token.
      </p>

      <button
        onClick={downloadCard}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download Card
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {downloaded && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">Card downloaded successfully!</p>
        </div>
      )}
    </div>
  );
}

// Search ABHA Component - Supports ABHA Number and ABHA Address
// Using ABDM PHR Web Login Search API (mobile search not supported by this endpoint)
function SearchABHAByMobile({ session, onResponse }: { session: any; onResponse?: (title: string, data: any) => void }) {
  const [searchType, setSearchType] = useState<'abha-number' | 'abha-address'>('abha-number');
  const [abhaNumber, setAbhaNumber] = useState('');
  const [abhaAddress, setAbhaAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Authentication state - simplified flow (no account selection needed)
  const [authMethod, setAuthMethod] = useState<'mobile-otp' | 'aadhaar-otp' | 'fingerprint' | 'face' | 'iris' | null>(null);
  const [authStep, setAuthStep] = useState<'search' | 'select-method' | 'enter-otp' | 'enter-pid' | 'complete'>('search');
  const [otpTxnId, setOtpTxnId] = useState('');
  const [otp, setOtp] = useState('');
  const [pid, setPid] = useState('');
  const [xToken, setXToken] = useState('');
  const [authProfile, setAuthProfile] = useState<any>(null);

  const handleSearch = async () => {
    // Validation based on search type
    if (searchType === 'abha-number') {
      const cleanAbhaNumber = abhaNumber.replace(/-/g, '');
      if (!cleanAbhaNumber || cleanAbhaNumber.length !== 14 || !/^\d+$/.test(cleanAbhaNumber)) {
        setError('Please enter a valid 14-digit ABHA Number');
        return;
      }
    } else if (searchType === 'abha-address') {
      if (!abhaAddress || !abhaAddress.includes('@')) {
        setError('Please enter a valid ABHA Address (e.g., username@abdm)');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      setProfile(null);
      setSearchPerformed(false);

      let result;
      if (searchType === 'abha-number') {
        result = await ABDM.searchAbhaByAbhaNumber(abhaNumber.replace(/-/g, ''), undefined, { session });
      } else if (searchType === 'abha-address') {
        result = await ABDM.searchAbhaByAbhaAddress(abhaAddress, undefined, { session });
      }

      if (result && result.success && (result as any).profile) {
        setProfile((result as any).profile);
        setSearchPerformed(true);
        setAuthStep('select-method');
        if (onResponse) {
          onResponse('Search ABHA Success', result);
        }
      } else {
        throw new Error('Search failed or no profile found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search ABHA account');
      if (onResponse) {
        onResponse('Search ABHA Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setAbhaNumber('');
    setAbhaAddress('');
    setProfile(null);
    setSearchPerformed(false);
    setAuthMethod(null);
    setAuthStep('search');
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-orange-600" />
          Search & Authenticate ABHA
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          {authStep === 'search' && 'Search ABHA profile by ABHA number or ABHA address'}
          {authStep === 'select-method' && 'Profile found - use direct authentication APIs'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Search */}
      {authStep === 'search' && (
        <div className="space-y-3">
          {/* Search Type Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Search By *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSearchType('abha-number')}
                className={`px-3 py-2 text-xs border rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  searchType === 'abha-number'
                    ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                ABHA Number
              </button>
              <button
                onClick={() => setSearchType('abha-address')}
                className={`px-3 py-2 text-xs border rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  searchType === 'abha-address'
                    ? 'bg-purple-100 border-purple-400 text-purple-800 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AtSign className="w-3.5 h-3.5" />
                ABHA Address
              </button>
            </div>
          </div>

          {/* ABHA Number Input */}
          {searchType === 'abha-number' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ABHA Number *
              </label>
              <input
                type="text"
                value={abhaNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = value;
                  if (value.length > 2) {
                    formatted = value.slice(0, 2) + '-' + value.slice(2);
                  }
                  if (value.length > 6) {
                    formatted = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6);
                  }
                  if (value.length > 10) {
                    formatted = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 10) + '-' + value.slice(10, 14);
                  }
                  setAbhaNumber(formatted);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="12-3456-7890-1234"
                maxLength={17}
              />
              <p className="text-xs text-gray-500 mt-1">Enter 14-digit ABHA Number</p>
            </div>
          )}

          {/* ABHA Address Input */}
          {searchType === 'abha-address' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ABHA Address *
              </label>
              <input
                type="text"
                value={abhaAddress}
                onChange={(e) => setAbhaAddress(e.target.value.toLowerCase())}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="username@sbx"
              />
              <p className="text-xs text-gray-500 mt-1">Enter ABHA Address (e.g., username@sbx)</p>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading || (
              (searchType === 'abha-number' && abhaNumber.replace(/-/g, '').length !== 14) ||
              (searchType === 'abha-address' && !abhaAddress.includes('@'))
            )}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Search ABHA Accounts
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Profile Found */}
      {authStep === 'select-method' && profile && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-green-900">
              ABHA Profile Found!
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Profile Information</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="font-bold text-gray-900">{profile.fullName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">ABHA Number:</span>
                <span className="font-mono font-semibold text-orange-700">
                  {profile.healthIdNumber || 'N/A'}
                </span>
              </div>
              {profile.abhaAddress && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">ABHA Address:</span>
                  <span className="font-mono font-medium text-blue-600">
                    {profile.abhaAddress}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Mobile:</span>
                <span className="font-mono text-gray-900">{profile.mobile || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className={`font-semibold ${profile.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                  {profile.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {profile.authMethods && profile.authMethods.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-blue-900 mb-2">Available Authentication Methods</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.authMethods.map((method: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-[10px] font-medium border border-blue-300"
                  >
                    {method}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-blue-700 mt-2">
                Use the authentication APIs in the sidebar to login with this profile
              </p>
            </div>
          )}

          <button
            onClick={resetFlow}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            New Search
          </button>
        </div>
      )}
    </div>
  );
}

// Profile Details Viewer Component
function ProfileDetailsViewer({ xToken, session, onResponse }: { xToken: string; session: any; onResponse?: (title: string, data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setProfile(null);

      const result = await ABDM.getProfile(xToken, undefined, { session });

      if (result.success && result.profile) {
        setProfile(result.profile);
        if (onResponse) {
          onResponse('Get Profile Success', result);
        }
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      if (onResponse) {
        onResponse('Get Profile Error', { error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={fetchProfile}
        disabled={loading}
        className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading Profile...
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4" />
            Fetch Profile
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {profile && (
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {(profile.profilePhoto || profile.photo) ? (
                <img
                  src={`data:image/jpeg;base64,${profile.profilePhoto || profile.photo}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center border-2 border-white shadow-md">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {profile.name || profile.fullName || 'N/A'}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">ABHA Number:</span>
                    <span className="text-sm font-mono font-semibold text-purple-700">
                      {profile.ABHANumber || profile.healthIdNumber || profile.abhaNumber || 'N/A'}
                    </span>
                  </div>
                  {(profile.preferredAbhaAddress || profile.healthId || profile.abhaAddress) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">ABHA Address:</span>
                      <span className="text-sm font-mono font-medium text-blue-600">
                        {profile.preferredAbhaAddress || profile.healthId || profile.abhaAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Gender</p>
                  <p className="font-medium text-gray-900">{profile.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Date of Birth</p>
                  <p className="font-medium text-gray-900">{profile.dob || profile.dateOfBirth || profile.birthdate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Mobile</p>
                  <p className="font-mono font-medium text-gray-900">{profile.mobile || 'N/A'}</p>
                </div>
                {profile.email && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900 truncate">{profile.email}</p>
                  </div>
                )}
                {profile.address && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-900 text-xs">{profile.address}</p>
                  </div>
                )}
                {profile.state && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">State</p>
                    <p className="font-medium text-gray-900">{profile.state}</p>
                  </div>
                )}
                {profile.district && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">District</p>
                    <p className="font-medium text-gray-900">{profile.district}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Manage ABHA Addresses Component
function ManageAbhaAddresses({
  profile,
  xToken,
  tToken,
  session,
  config,
  onAddressAdded
}: {
  profile: any;
  xToken: string;
  tToken?: string; // txnId from enrollment for initial setup
  session: any;
  config: any;
  onAddressAdded: (newAddress: string) => void;
}) {
  const [showAddAddressFlow, setShowAddAddressFlow] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressTxnId, setAddressTxnId] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [selectedNewAddress, setSelectedNewAddress] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const existingAddresses = (profile.phrAddress || [profile.preferredAbhaAddress]).filter(Boolean);
  const hasNoAddress = existingAddresses.length === 0;

  const startAddAddressFlow = async () => {
    if (!session) {
      setError('Please login to manage addresses');
      return;
    }

    setShowAddAddressFlow(true);
    setError('');
    setSuccess('');

    try {
      setLoadingSuggestions(true);
      let txnId = '';

      if (hasNoAddress && tToken) {
        // INITIAL SETUP: Use txnId from enrollment
        console.log('Using enrollment txnId for initial address setup');
        txnId = tToken;
      } else if (existingAddresses.length > 0) {
        // ADDITIONAL ADDRESS: Login with existing address to get new txnId
        if (!xToken) {
          setError('Please login with your ABHA address first');
          setLoadingSuggestions(false);
          return;
        }
        console.log('Login with existing address to add more');
        const loginResponse = await ABDM.loginWithAbhaAddress(existingAddresses[0], config.name, { session });
        txnId = loginResponse.txnId;
      } else {
        setError('No transaction token available. Please re-enroll or login.');
        setLoadingSuggestions(false);
        return;
      }

      setAddressTxnId(txnId);

      // Get address suggestions
      const suggestionsResponse = await ABDM.getAddressSuggestions(txnId, config.name, { session });

      console.log('Address suggestions response:', suggestionsResponse);

      const suggestions = Array.isArray(suggestionsResponse.suggestions)
        ? suggestionsResponse.suggestions
        : Array.isArray(suggestionsResponse)
        ? suggestionsResponse
        : [];

      setAddressSuggestions(suggestions);

      if (suggestions.length > 0) {
        setSelectedNewAddress(suggestions[0]);
      }
    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
      setError(err.message || 'Failed to load address suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddAddress = async () => {
    if (!selectedNewAddress || !addressTxnId) {
      setError('Please select an address');
      return;
    }

    setAddingAddress(true);
    setError('');

    try {
      await ABDM.setAbhaAddress(addressTxnId, selectedNewAddress, config.name, { session });
      setSuccess(`Successfully added ABHA address: ${selectedNewAddress}`);
      onAddressAdded(selectedNewAddress);

      // Reset flow
      setTimeout(() => {
        setShowAddAddressFlow(false);
        setSuccess('');
        setAddressTxnId('');
        setAddressSuggestions([]);
        setSelectedNewAddress('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add ABHA address');
    } finally {
      setAddingAddress(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Home className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage ABHA Addresses</h2>
            <p className="text-sm text-gray-600">
              You can have multiple ABHA addresses linked to your ABHA number
            </p>
          </div>
        </div>
      </div>

      {/* List of existing addresses */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Your ABHA Addresses</h3>
        {hasNoAddress ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ No ABHA address set yet. You need to set at least one ABHA address to complete your profile.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {existingAddresses.map((address: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-mono font-medium text-gray-900">{address}</span>
                </div>
                {index === 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Preferred
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {!showAddAddressFlow ? (
        <>
          <button
            onClick={startAddAddressFlow}
            disabled={hasNoAddress ? !tToken : !xToken}
            className={`px-4 py-2 ${hasNoAddress ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {hasNoAddress ? <Home className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {hasNoAddress ? 'Set Your ABHA Address' : 'Add Another ABHA Address'}
          </button>
          {hasNoAddress && !tToken && (
            <p className="mt-2 text-xs text-gray-600">
              Complete enrollment first to set your ABHA address
            </p>
          )}
          {!hasNoAddress && !xToken && (
            <p className="mt-2 text-xs text-gray-600">
              Please login with your ABHA address to add more addresses
            </p>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading suggestions...</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {hasNoAddress ? 'Select Your ABHA Address' : 'Select New ABHA Address'}
                </label>
                <div className="space-y-2">
                  {addressSuggestions.map((suggestion, index) => (
                    <label
                      key={index}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="newAbhaAddress"
                        value={suggestion}
                        checked={selectedNewAddress === suggestion}
                        onChange={(e) => setSelectedNewAddress(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium text-gray-900">{suggestion}</span>
                    </label>
                  ))}
                </div>
              </div>

              {addressSuggestions.length === 0 && !loadingSuggestions && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No new suggestions available. All available addresses may already be in use.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddAddress}
                  disabled={addingAddress || !selectedNewAddress}
                  className={`px-4 py-2 ${hasNoAddress ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {addingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                  {hasNoAddress ? 'Set Address' : 'Add Address'}
                </button>

                <button
                  onClick={() => {
                    setShowAddAddressFlow(false);
                    setError('');
                    setAddressTxnId('');
                    setAddressSuggestions([]);
                    setSelectedNewAddress('');
                  }}
                  disabled={addingAddress}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!xToken && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Please login with your ABHA address to add more addresses
          </p>
        </div>
      )}
    </div>
  );
}

export default function ABDMIntegrationPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>('configure');

  // Accordion state for M1 sections
  const [openSections, setOpenSections] = useState<string[]>(['config']);
  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Latest API Response for results panel
  const [latestResponse, setLatestResponse] = useState<any>(null);
  const [latestResponseTitle, setLatestResponseTitle] = useState('');

  // Configuration state
  const [config, setConfig] = useState({
    name: 'abdm-default',
    clientId: 'SBXID_010974',
    clientSecret: '819c50ef-6ad7-4680-ae86-d4d3acda2e85',
    xCmId: 'sbx',
    environment: 'sandbox' as 'sandbox' | 'production'
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [configError, setConfigError] = useState('');

  // Testing state
  const [aadhaar, setAadhaar] = useState('946495363918'); // Default test value
  const [mobile, setMobile] = useState('9876543210'); // Default test value
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [profile, setProfile] = useState<ABDM.ABHAProfile | null>(null);
  const [error, setError] = useState('');

  // ABHA Address state
  const [tToken, setTToken] = useState('');
  const [xToken, setXToken] = useState(''); // For additional operations
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [settingAddress, setSettingAddress] = useState(false);

  // Developer utilities state
  const [publicKey, setPublicKey] = useState<string>('');

  // API Response tracking for Postman testing
  const [otpResponse, setOtpResponse] = useState<any>(null);
  const [verifyOtpResponse, setVerifyOtpResponse] = useState<any>(null);
  const [loginOtpResponse, setLoginOtpResponse] = useState<any>(null);
  const [verifyLoginOtpResponse, setVerifyLoginOtpResponse] = useState<any>(null);

  // Load existing configuration
  useEffect(() => {
    loadConfiguration();
  }, [session]);

  const loadConfiguration = async () => {
    if (!session) return;

    try {
      const response = await ABDM.listIntegrations({ session });
      if (response.integrations.length > 0) {
        setConfigSaved(true);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const handleSaveConfig = async () => {
    if (!session) {
      setConfigError('Please log in to configure ABDM');
      return;
    }

    setConfigSaving(true);
    setConfigError('');

    try {
      const response = await ABDM.configureABDM(config, { session });
      setConfigSaved(true);
      setConfigError('');
      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('Configuration Saved');
      alert('ABDM configuration saved successfully!');
      // Fetch public key for utilities
      fetchPublicKey();
    } catch (error: any) {
      setConfigError(error.message || 'Failed to save configuration');
      setLatestResponse({ error: error.message });
      setLatestResponseTitle('Configuration Error');
    } finally {
      setConfigSaving(false);
    }
  };

  const fetchPublicKey = async () => {
    if (!session) return;

    try {
      const response = await ABDM.getPublicCertificate(config.name, { session });
      if (response.success && response.certificate) {
        setPublicKey(response.certificate);
      }
      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('Public Certificate');
    } catch (error: any) {
      console.error('Failed to fetch public key:', error);
      setLatestResponse({ error: error.message || 'Failed to fetch public key' });
      setLatestResponseTitle('Public Certificate Error');
    }
  };

  const handleTestConnection = async () => {
    if (!session) {
      alert('Please log in to test connection');
      return;
    }

    try {
      const response = await ABDM.testConnection(config.name, { session });
      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('Test Connection Response');
      if (response.success) {
        alert('✓ Connection successful!');
      } else {
        alert('✗ Connection failed');
      }
    } catch (error: any) {
      setLatestResponse({ error: error.message });
      setLatestResponseTitle('Test Connection Error');
      alert(`Connection failed: ${error.message}`);
    }
  };

  const handleSendOTP = async () => {
    if (!session) {
      setError('Please log in to send OTP');
      return;
    }

    if (!aadhaar || aadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setOtpSending(true);
    setError('');
    setOtpMessage('');

    try {
      const response = await ABDM.sendOTP(aadhaar, config.name, { session });
      setTxnId(response.txnId);
      setOtpMessage(response.message);
      setOtpResponse(response); // Store full response for API viewer
      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('Send OTP Response');
      toggleSection('enrollment'); // Open enrollment section
      setCurrentStep('verify-otp');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
      setLatestResponse({ error: error.message });
      setLatestResponseTitle('Send OTP Error');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!session) {
      setError('Please log in to verify OTP');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setOtpVerifying(true);
    setError('');

    try {
      const response = await ABDM.verifyOTP(txnId, otp, mobile, config.name, { session });
      console.log('Verify OTP Response:', response);

      setProfile(response.profile);
      setVerifyOtpResponse(response); // Store full response for API viewer
      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('Verify OTP & Enroll Response');

      // Store X-Token for additional operations
      // Try multiple possible locations for the token
      const xTokenValue = (response as any).tokens?.token ||
                          (response as any).tokens?.xToken ||
                          (response.profile as any).xToken ||
                          (response.profile as any).token;

      console.log('Extracted X-Token:', xTokenValue ? 'Found' : 'Not found');
      console.log('Token keys in response:', Object.keys((response as any).tokens || {}));

      if (xTokenValue) {
        setXToken(xTokenValue);
      }

      // Check if we got a T-Token (for new accounts or accounts without ABHA address)
      const tTokenValue = (response as any).tokens?.tToken || (response.profile as any).tToken;
      const addressTxnId = (response as any).txnId || (response as any).data?.txnId;

      console.log('Enrollment successful - X-Token:', xTokenValue ? 'Found' : 'Not found');
      console.log('Profile has preferredAbhaAddress:', response.profile?.preferredAbhaAddress);
      console.log('Profile has phrAddress:', (response.profile as any)?.phrAddress);

      // Store txnId or tToken for address management later
      if (addressTxnId || tTokenValue) {
        setTToken(addressTxnId || tTokenValue);
      }

      // ALWAYS go to complete step - address management is now in "Manage ABHA Addresses" section
      setCurrentStep('complete');
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP');
      setLatestResponse({ error: error.message });
      setLatestResponseTitle('Verify OTP Error');
    } finally {
      setOtpVerifying(false);
    }
  };

  const loadAddressSuggestions = async (txnIdOrToken: string) => {
    if (!session) return;

    setLoadingSuggestions(true);
    setError('');

    try {
      const response = await ABDM.getAddressSuggestions(txnIdOrToken, config.name, { session });
      console.log('Address suggestions response:', response);

      // Ensure we always have an array
      const suggestions = Array.isArray(response.suggestions)
        ? response.suggestions
        : Array.isArray(response)
        ? response
        : [];

      setAddressSuggestions(suggestions);
      if (suggestions.length > 0) {
        setSelectedAddress(suggestions[0]);
      }

      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('ABHA Address Suggestions');
    } catch (error: any) {
      console.error('Failed to load suggestions:', error);
      setError(error.message || 'Failed to load address suggestions');
      setAddressSuggestions([]); // Ensure it's an array even on error
      setLatestResponse({ error: error.message });
      setLatestResponseTitle('Address Suggestions Error');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSetAddress = async () => {
    if (!session) {
      setError('Please log in to set ABHA address');
      return;
    }

    if (!selectedAddress) {
      setError('Please select an ABHA address');
      return;
    }

    setSettingAddress(true);
    setError('');

    try {
      const response = await ABDM.setAbhaAddress(tToken, selectedAddress, config.name, { session });
      setLatestResponse(response); // Show in results panel
      setLatestResponseTitle('Set ABHA Address Response');

      // Update profile with selected address
      if (profile) {
        setProfile({
          ...profile,
          preferredAbhaAddress: selectedAddress
        });
      }
      setCurrentStep('complete');
    } catch (error: any) {
      setError(error.message || 'Failed to set ABHA address');
      setLatestResponse({ error: error.message });
      setLatestResponseTitle('Set ABHA Address Error');
    } finally {
      setSettingAddress(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep('send-otp');
    setAadhaar('946495363918');
    setMobile('9876543210');
    setOtp('');
    setTxnId('');
    setOtpMessage('');
    setProfile(null);
    setError('');
    setTToken('');
    setXToken('');
    setAddressSuggestions([]);
    setSelectedAddress('');
    setOtpResponse(null);
    setVerifyOtpResponse(null);
  };

  const steps = [
    { id: 'configure', label: 'Configure', icon: Settings },
    { id: 'send-otp', label: 'Send OTP', icon: Shield },
    { id: 'verify-otp', label: 'Verify OTP', icon: Key },
    { id: 'complete', label: 'Complete', icon: CheckCircle2 }
  ];

  const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                ABDM Integration & Testing
              </h1>
              <p className="text-xs text-gray-600">
                Configure ABDM and test ABHA enrollment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                config.environment === 'sandbox'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {config.environment.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT SIDEBAR - Navigation/Actions (2/12) */}
          <div className="lg:col-span-2 space-y-2">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2 px-1">M1 Actions</p>

              {/* Config Button */}
              <button
                onClick={() => setCurrentStep('configure')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'configure'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configuration</span>
              </button>

              {/* Enrollment Button */}
              <button
                onClick={() => setCurrentStep('send-otp')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  (currentStep === 'send-otp' || currentStep === 'verify-otp')
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ABHA Creation</span>
              </button>

              {/* Profile Button */}
              {profile && xToken && (
                <button
                  onClick={() => setCurrentStep('view-profile')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'view-profile'
                      ? 'bg-cyan-100 text-cyan-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Get Profile</span>
                </button>
              )}

              {/* Download Card Button */}
              {profile && xToken && (
                <button
                  onClick={async () => {
                    try {
                      const result = await ABDM.downloadAbhaCard(xToken, undefined, { session });
                      const contentType = result.contentType || 'application/pdf';
                      const format = (result as any).format || 'pdf';
                      const extension = format === 'png' ? 'png' : 'pdf';

                      const byteCharacters = atob(result.card);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: contentType });

                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `ABHA-Card.${extension}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);

                      setLatestResponse({ success: true, format, contentType, cardSize: blob.size });
                      setLatestResponseTitle('Download ABHA Card Success');
                    } catch (err: any) {
                      setLatestResponse({ error: err.message });
                      setLatestResponseTitle('Download ABHA Card Error');
                    }
                  }}
                  className="w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </button>
              )}

              {/* Manage ABHA Addresses */}
              {profile && (
                <button
                  onClick={() => setCurrentStep('manage-addresses')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'manage-addresses'
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Manage Addresses</span>
                </button>
              )}

              {/* Mobile Update */}
              {profile && txnId && (
                <button
                  onClick={() => setCurrentStep('mobile-update')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'mobile-update'
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Update Mobile</span>
                </button>
              )}

              {/* Email Verification */}
              {profile && xToken && (
                <button
                  onClick={() => setCurrentStep('email-verification')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'email-verification'
                      ? 'bg-pink-100 text-pink-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Verify Email</span>
                </button>
              )}

              {/* Login with ABHA Address */}
              {profile && !xToken && (profile as any).phrAddress?.[0] && (
                <button
                  onClick={() => setCurrentStep('login-with-address')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'login-with-address'
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Login with Address</span>
                </button>
              )}
            </div>

            {/* ABHA Verification Section */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2 px-1">ABHA Verification</p>

              {/* Verify via Aadhaar OTP */}
              <button
                onClick={() => setCurrentStep('verify-aadhaar-otp')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'verify-aadhaar-otp'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span>Aadhaar OTP</span>
                  <span className="text-[9px] text-gray-500">Aadhaar → Aadhaar OTP</span>
                </div>
              </button>

              {/* Verify via ABHA + Aadhaar OTP */}
              <button
                onClick={() => setCurrentStep('verify-abha-aadhaar-otp')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'verify-abha-aadhaar-otp'
                    ? 'bg-cyan-100 text-cyan-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span>ABHA + Aadhaar OTP</span>
                  <span className="text-[9px] text-gray-500">ABHA → Aadhaar OTP</span>
                </div>
              </button>

              {/* Verify via ABHA OTP */}
              <button
                onClick={() => setCurrentStep('verify-abha-otp')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'verify-abha-otp'
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span>ABHA OTP</span>
                  <span className="text-[9px] text-gray-500">ABHA + ABDM OTP</span>
                </div>
              </button>

              {/* Verify via Password */}
              <button
                onClick={() => setCurrentStep('verify-password')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'verify-password'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span>Password</span>
                  <span className="text-[9px] text-gray-500">ABHA + Password</span>
                </div>
              </button>

              {/* Verify via Mobile OTP */}
              <button
                onClick={() => setCurrentStep('verify-mobile-otp')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'verify-mobile-otp'
                    ? 'bg-orange-100 text-orange-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span>Mobile OTP</span>
                  <span className="text-[9px] text-gray-500">Mobile + ABDM OTP</span>
                </div>
              </button>
            </div>

            {/* Search & Authentication Section */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2 px-1">Search & Auth</p>

              {/* Search ABHA - All Methods */}
              <button
                onClick={() => setCurrentStep('search-abha')}
                className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                  currentStep === 'search-abha'
                    ? 'bg-orange-100 text-orange-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span>Search ABHA Profile</span>
                  <span className="text-[9px] text-gray-500">Mobile/ABHA Number/Address</span>
                </div>
              </button>
            </div>

            {/* Profile Actions Section */}
            {xToken && (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2 px-1">Profile Actions</p>

                {/* Download ABHA Card */}
                <button
                  onClick={() => setCurrentStep('download-card')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'download-card'
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ABHA Card</span>
                </button>

                {/* Get Profile */}
                <button
                  onClick={() => setCurrentStep('get-profile')}
                  className={`w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 transition-colors ${
                    currentStep === 'get-profile'
                      ? 'bg-teal-100 text-teal-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Get Profile Details</span>
                </button>
              </div>
            )}

            {/* Profile Summary Card */}
            {profile && (
              <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-green-200 rounded-md p-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-green-600" />
                  <h3 className="text-[10px] font-semibold text-gray-900">ABHA Created</h3>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div>
                    <p className="text-gray-600">Number</p>
                    <p className="font-mono font-medium text-gray-900">{profile.ABHANumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CENTER COLUMN - Main Workflow Area (6/12) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">

              {/* Configuration Form */}
              {currentStep === 'configure' && (
                <div className="space-y-3">

            {configSaved && (
              <div className="p-2 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-900">Configuration Saved</p>
                  <p className="text-xs text-green-700">Ready to use</p>
                </div>
              </div>
            )}

            {configError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-900">Error</p>
                  <p className="text-xs text-red-700">{configError}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Configuration Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="abdm-default"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Client ID *
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="SBXID_010974"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Client Secret *
                </label>
                <input
                  type="password"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="819c50ef-6ad7-4680-ae86-d4d3acda2e85"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  X-CM-ID
                </label>
                <input
                  type="text"
                  value={config.xCmId}
                  onChange={(e) => setConfig({ ...config, xCmId: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="sbx"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Environment
                </label>
                <select
                  value={config.environment}
                  onChange={(e) => setConfig({ ...config, environment: e.target.value as 'sandbox' | 'production' })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleSaveConfig}
                disabled={configSaving || !config.clientId || !config.clientSecret}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {configSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>

              {configSaved && (
                <>
                  <button
                    onClick={handleTestConnection}
                    className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <TestTube className="w-3 h-3" />
                    Test
                  </button>

                  <button
                    onClick={() => setCurrentStep('send-otp')}
                    className="ml-auto px-3 py-1 text-xs bg-green-600 text-white rounded font-medium hover:bg-green-700 flex items-center gap-1.5"
                  >
                    Start Flow
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
                </div>
              )}

              {/* Send OTP Form */}
              {currentStep === 'send-otp' && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Send OTP to Aadhaar</h2>
                    <p className="text-xs text-gray-600">
                      Enter Aadhaar to receive OTP on registered mobile
                    </p>
                  </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Aadhaar Number *
              </label>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                maxLength={12}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="946495363918"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendOTP}
                disabled={otpSending || aadhaar.length !== 12}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {otpSending && <Loader2 className="w-3 h-3 animate-spin" />}
                Send OTP
              </button>
            </div>
          </div>
        )}

        {/* Verify OTP Step */}
        {currentStep === 'verify-otp' && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Enter OTP from Aadhaar registered mobile
            </p>

            {otpMessage && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-700">{otpMessage}</p>
                {txnId && (
                  <p className="text-xs font-mono text-blue-600 mt-1">TxnID: {txnId.slice(0, 16)}...</p>
                )}
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono tracking-wider text-center"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyOTP}
                disabled={otpVerifying || otp.length !== 6 || mobile.length !== 10}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {otpVerifying && <Loader2 className="w-3 h-3 animate-spin" />}
                Verify & Create
              </button>
            </div>
                </div>
              )}

              {/* Complete Step - Full Profile Card */}
              {currentStep === 'complete' && profile && (
                <div className="space-y-3">
                  {/* Success Banner */}
                  <div className="p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-900">
                      ABHA Account Active
                    </p>
                  </div>

                  {/* Comprehensive Profile Card */}
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        {(profile as any).photo ? (
                          <img
                            src={`data:image/jpeg;base64,${(profile as any).photo}`}
                            alt="Profile"
                            className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="mt-2 px-2 py-0.5 bg-green-100 border border-green-300 rounded-full text-center">
                          <span className="text-[9px] font-semibold text-green-700 uppercase">Active</span>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="flex-1 min-w-0">
                        {/* Name and ABHA Number */}
                        <div className="mb-3">
                          <h3 className="text-base font-bold text-gray-900 mb-0.5">
                            {profile.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-600">ABHA Number:</span>
                            <span className="text-xs font-mono font-semibold text-purple-700">
                              {profile.ABHANumber}
                            </span>
                          </div>
                        </div>

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          {/* Gender & DOB */}
                          <div>
                            <p className="text-[10px] text-gray-600 mb-0.5">Gender</p>
                            <p className="font-medium text-gray-900">{profile.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600 mb-0.5">Date of Birth</p>
                            <p className="font-medium text-gray-900">{profile.dateOfBirth}</p>
                          </div>

                          {/* Mobile & Email */}
                          <div>
                            <p className="text-[10px] text-gray-600 mb-0.5">Mobile</p>
                            <p className="font-mono font-medium text-gray-900">{profile.mobile}</p>
                          </div>
                          {profile.email && (
                            <div>
                              <p className="text-[10px] text-gray-600 mb-0.5">Email</p>
                              <p className="font-medium text-gray-900 truncate">{profile.email}</p>
                            </div>
                          )}

                          {/* ABHA Address */}
                          {(profile.preferredAbhaAddress || (profile as any).phrAddress?.[0]) && (
                            <div className="col-span-2">
                              <p className="text-[10px] text-gray-600 mb-0.5">ABHA Address</p>
                              <p className="font-mono font-medium text-blue-700">
                                {profile.preferredAbhaAddress || (profile as any).phrAddress?.[0]}
                              </p>
                            </div>
                          )}

                          {/* State & District */}
                          {(profile as any).stateName && (
                            <div>
                              <p className="text-[10px] text-gray-600 mb-0.5">State</p>
                              <p className="font-medium text-gray-900">{(profile as any).stateName}</p>
                            </div>
                          )}
                          {(profile as any).districtName && (
                            <div>
                              <p className="text-[10px] text-gray-600 mb-0.5">District</p>
                              <p className="font-medium text-gray-900">{(profile as any).districtName}</p>
                            </div>
                          )}

                          {/* Pin Code */}
                          {(profile as any).pinCode && (
                            <div>
                              <p className="text-[10px] text-gray-600 mb-0.5">Pin Code</p>
                              <p className="font-mono font-medium text-gray-900">{(profile as any).pinCode}</p>
                            </div>
                          )}

                          {/* Address */}
                          {(profile as any).address && (
                            <div className="col-span-2">
                              <p className="text-[10px] text-gray-600 mb-0.5">Address</p>
                              <p className="text-xs font-medium text-gray-900">{(profile as any).address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCurrentStep('manage-addresses')}
                      className="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5"
                    >
                      <Home className="w-3.5 h-3.5" />
                      Manage Addresses
                    </button>
                    {xToken && (
                      <button
                        onClick={async () => {
                          try {
                            const result = await ABDM.downloadAbhaCard(xToken, undefined, { session });
                            const contentType = result.contentType || 'application/pdf';
                            const format = (result as any).format || 'pdf';
                            const extension = format === 'png' ? 'png' : 'pdf';

                            const byteCharacters = atob(result.card);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: contentType });

                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `ABHA-Card.${extension}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);

                            setLatestResponse({ success: true, format, contentType, cardSize: blob.size });
                            setLatestResponseTitle('Download ABHA Card Success');
                          } catch (err: any) {
                            setLatestResponse({ error: err.message });
                            setLatestResponseTitle('Download ABHA Card Error');
                          }
                        }}
                        className="px-3 py-2 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Card
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* View Profile Step */}
              {currentStep === 'view-profile' && profile && xToken && (
                <ProfileViewer
                  xToken={xToken}
                  session={session}
                  existingProfile={profile}
                  onResponse={(title, data) => {
                    setLatestResponse(data);
                    setLatestResponseTitle(title);
                  }}
                />
              )}

              {/* Manage ABHA Addresses Step */}
              {currentStep === 'manage-addresses' && profile && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Manage ABHA Addresses</h2>
                    <p className="text-xs text-gray-600">
                      View and add ABHA addresses to your account
                    </p>
                  </div>
                  <ManageAbhaAddresses
                    profile={profile}
                    xToken={xToken}
                    tToken={tToken}
                    session={session}
                    config={config}
                    onAddressAdded={(newAddress) => {
                      if (profile && (profile as any).phrAddress) {
                        setProfile({
                          ...profile,
                          phrAddress: [...((profile as any).phrAddress || []), newAddress]
                        } as any);
                      }
                      setLatestResponse({ success: true, address: newAddress });
                      setLatestResponseTitle('Address Added Successfully');
                    }}
                  />
                </div>
              )}

              {/* Mobile Update Step */}
              {currentStep === 'mobile-update' && profile && txnId && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Update Mobile Number</h2>
                    <p className="text-xs text-gray-600">
                      Update the mobile number associated with your ABHA account
                    </p>
                  </div>
                  <MobileUpdateFlow enrollmentTxnId={txnId} session={session} />
                </div>
              )}

              {/* Email Verification Step */}
              {currentStep === 'email-verification' && profile && xToken && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Verify Email Address</h2>
                    <p className="text-xs text-gray-600">
                      Send a verification link to your email
                    </p>
                  </div>
                  <EmailVerificationFlow xToken={xToken} session={session} />
                </div>
              )}

              {/* Login with ABHA Address Step */}
              {currentStep === 'login-with-address' && profile && !xToken && (profile as any).phrAddress?.[0] && (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Login with ABHA Address</h2>
                    <p className="text-xs text-gray-600">
                      Authenticate using your ABHA address to access additional operations
                    </p>
                  </div>
                  <ABHALoginFlow
                    abhaAddress={(profile as any).phrAddress[0]}
                    session={session}
                    onLoginSuccess={(authToken) => {
                      setXToken(authToken);
                      setCurrentStep('complete');
                    }}
                    onLoginOtpResponse={(data) => {
                      setLatestResponse(data);
                      setLatestResponseTitle('Login OTP Sent');
                    }}
                    onVerifyLoginOtpResponse={(data) => {
                      setLatestResponse(data);
                      setLatestResponseTitle('Login Successful');
                    }}
                    onResponse={(title, data) => {
                      setLatestResponse(data);
                      setLatestResponseTitle(title);
                    }}
                  />
                </div>
              )}

              {/* ABHA Verification Flows */}
              {(currentStep === 'verify-aadhaar-otp' || currentStep === 'verify-abha-aadhaar-otp' || currentStep === 'verify-abha-otp' || currentStep === 'verify-password' || currentStep === 'verify-mobile-otp') && (
                <ABHAVerificationFlow
                  method={currentStep}
                  session={session}
                  onResponse={(title, data) => {
                    setLatestResponse(data);
                    setLatestResponseTitle(title);
                  }}
                />
              )}

              {/* Download ABHA Card */}
              {currentStep === 'download-card' && xToken && (
                <div className="space-y-3">
                  <div className="border-b border-gray-200 pb-2">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-600" />
                      Download ABHA Card
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Download your ABHA card in PDF or PNG format
                    </p>
                  </div>
                  <ABHACardDownloader
                    xToken={xToken}
                    session={session}
                    onResponse={(title, data) => {
                      setLatestResponse(data);
                      setLatestResponseTitle(title);
                    }}
                  />
                </div>
              )}

              {/* Get Profile Details */}
              {currentStep === 'get-profile' && xToken && (
                <div className="space-y-3">
                  <div className="border-b border-gray-200 pb-2">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      Get Profile Details
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Fetch complete ABHA profile information
                    </p>
                  </div>
                  <ProfileDetailsViewer
                    xToken={xToken}
                    session={session}
                    onResponse={(title, data) => {
                      setLatestResponse(data);
                      setLatestResponseTitle(title);
                    }}
                  />
                </div>
              )}

              {/* Search ABHA by Mobile */}
              {currentStep === 'search-abha' && (
                <SearchABHAByMobile
                  session={session}
                  onResponse={(title, data) => {
                    setLatestResponse(data);
                    setLatestResponseTitle(title);
                  }}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Results Panel (4/12) */}
          <div className="lg:col-span-4">
            <div className="sticky top-4">
              <div className="bg-white rounded-md shadow-sm border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-semibold text-gray-900">API Response</h2>
                  </div>
                  <p className="text-xs text-gray-600">
                    Latest response
                  </p>
                </div>

                <div className="p-3">
                  {latestResponse ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-900">{latestResponseTitle}</h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(latestResponse, null, 2));
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>

                      <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-[10px] leading-relaxed overflow-auto max-h-[calc(100vh-250px)] font-mono">
                        {JSON.stringify(latestResponse, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">
                        Click any action to see response
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

