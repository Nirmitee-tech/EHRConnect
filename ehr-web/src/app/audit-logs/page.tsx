'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ScrollText, Filter, Download, Search, 
  Calendar, User, Activity, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditEvent {
  id: string;
  action: string;
  actor_user_id: string;
  actor_name: string;
  target_type: string;
  target_name: string;
  status: string;
  created_at: string;
  ip_address: string;
  metadata: any;
}

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    // For now, show empty state
    // Will connect to API once endpoint is ready
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'text-green-600 bg-green-50';
    if (action.includes('UPDATED')) return 'text-blue-600 bg-blue-50';
    if (action.includes('DELETED') || action.includes('REVOKED')) return 'text-red-600 bg-red-50';
    if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED')) return '✓';
    if (action.includes('UPDATED')) return '✎';
    if (action.includes('DELETED')) return '✕';
    if (action.includes('LOGIN')) return '→';
    return '•';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ScrollText className="h-8 w-8 text-indigo-600" />
              Audit Logs
            </h1>
            <p className="text-gray-600 mt-1">
              Complete audit trail of all system actions for compliance
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            className="px-3 py-2 border rounded-md"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="ORG">Organization</option>
            <option value="USER">User</option>
            <option value="ROLE">Role</option>
            <option value="AUTH">Authentication</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>

          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : auditEvents.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No audit logs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Audit events will appear here as actions are performed
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
              <div className="bg-green-50 rounded-lg p-4">
                <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-700">
                  <strong>Organization Actions</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">Org creation, updates</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <User className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-700">
                  <strong>User Actions</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">Invites, role changes</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <AlertCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-700">
                  <strong>Security Events</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">Login attempts, violations</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(event.action)}`}>
                        {getActionIcon(event.action)} {event.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {event.actor_name || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{event.target_name}</div>
                        <div className="text-xs text-gray-500">{event.target_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">HIPAA Compliance</h4>
            <p className="text-sm text-blue-800">
              All audit logs are retained for 7 years by default for HIPAA compliance. 
              Sensitive information is automatically redacted from log entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
