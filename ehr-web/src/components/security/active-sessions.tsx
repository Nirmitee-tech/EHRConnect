'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface DeviceInfo {
  type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  os: string;
  browser: string;
  name: string;
}

interface Session {
  id: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  isCurrent: boolean;
}

interface ActiveSessionsProps {
  userId?: string;
}

export default function ActiveSessions({ userId }: ActiveSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeAll, setRevokeAll] = useState(false);

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Revoke a specific session
  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? This device will be logged out immediately.')) {
      return;
    }

    try {
      setRevokingId(sessionId);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to revoke session');
      console.error('Error revoking session:', err);
    } finally {
      setRevokingId(null);
    }
  };

  // Revoke all sessions except current
  const handleRevokeAllSessions = async () => {
    if (!confirm('Are you sure you want to sign out of all other devices? This will log out all sessions except your current one.')) {
      return;
    }

    try {
      setRevokeAll(true);
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke sessions');
      }

      const result = await response.json();
      alert(`Successfully signed out of ${result.revokedCount} device(s)`);

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to revoke sessions');
      console.error('Error revoking all sessions:', err);
    } finally {
      setRevokeAll(false);
    }
  };

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'Tablet':
        return <Tablet className="h-5 w-5" />;
      case 'Desktop':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  // Get device color
  const getDeviceColor = (type: string) => {
    switch (type) {
      case 'Mobile':
        return 'bg-blue-100 text-blue-700';
      case 'Tablet':
        return 'bg-purple-100 text-purple-700';
      case 'Desktop':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error loading sessions</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchSessions}
            className="text-sm text-red-600 hover:text-red-800 font-medium mt-2 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.isActive);
  const currentSession = activeSessions.find(s => s.isCurrent);
  const otherSessions = activeSessions.filter(s => !s.isCurrent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
          </div>
          <p className="text-gray-600">
            Manage your active sessions and sign out from devices you don't recognize
          </p>
        </div>
        {otherSessions.length > 0 && (
          <button
            onClick={handleRevokeAllSessions}
            disabled={revokeAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {revokeAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Sign out of all other devices
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-700 mb-1">Total Active Sessions</div>
          <div className="text-3xl font-bold text-blue-900">{activeSessions.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-700 mb-1">Current Session</div>
          <div className="text-3xl font-bold text-green-900">1</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-700 mb-1">Other Devices</div>
          <div className="text-3xl font-bold text-orange-900">{otherSessions.length}</div>
        </div>
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${getDeviceColor(currentSession.deviceInfo.type)}`}>
                {getDeviceIcon(currentSession.deviceInfo.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {currentSession.deviceInfo.name || 'Unknown Device'}
                  </h3>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                    Current Session
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {currentSession.deviceInfo.browser} on {currentSession.deviceInfo.os}
                </p>
              </div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{currentSession.ipAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Active {formatDistanceToNow(new Date(currentSession.lastActivityAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Globe className="h-4 w-4 text-gray-500" />
              <span>Expires {format(new Date(currentSession.expiresAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Other Sessions</h3>
          {otherSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 rounded-lg ${getDeviceColor(session.deviceInfo.type)}`}>
                    {getDeviceIcon(session.deviceInfo.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {session.deviceInfo.name || 'Unknown Device'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {session.deviceInfo.browser} on {session.deviceInfo.os}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Last active {formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingId === session.id}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {revokingId === session.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Sign out
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">No other active sessions</h3>
          <p className="text-sm text-gray-600">
            You're only signed in on this device
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Security Tip</p>
          <p>
            If you see a session you don't recognize, sign out of that device immediately and change your password.
            Sessions automatically expire after 7 days of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}
