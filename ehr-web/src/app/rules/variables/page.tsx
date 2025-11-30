'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ruleVariableService, RuleVariable } from '@/services/rule.service';
import {
  Variable,
  Plus,
  Search,
  Trash2,
  Edit,
  Play,
  Database,
  Calculator,
  Table,
  Clock
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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

const COMPUTATION_TYPE_ICONS: Record<string, any> = {
  aggregate: Database,
  formula: Calculator,
  lookup: Table,
  time_based: Clock,
  custom: Variable,
};

const COMPUTATION_TYPE_COLORS: Record<string, string> = {
  aggregate: 'bg-blue-100 text-blue-700 border-blue-200',
  formula: 'bg-purple-100 text-purple-700 border-purple-200',
  lookup: 'bg-green-100 text-green-700 border-green-200',
  time_based: 'bg-orange-100 text-orange-700 border-orange-200',
  custom: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function RuleVariablesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error, info } = useToast();

  const [variables, setVariables] = useState<RuleVariable[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<RuleVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComputationType, setSelectedComputationType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadVariables();
  }, [session]);

  useEffect(() => {
    filterVariables();
  }, [variables, searchQuery, selectedComputationType, selectedCategory]);

  const loadVariables = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const response = await ruleVariableService.getVariables(session);
      setVariables(response.data);
    } catch (err: any) {
      error(err.message || 'Failed to load variables');
    } finally {
      setLoading(false);
    }
  };

  const filterVariables = () => {
    let filtered = [...variables];

    if (searchQuery) {
      filtered = filtered.filter(
        (variable) =>
          variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variable.variable_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variable.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedComputationType !== 'all') {
      filtered = filtered.filter((v) => v.computation_type === selectedComputationType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }

    setFilteredVariables(filtered);
  };

  const handleDeleteVariable = async (variableId: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to delete this variable? Rules using this variable may stop working.')) return;

    try {
      await ruleVariableService.deleteVariable(session, variableId);

      success('Variable deleted successfully');

      loadVariables();
    } catch (err: any) {
      error(err.message || 'Failed to delete variable');
    }
  };

  const handleTestVariable = async (variableId: string) => {
    if (!session) return;

    try {
      const result = await ruleVariableService.testVariable(session, variableId);

      info(`Value: ${result.data.value} (${result.data.execution_time_ms}ms)`);
    } catch (err: any) {
      error(err.message || 'Failed to test variable');
    }
  };

  const getComputationTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const ComputationIcon = ({ type }: { type: string }) => {
    const Icon = COMPUTATION_TYPE_ICONS[type] || Variable;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading variables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rule Variables</h1>
          <p className="text-sm text-gray-600 mt-1">
            Define computed variables for use in rules
          </p>
        </div>
        <Button onClick={() => router.push('/rules/variables/new')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Variable
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Variables</p>
                <p className="text-2xl font-bold text-gray-900">{variables.length}</p>
              </div>
              <Variable className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aggregates</p>
                <p className="text-2xl font-bold text-blue-600">
                  {variables.filter((v) => v.computation_type === 'aggregate').length}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Formulas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {variables.filter((v) => v.computation_type === 'formula').length}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lookups</p>
                <p className="text-2xl font-bold text-green-600">
                  {variables.filter((v) => v.computation_type === 'lookup').length}
                </p>
              </div>
              <Table className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time-Based</p>
                <p className="text-2xl font-bold text-orange-600">
                  {variables.filter((v) => v.computation_type === 'time_based').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
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
                  placeholder="Search variables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedComputationType} onValueChange={setSelectedComputationType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Computation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="aggregate">Aggregate</SelectItem>
                <SelectItem value="formula">Formula</SelectItem>
                <SelectItem value="lookup">Lookup</SelectItem>
                <SelectItem value="time_based">Time-Based</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
                <SelectItem value="vital">Vital</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Variables List */}
      <div className="space-y-3">
        {filteredVariables.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Variable className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No variables found</h3>
              <p className="text-gray-600 mb-4">
                Create variables to compute aggregates and formulas for your rules
              </p>
              <Button onClick={() => router.push('/rules/variables/new')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Variable
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredVariables.map((variable) => (
            <Card key={variable.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg border ${COMPUTATION_TYPE_COLORS[variable.computation_type]}`}>
                        <ComputationIcon type={variable.computation_type} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">{variable.name}</h3>
                          <Badge variant={variable.is_active ? 'default' : 'secondary'} className="text-xs">
                            {variable.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {variable.category && (
                            <Badge variant="outline" className="text-xs">
                              {variable.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            {'{{'}var.{variable.variable_key}{'}}'}
                          </code>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            {getComputationTypeLabel(variable.computation_type)}
                          </span>
                          {variable.aggregate_function && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600">
                                {variable.aggregate_function.toUpperCase()}
                              </span>
                            </>
                          )}
                          {variable.time_window_hours && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600">
                                {variable.time_window_hours}h window
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {variable.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-14">{variable.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestVariable(variable.id)}
                      className="h-8"
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/rules/variables/${variable.id}/edit`)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVariable(variable.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
