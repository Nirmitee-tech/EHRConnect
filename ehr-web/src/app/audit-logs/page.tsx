'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ScrollText,
  Filter,
  Download,
  Search,
  Calendar,
  Settings2,
  ShieldAlert,
  Activity,
  AlertCircle,
  Layers,
  MousePointerClick
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AuditService, AuditEventFilters } from '@/services/audit.service';
import { AuditChange, AuditEvent, AuditSettingsMap } from '@/types/audit';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CATEGORY_COPY: Record<string, { label: string; description: string; icon: React.ReactNode; accent: string }> = {
  http_requests: {
    label: 'API & UI Activity',
    description: 'Every request sent to the platform, including method, path, response and originating IP.',
    icon: <MousePointerClick className="h-5 w-5 text-indigo-600" />,
    accent: 'bg-indigo-50 border-indigo-100'
  },
  data_changes: {
    label: 'Clinical & Master Data',
    description: 'Structured capture of before / after snapshots for sensitive record updates.',
    icon: <Layers className="h-5 w-5 text-emerald-600" />,
    accent: 'bg-emerald-50 border-emerald-100'
  },
  authentication: {
    label: 'Authentication',
    description: 'Sign-in, password resets, and session lifecycle events.',
    icon: <Activity className="h-5 w-5 text-blue-600" />,
    accent: 'bg-blue-50 border-blue-100'
  },
  administration: {
    label: 'Administration',
    description: 'Role assignments, configuration updates, and organization-level changes.',
    icon: <Settings2 className="h-5 w-5 text-amber-600" />,
    accent: 'bg-amber-50 border-amber-100'
  },
  security: {
    label: 'Security Alerts',
    description: 'Isolation violations, blocked requests, and notable security findings.',
    icon: <ShieldAlert className="h-5 w-5 text-rose-600" />,
    accent: 'bg-rose-50 border-rose-100'
  }
};

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border border-green-200',
  failure: 'bg-rose-100 text-rose-700 border border-rose-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200'
};

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  category: 'all',
  action: 'all',
  from: '',
  to: ''
};

type FilterState = typeof DEFAULT_FILTERS;

type ContextResponse = {
  org_id: string;
  user_id: string;
};

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [settings, setSettings] = useState<AuditSettingsMap | null>(null);
  const [settingsSaving, setSettingsSaving] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<ContextResponse | null>(null);

  const sessionUserId =
    typeof session?.user === 'object' && session?.user && 'id' in session.user
      ? (session.user as { id?: string }).id
      : undefined;
  const orgId = session?.org_id || userContext?.org_id;
  const userId = sessionUserId || userContext?.user_id;

  useEffect(() => {
    if (!session?.org_id && session?.user?.email) {
      fetchUserContext(session.user.email);
    }
  }, [session?.org_id, session?.user?.email]);

  useEffect(() => {
    if (orgId && userId) {
      loadSettings(orgId, userId);
    }
  }, [orgId, userId]);

  useEffect(() => {
    if (orgId && userId) {
      loadEvents(orgId, userId, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, userId, filters.search, filters.status, filters.category, filters.action, filters.from, filters.to]);

  useEffect(() => {
    if (selectedEvent) {
      const exists = events.some(event => event.id === selectedEvent.id);
      if (!exists) {
        setSelectedEvent(null);
      }
    }
  }, [events, selectedEvent]);

  const fetchUserContext = async (email: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/auth/user-context?email=${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const context = (await response.json()) as ContextResponse;
        setUserContext(context);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch user context:', err);
    }
  };

  const loadEvents = async (org: string, user: string, currentFilters: FilterState) => {
    try {
      setLoading(true);
      setError(null);
      const query: AuditEventFilters = {};

      if (currentFilters.status !== 'all') {
        query.status = currentFilters.status;
      }
      if (currentFilters.category !== 'all') {
        query.category = currentFilters.category;
      }
      if (currentFilters.action !== 'all') {
        query.action = currentFilters.action;
      }
      if (currentFilters.search) {
        query.search = currentFilters.search;
      }
      if (currentFilters.from) {
        query.from = currentFilters.from;
      }
      if (currentFilters.to) {
        query.to = currentFilters.to;
      }

      const result = await AuditService.getEvents(org, user, query);
      setEvents(result.events || []);
      setTotalEvents(result.total || 0);
    } catch (err: unknown) {
      console.error('Failed to load audit events:', err);
      setError(err instanceof Error ? err.message : 'Unable to load audit events');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (org: string, user: string) => {
    try {
      const prefs = await AuditService.getSettings(org, user);
      setSettings(prefs);
    } catch (err: unknown) {
      console.error('Failed to load audit settings:', err);
    }
  };

  const handleExport = async () => {
    if (!orgId || !userId) return;

    try {
      const blob = await AuditService.exportEvents(orgId, userId, {
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        action: filters.action !== 'all' ? filters.action : undefined,
        search: filters.search || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-events-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Failed to export audit events:', err);
      setError('Unable to export audit logs at the moment.');
    }
  };

  const handleSettingToggle = async (key: string, enabled: boolean) => {
    if (!orgId || !userId || !settings) return;

    try {
      setSettingsSaving(key);
      const update = await AuditService.updateSettings(orgId, userId, {
        [key]: {
          ...settings[key],
          enabled
        }
      });
      setSettings(update);
    } catch (err: unknown) {
      console.error('Failed to update audit settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSettingsSaving(null);
    }
  };

  const categoryStats = useMemo(() => {
    return events.reduce<Record<string, number>>((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});
  }, [events]);

  const availableActions = useMemo(() => {
    const actions = new Set<string>();
    events.forEach(event => actions.add(event.action));
    return Array.from(actions).sort();
  }, [events]);

  const renderMetadataSummary = (event: AuditEvent) => {
    if (event.metadata?.summary) {
      return event.metadata.summary;
    }

    if (event.action === 'HTTP.REQUEST') {
      const method = event.metadata?.method;
      const path = event.metadata?.path;
      return method && path ? `${method} ${path}` : path || method || 'HTTP activity';
    }

    if (event.metadata?.changes?.length) {
      return `${event.metadata.changes.length} field${event.metadata.changes.length > 1 ? 's' : ''} changed`;
    }

    if (event.error_message) {
      return event.error_message;
    }

    return 'Audit event captured';
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <ScrollText className="h-10 w-10 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Unified Audit Trail</h1>
              <p className="text-gray-600">
                Full lifecycle visibility across authentication, data changes, and administrative actions.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={resetFilters} disabled={loading}>
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-indigo-100 bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-indigo-600">Total Events (30d)</CardTitle>
            <CardDescription className="text-3xl font-bold text-gray-900">{totalEvents.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Streaming in real time from every authenticated interaction across the platform.
            </p>
          </CardContent>
        </Card>

        {Object.entries(CATEGORY_COPY).map(([key, value]) => (
          <Card key={key} className={`shadow-sm border ${value.accent}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700">{value.label}</CardTitle>
                <CardDescription className="text-2xl font-bold text-gray-900">
                  {categoryStats[key]?.toLocaleString() || 0}
                </CardDescription>
              </div>
              {value.icon}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 leading-relaxed">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg text-gray-900">Filter audit history</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Search and filter granular events. All timestamps are recorded in your organization timezone.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search action, target or metadata"
                  value={filters.search}
                  onChange={(event) => setFilters(prev => ({ ...prev, search: event.target.value }))}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.from}
                  onChange={(event) => setFilters(prev => ({ ...prev, from: event.target.value }))}
                  className="w-36"
                />
                <span className="text-gray-400 text-sm">to</span>
                <Input
                  type="date"
                  value={filters.to}
                  onChange={(event) => setFilters(prev => ({ ...prev, to: event.target.value }))}
                  className="w-36"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <select
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
              value={filters.category}
              onChange={(event) => setFilters(prev => ({ ...prev, category: event.target.value }))}
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_COPY).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
              value={filters.status}
              onChange={(event) => setFilters(prev => ({ ...prev, status: event.target.value }))}
            >
              <option value="all">Any Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="pending">Pending</option>
            </select>

            <select
              className="px-3 py-2 border rounded-md text-sm text-gray-700"
              value={filters.action}
              onChange={(event) => setFilters(prev => ({ ...prev, action: event.target.value }))}
            >
              <option value="all">All Actions</option>
              {availableActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{events.length.toLocaleString()} events loaded</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="px-6 py-3 bg-rose-50 border-t border-b border-rose-100 text-sm text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                        Loading secure audit records...
                      </div>
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center gap-3 text-gray-500">
                        <ScrollText className="h-12 w-12 text-gray-300" />
                        <p className="text-base font-semibold text-gray-700">No audit events found</p>
                        <p className="text-sm text-gray-500">
                          Adjust filters or perform an action within the platform to generate fresh audit activity.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map(event => (
                    <tr
                      key={event.id}
                      className={`hover:bg-gray-50 transition cursor-pointer ${selectedEvent?.id === event.id ? 'bg-indigo-50/60' : ''}`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {event.action}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs font-medium capitalize">
                          {CATEGORY_COPY[event.category]?.label || event.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.actor_user_id || 'System'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{event.target_name || '—'}</div>
                        <div className="text-xs text-gray-500">{event.target_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[event.status] || ''}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <span className="line-clamp-2">{renderMetadataSummary(event)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.ip_address || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card className="border-indigo-100 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Event details
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Traceability evidence for compliance investigations.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <DetailItem label="Timestamp" value={new Date(selectedEvent.created_at).toLocaleString()} />
              <DetailItem label="Action" value={selectedEvent.action} />
              <DetailItem label="Category" value={CATEGORY_COPY[selectedEvent.category]?.label || selectedEvent.category} />
              <DetailItem label="Actor" value={selectedEvent.actor_user_id || 'System'} />
              <DetailItem label="Target" value={selectedEvent.target_name || '—'} />
              <DetailItem label="Target Type" value={selectedEvent.target_type} />
              <DetailItem label="IP Address" value={selectedEvent.ip_address || '—'} />
              <DetailItem label="Session" value={selectedEvent.session_id || '—'} />
            </div>

            {selectedEvent.metadata?.changes && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <h4 className="text-sm font-semibold text-emerald-700 mb-3">Captured field level changes</h4>
                <div className="space-y-2">
                  {selectedEvent.metadata.changes.map((change: AuditChange, index: number) => (
                    <div key={index} className="text-xs text-emerald-900 bg-white rounded-md border border-emerald-100 p-3">
                      <div className="font-semibold">{change.field}</div>
                      <div className="grid md:grid-cols-2 gap-2 mt-1">
                        <div>
                          <div className="uppercase text-[10px] text-emerald-500">Before</div>
                          <pre className="text-[11px] text-emerald-900 whitespace-pre-wrap break-all">{JSON.stringify(change.before, null, 2)}</pre>
                        </div>
                        <div>
                          <div className="uppercase text-[10px] text-emerald-500">After</div>
                          <pre className="text-[11px] text-emerald-900 whitespace-pre-wrap break-all">{JSON.stringify(change.after, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Raw metadata</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all max-h-64 overflow-auto bg-white border border-gray-100 rounded-md p-3">
                {JSON.stringify(selectedEvent.metadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gray-700" />
            Audit controls
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Toggle audit capture streams to align with your compliance posture. Changes are logged instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings ? (
            Object.entries(CATEGORY_COPY).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition"
              >
                <div className="flex items-start gap-3">
                  {value.icon}
                  <div>
                    <p className="font-semibold text-gray-900">{value.label}</p>
                    <p className="text-sm text-gray-500">{value.description}</p>
                    {settings[key]?.retention_days && (
                      <p className="text-xs text-gray-400 mt-1">
                        Retained for {settings[key].retention_days} days
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {settingsSaving === key && (
                    <div className="h-5 w-5 border-2 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                  )}
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <Checkbox
                      checked={settings[key]?.enabled !== false}
                      onCheckedChange={(checked) => handleSettingToggle(key, Boolean(checked))}
                      disabled={settingsSaving === key}
                    />
                    Capture events
                  </label>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              Loading audit settings...
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-semibold">Retention & privacy</p>
              <p>
                All audit data is retained according to HIPAA guidelines. Sensitive payloads are automatically redacted
                using the preferences above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-all">{value}</p>
    </div>
  );
}
