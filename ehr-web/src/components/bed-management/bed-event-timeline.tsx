'use client';

import { useState } from 'react';
import { Clock, UserPlus, UserMinus, ArrowRightLeft, AlertCircle, Activity, Bed as BedIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export type BedEventType =
  | 'admission'
  | 'discharge'
  | 'transfer_in'
  | 'transfer_out'
  | 'status_change'
  | 'maintenance'
  | 'cleaning'
  | 'reservation';

export interface BedEvent {
  id: string;
  timestamp: Date | string;
  eventType: BedEventType;
  bedId: string;
  bedNumber: string;
  wardName: string;
  roomNumber?: string;
  patientName?: string;
  patientMrn?: string;
  fromLocation?: string;
  toLocation?: string;
  fromStatus?: string;
  toStatus?: string;
  performedBy?: string;
  notes?: string;
  priority?: 'routine' | 'urgent' | 'emergency';
}

interface BedEventTimelineProps {
  events: BedEvent[];
  selectedBedId?: string;
  onEventClick?: (event: BedEvent) => void;
  showDate?: boolean;
}

export function BedEventTimeline({
  events,
  selectedBedId,
  onEventClick,
  showDate = true,
}: BedEventTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const getEventIcon = (eventType: BedEventType) => {
    const icons = {
      admission: UserPlus,
      discharge: UserMinus,
      transfer_in: ArrowRightLeft,
      transfer_out: ArrowRightLeft,
      status_change: Activity,
      maintenance: AlertCircle,
      cleaning: Activity,
      reservation: Clock,
    };
    return icons[eventType] || Activity;
  };

  const getEventColor = (eventType: BedEventType) => {
    const colors = {
      admission: 'bg-green-500 text-white',
      discharge: 'bg-blue-500 text-white',
      transfer_in: 'bg-purple-500 text-white',
      transfer_out: 'bg-orange-500 text-white',
      status_change: 'bg-gray-500 text-white',
      maintenance: 'bg-red-500 text-white',
      cleaning: 'bg-cyan-500 text-white',
      reservation: 'bg-yellow-500 text-white',
    };
    return colors[eventType] || 'bg-gray-500 text-white';
  };

  const getEventTitle = (event: BedEvent) => {
    const titles = {
      admission: 'Patient Admitted',
      discharge: 'Patient Discharged',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
      status_change: 'Status Changed',
      maintenance: 'Maintenance',
      cleaning: 'Cleaning',
      reservation: 'Bed Reserved',
    };
    return titles[event.eventType] || 'Event';
  };

  const getEventDescription = (event: BedEvent) => {
    switch (event.eventType) {
      case 'admission':
        return `${event.patientName} admitted to ${event.bedNumber}`;
      case 'discharge':
        return `${event.patientName} discharged from ${event.bedNumber}`;
      case 'transfer_in':
        return `${event.patientName} transferred from ${event.fromLocation} to ${event.bedNumber}`;
      case 'transfer_out':
        return `${event.patientName} transferred from ${event.bedNumber} to ${event.toLocation}`;
      case 'status_change':
        return `${event.bedNumber} status: ${event.fromStatus} → ${event.toStatus}`;
      case 'maintenance':
        return `${event.bedNumber} under maintenance`;
      case 'cleaning':
        return `${event.bedNumber} being cleaned`;
      case 'reservation':
        return `${event.bedNumber} reserved for ${event.patientName || 'patient'}`;
      default:
        return event.notes || 'Event occurred';
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter events if a bed is selected
  const filteredEvents = selectedBedId
    ? events.filter(e => e.bedId === selectedBedId)
    : events;

  // Sort events by timestamp (most recent first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Group events by date
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const date = new Date(event.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, BedEvent[]>);

  const EventIcon = ({ eventType }: { eventType: BedEventType }) => {
    const Icon = getEventIcon(eventType);
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Card className="w-full">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold">Bed Event Log</h3>
            {selectedBedId && (
              <Badge variant="outline" className="text-xs">
                Filtered
              </Badge>
            )}
          </div>
          <Badge variant="secondary">{filteredEvents.length} events</Badge>
        </div>
      </div>

      <ScrollArea className="h-64">
        <div className="p-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No events to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                <div key={date} className="space-y-2">
                  {showDate && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 sticky top-0 bg-white py-1">
                      <div className="h-px flex-1 bg-gray-300" />
                      <span>{formatDate(date)}</span>
                      <div className="h-px flex-1 bg-gray-300" />
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="relative pl-8 space-y-3">
                    {/* Vertical line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300" />

                    {dateEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className={`
                          relative cursor-pointer transition-all
                          ${selectedEvent === event.id ? 'scale-105' : ''}
                        `}
                        onClick={() => {
                          setSelectedEvent(event.id);
                          onEventClick?.(event);
                        }}
                      >
                        {/* Timeline dot */}
                        <div
                          className={`
                            absolute -left-5 top-1 w-6 h-6 rounded-full flex items-center justify-center
                            ${getEventColor(event.eventType)}
                            ${selectedEvent === event.id ? 'ring-4 ring-blue-200' : ''}
                          `}
                        >
                          <EventIcon eventType={event.eventType} />
                        </div>

                        {/* Event card */}
                        <div
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            ${selectedEvent === event.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'}
                          `}
                        >
                          {/* Event header */}
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <div className="font-semibold text-sm">
                                {getEventTitle(event)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {getEventDescription(event)}
                              </div>
                            </div>
                            <div className="text-xs font-mono text-gray-500 ml-2">
                              {formatTime(event.timestamp)}
                            </div>
                          </div>

                          {/* Event details */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs gap-1">
                              <BedIcon className="w-3 h-3" />
                              {event.bedNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {event.wardName}
                            </Badge>
                            {event.roomNumber && (
                              <Badge variant="outline" className="text-xs">
                                Room {event.roomNumber}
                              </Badge>
                            )}
                            {event.patientMrn && (
                              <Badge variant="secondary" className="text-xs">
                                {event.patientMrn}
                              </Badge>
                            )}
                            {event.priority && event.priority !== 'routine' && (
                              <Badge
                                variant={event.priority === 'emergency' ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {event.priority}
                              </Badge>
                            )}
                          </div>

                          {/* Performed by */}
                          {event.performedBy && (
                            <div className="text-xs text-gray-500 mt-2">
                              By: {event.performedBy}
                            </div>
                          )}

                          {/* Notes */}
                          {event.notes && event.eventType !== 'status_change' && (
                            <div className="text-xs text-gray-600 mt-2 italic">
                              {event.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
