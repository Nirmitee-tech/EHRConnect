'use client';

import { Calendar, Clock, User, Activity, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Operation {
  id: string;
  dateTime: Date | string;
  patientName: string;
  patientMrn?: string;
  procedureName: string;
  procedureCode?: string;
  surgeon: string;
  department: string;
  operatingRoom?: string;
  estimatedDuration?: number;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requiresIcu?: boolean;
  requiresBed?: boolean;
  assignedWard?: string;
  assignedBed?: string;
  notes?: string;
}

interface OperationsPanelProps {
  operations: Operation[];
  onOperationClick?: (operation: Operation) => void;
  title?: string;
  showDate?: boolean;
}

export function OperationsPanel({
  operations,
  onOperationClick,
  title = 'Operations',
  showDate = true,
}: OperationsPanelProps) {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      emergency: 'destructive',
      urgent: 'default',
      routine: 'secondary',
    };
    return colors[priority] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
      in_progress: 'bg-green-100 text-green-700 border-green-300',
      completed: 'bg-gray-100 text-gray-700 border-gray-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || 'bg-gray-100';
  };

  const formatTime = (dateTime: Date | string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateTime: Date | string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const groupedOperations = operations.reduce((acc, op) => {
    const date = new Date(op.dateTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(op);
    return acc;
  }, {} as Record<string, Operation[]>);

  // Sort operations by date/time
  const sortedDates = Object.keys(groupedOperations).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
          <Badge variant="outline" className="ml-auto">
            {operations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="px-4 pb-4 space-y-4">
            {operations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No scheduled operations</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="space-y-2">
                  {showDate && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mt-4 first:mt-0">
                      <Calendar className="h-4 w-4" />
                      {formatDate(date)}
                    </div>
                  )}

                  {groupedOperations[date]
                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                    .map((operation) => (
                      <div
                        key={operation.id}
                        className={`
                          p-3 rounded-lg border-2 transition-all cursor-pointer
                          ${getStatusColor(operation.status)}
                          hover:shadow-md
                        `}
                        onClick={() => onOperationClick?.(operation)}
                      >
                        {/* Time and Priority */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-bold">{formatTime(operation.dateTime)}</span>
                            {operation.estimatedDuration && (
                              <span className="text-xs text-muted-foreground">
                                ({operation.estimatedDuration} min)
                              </span>
                            )}
                          </div>
                          <Badge variant={getPriorityColor(operation.priority) as any} className="text-xs">
                            {operation.priority}
                          </Badge>
                        </div>

                        {/* Patient Info */}
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-sm">{operation.patientName}</span>
                            {operation.patientMrn && (
                              <Badge variant="outline" className="text-xs">
                                {operation.patientMrn}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Procedure */}
                        <div className="text-sm font-medium mb-1">
                          {operation.procedureName}
                        </div>

                        {/* Surgeon and Department */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Dr. {operation.surgeon}</div>
                          <div className="flex items-center gap-3">
                            <span>{operation.department}</span>
                            {operation.operatingRoom && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {operation.operatingRoom}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bed Assignment */}
                        {operation.requiresBed && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs">
                              {operation.assignedBed ? (
                                <>
                                  <Badge variant="secondary" className="text-xs">
                                    Bed: {operation.assignedBed}
                                  </Badge>
                                  {operation.assignedWard && (
                                    <span className="text-muted-foreground">{operation.assignedWard}</span>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Bed required</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ICU Requirement */}
                        {operation.requiresIcu && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs bg-red-50">
                              ICU Required
                            </Badge>
                          </div>
                        )}

                        {/* Notes */}
                        {operation.notes && (
                          <div className="mt-2 text-xs text-muted-foreground italic">
                            {operation.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
