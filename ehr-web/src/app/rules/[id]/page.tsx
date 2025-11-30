'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ruleService, Rule, RuleExecution } from '@/services/rule.service';
import {
  ArrowLeft,
  Edit,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

export default function RuleDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const ruleId = params.id as string;

  const [rule, setRule] = useState<Rule | null>(null);
  const [executions, setExecutions] = useState<RuleExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [executionsLoading, setExecutionsLoading] = useState(true);

  useEffect(() => {
    if (ruleId) {
      loadRule();
      loadExecutions();
    }
  }, [ruleId, session]);

  const loadRule = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const response = await ruleService.getRule(session, ruleId);
      setRule(response.data);
    } catch (err: any) {
      error(err.message || 'Failed to load rule');
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    if (!session) return;

    try {
      setExecutionsLoading(true);
      const response = await ruleService.getRuleExecutions(session, ruleId, 50, 0);
      setExecutions(response.data);
    } catch (err: any) {
      error(err.message || 'Failed to load executions');
    } finally {
      setExecutionsLoading(false);
    }
  };

  const handleToggleRule = async () => {
    if (!session || !rule) return;

    try {
      await ruleService.updateRule(session, rule.id, {
        is_active: !rule.is_active,
      });

      success(`Rule ${!rule.is_active ? 'activated' : 'deactivated'} successfully`);

      loadRule();
    } catch (err: any) {
      error(err.message || 'Failed to update rule');
    }
  };

  const handleDeleteRule = async () => {
    if (!session || !rule) return;
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await ruleService.deleteRule(session, rule.id);

      success('Rule deleted successfully');

      router.push('/rules');
    } catch (err: any) {
      error(err.message || 'Failed to delete rule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rule...</p>
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rule not found</h3>
          <Button onClick={() => router.push('/rules')}>Back to Rules</Button>
        </div>
      </div>
    );
  }

  const successRate =
    rule.execution_count > 0
      ? ((rule.success_count / rule.execution_count) * 100).toFixed(1)
      : '0';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{rule.name}</h1>
              <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                {rule.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span>Type: {rule.rule_type}</span>
              <span>•</span>
              <span>Trigger: {rule.trigger_event}</span>
              <span>•</span>
              <span>Priority: {rule.priority}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleRule}>
            {rule.is_active ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/rules/${rule.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteRule} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{rule.execution_count}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{rule.success_count}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{rule.failure_count}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>View execution history and debug information</CardDescription>
            </CardHeader>
            <CardContent>
              {executionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : executions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No executions yet</h3>
                  <p className="text-gray-600">This rule hasn't been executed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="border-l-4" style={{
                      borderLeftColor: execution.conditions_met
                        ? execution.actions_success
                          ? '#10b981'
                          : '#ef4444'
                        : '#9ca3af',
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {execution.conditions_met ? (
                                execution.actions_success ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-400" />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {execution.trigger_event}
                                  </span>
                                  {execution.conditions_met ? (
                                    <Badge variant="default" className="text-xs">
                                      Conditions Met
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">
                                      Conditions Not Met
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                  <span>
                                    {formatDistanceToNow(new Date(execution.executed_at), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                  {execution.patient_id && (
                                    <>
                                      <span>•</span>
                                      <span>Patient: {execution.patient_id}</span>
                                    </>
                                  )}
                                  {execution.triggered_by_name && (
                                    <>
                                      <span>•</span>
                                      <span>By: {execution.triggered_by_name}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span>{execution.execution_time_ms}ms</span>
                                </div>
                              </div>
                            </div>

                            {execution.computed_variables &&
                              Object.keys(execution.computed_variables).length > 0 && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">
                                    Computed Variables:
                                  </p>
                                  <div className="space-y-1">
                                    {Object.entries(execution.computed_variables).map(
                                      ([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 text-xs">
                                          <code className="text-gray-600">{key}:</code>
                                          <code className="text-gray-900 font-mono">
                                            {JSON.stringify(value)}
                                          </code>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {execution.error_message && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                <p className="text-xs font-semibold text-red-700 mb-1">Error:</p>
                                <p className="text-xs text-red-600">{execution.error_message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(rule.conditions, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(rule.actions, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {rule.used_variables && rule.used_variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Used Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {rule.used_variables.map((varKey) => (
                    <Badge key={varKey} variant="outline">
                      {'{{var.' + varKey + '}}'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
