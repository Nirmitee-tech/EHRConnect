'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ruleService, Rule } from '@/services/rule.service';
import {
  Zap,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  AlertTriangle,
  CheckSquare,
  Lightbulb,
  Pill,
  Bell,
  Mail,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';

const RULE_TYPE_ICONS: Record<string, any> = {
  task_assignment: CheckSquare,
  alert: AlertTriangle,
  cds_hook: Lightbulb,
  medication_assignment: Pill,
  reminder: Bell,
  notification: Mail,
  workflow_automation: GitBranch,
};

const RULE_TYPE_COLORS: Record<string, string> = {
  task_assignment: 'bg-blue-100 text-blue-700 border-blue-200',
  alert: 'bg-red-100 text-red-700 border-red-200',
  cds_hook: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  medication_assignment: 'bg-purple-100 text-purple-700 border-purple-200',
  reminder: 'bg-green-100 text-green-700 border-green-200',
  notification: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  workflow_automation: 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function RulesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();

  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRuleType, setSelectedRuleType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadRules();
  }, [session]);

  useEffect(() => {
    filterRules();
  }, [rules, searchQuery, selectedRuleType, selectedStatus]);

  const loadRules = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const response = await ruleService.getRules(session);
      setRules(response.data);
    } catch (err: any) {
      error(err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const filterRules = () => {
    let filtered = [...rules];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (rule) =>
          rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rule type filter
    if (selectedRuleType !== 'all') {
      filtered = filtered.filter((rule) => rule.rule_type === selectedRuleType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((rule) =>
        selectedStatus === 'active' ? rule.is_active : !rule.is_active
      );
    }

    setFilteredRules(filtered);
  };

  const handleToggleRule = async (rule: Rule) => {
    if (!session) return;

    try {
      await ruleService.updateRule(session, rule.id, {
        is_active: !rule.is_active,
      });

      success(`Rule ${!rule.is_active ? 'activated' : 'deactivated'} successfully`);

      loadRules();
    } catch (err: any) {
      error(err.message || 'Failed to update rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await ruleService.deleteRule(session, ruleId);

      success('Rule deleted successfully');

      loadRules();
    } catch (err: any) {
      error(err.message || 'Failed to delete rule');
    }
  };

  const getRuleTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const RuleIcon = ({ type }: { type: string }) => {
    const Icon = RULE_TYPE_ICONS[type] || Zap;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rule Engine</h1>
          <p className="text-sm text-gray-600 mt-1">
            Automate tasks, alerts, and clinical decision support
          </p>
        </div>
        <Button onClick={() => router.push('/rules/new')} className="bg-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {rules.filter((r) => r.is_active).length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">
                  {rules.filter((r) => !r.is_active).length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rules.reduce((sum, r) => sum + r.execution_count, 0)}
                </p>
              </div>
              <GitBranch className="h-8 w-8 text-primary/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRuleType} onValueChange={setSelectedRuleType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Rule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task_assignment">Task Assignment</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="cds_hook">CDS Hook</SelectItem>
                <SelectItem value="medication_assignment">Medication Assignment</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="workflow_automation">Workflow Automation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rules found</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first automation rule
              </p>
              <Button onClick={() => router.push('/rules/new')} className="bg-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg border ${RULE_TYPE_COLORS[rule.rule_type]}`}>
                        <RuleIcon type={rule.rule_type} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">{rule.name}</h3>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'} className="text-xs">
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Priority: {rule.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">{getRuleTypeLabel(rule.rule_type)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">Trigger: {rule.trigger_event}</span>
                          {rule.execution_count > 0 && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600">
                                Executed {rule.execution_count} times
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-14">{rule.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRule(rule)}
                      className="h-8"
                    >
                      {rule.is_active ? (
                        <>
                          <Pause className="h-3.5 w-3.5 mr-1.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 mr-1.5" />
                          Activate
                        </>
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/rules/${rule.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/rules/${rule.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Rule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
