'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Appointment } from '@/types/appointment';
import {
  FileText,
  FlaskConical,
  Pill,
  UserPlus,
  CheckSquare,
  FileCheck,
  ClipboardList,
  DollarSign,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderDashboardProps {
  practitionerId: string;
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateChange?: (date: Date) => void;
  onAppointmentDrop?: (appointment: Appointment, newDate: Date, newHour: number) => void;
}

interface DashboardMetrics {
  faxes: number;
  labResults: number;
  eRx: number;
  referrals: number;
  tasks: number;
  documents: number;
  unassignedEncounter: number;
  claimReceived: number;
  claimInProcess: number;
  claimRequiringAction: number;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  status: 'new' | 'pending' | 'inProgress';
  avatar?: string;
}

interface Message {
  id: string;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
  avatar?: string;
}

export function ProviderDashboard({
  practitionerId,
  currentDate,
  appointments,
  onAppointmentClick,
  onDateChange,
  onAppointmentDrop
}: ProviderDashboardProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarScrollRef = React.useRef<HTMLDivElement>(null);
  const currentTimeRef = React.useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    faxes: 0,
    labResults: 0,
    eRx: 0,
    referrals: 0,
    tasks: 0,
    documents: 0,
    unassignedEncounter: 0,
    claimReceived: 0,
    claimInProcess: 0,
    claimRequiringAction: 0
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Get appointments for the selected date
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const todayAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === selectedDate.toDateString();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange?.(today);
  };

  // Calculate appointment stats
  const appointmentStats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    declined: appointments.filter(a => a.status === 'cancelled').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no-show').length
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (currentTimeRef.current && calendarScrollRef.current) {
      const timeElement = currentTimeRef.current;
      const scrollContainer = calendarScrollRef.current;

      // Scroll to current time with some offset
      const scrollPosition = timeElement.offsetTop - scrollContainer.offsetTop - 100;
      scrollContainer.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [practitionerId]);

  const loadDashboardData = async () => {
    // TODO: Replace with actual API calls
    // For now, using mock data
    setMetrics({
      faxes: 17,
      labResults: 7,
      eRx: 29,
      referrals: 6,
      tasks: 10,
      documents: 32,
      unassignedEncounter: 5,
      claimReceived: 2,
      claimInProcess: 6,
      claimRequiringAction: 28
    });

    setTasks([
      {
        id: '1',
        title: 'Process Portal Responses',
        assignedTo: 'Lesley Dobson',
        assignedBy: 'Roger Ritchie',
        dueDate: '17-08-2022',
        status: 'inProgress'
      },
      {
        id: '2',
        title: 'Create a Progress Note for Therapy Session',
        assignedTo: 'Brenda Washington',
        assignedBy: 'Antoinetlyte',
        dueDate: '15-08-2022',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Create a Progress Note for Therapy Session',
        assignedTo: 'Christine Flores',
        assignedBy: 'Keith Scott',
        dueDate: '31-08-2022',
        status: 'new'
      },
      {
        id: '4',
        title: 'Review electronic claim rejections',
        assignedTo: 'Annie Howard',
        assignedBy: 'Billy Alastair',
        dueDate: '19-08-2022',
        status: 'new'
      }
    ]);

    setMessages([
      {
        id: '1',
        sender: 'Julianne Conley',
        preview: 'I attached my last blood...',
        time: '8 min ago',
        unread: true
      },
      {
        id: '2',
        sender: 'Delores Holt',
        preview: 'How Are You',
        time: '15 min ago',
        unread: false
      },
      {
        id: '3',
        sender: 'Jonathon Chandler',
        preview: 'How Are You',
        time: '1 day ago',
        unread: false
      },
      {
        id: '4',
        sender: 'Amber Pratt',
        preview: 'How Are You',
        time: '2 days ago',
        unread: false
      },
      {
        id: '5',
        sender: 'Rosemarie Mccarthy',
        preview: 'How Are You',
        time: '4 days ago',
        unread: false
      }
    ]);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const statusMap = {
      'scheduled': { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Scheduled' },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Checked In' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'In Exam' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      'no-show': { bg: 'bg-gray-400', text: 'text-gray-800', label: 'No Show' },
      'rescheduled': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Rescheduled' },
      'waitlist': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Waitlist' }
    };

    const style = statusMap[status] || statusMap['scheduled'];
    return (
      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', style.bg, style.text)}>
        {style.label}
      </span>
    );
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate time slots for the day (6 AM to 8 PM)
  const timeSlots = [];
  for (let hour = 6; hour <= 20; hour++) {
    timeSlots.push(hour);
  }

  // Get appointments for each time slot
  const getAppointmentAtTime = (hour: number) => {
    return todayAppointments.find(apt => {
      const aptHour = new Date(apt.startTime).getHours();
      return aptHour === hour;
    });
  };

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Only show if within our time range (6 AM to 8 PM)
    if (hours < 6 || hours > 20) {
      return null;
    }

    // Calculate position relative to 6 AM
    const slotIndex = hours - 6;
    const minutePercentage = minutes / 60;

    return {
      hour: hours,
      percentage: minutePercentage
    };
  };

  const currentTimePosition = getCurrentTimePosition();

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (draggedAppointment && onAppointmentDrop) {
      onAppointmentDrop(draggedAppointment, selectedDate, hour);
    }
    setDraggedAppointment(null);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50 flex flex-col">
      {/* Compact Notification Metrics Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-gray-700">Uncheck Notification</h3>
        </div>
        <div className="grid grid-cols-10 gap-2">
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Faxes</div>
            <div className="text-base font-bold text-gray-900">{metrics.faxes}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Lab Results</div>
            <div className="text-base font-bold text-gray-900">{String(metrics.labResults).padStart(2, '0')}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">eRx</div>
            <div className="text-base font-bold text-gray-900">{metrics.eRx}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Referrals</div>
            <div className="text-base font-bold text-gray-900">{String(metrics.referrals).padStart(2, '0')}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Tasks</div>
            <div className="text-base font-bold text-gray-900">{metrics.tasks}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Documents</div>
            <div className="text-base font-bold text-gray-900">{metrics.documents}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Unassigned Encounter</div>
            <div className="text-base font-bold text-gray-900">{String(metrics.unassignedEncounter).padStart(2, '0')}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Claim Received</div>
            <div className="text-base font-bold text-gray-900">{String(metrics.claimReceived).padStart(2, '0')}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-1.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-gray-500 mb-0.5 text-center">Claim In Process</div>
            <div className="text-base font-bold text-gray-900">{String(metrics.claimInProcess).padStart(2, '0')}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-red-50 rounded p-1.5 hover:bg-red-100 transition-colors cursor-pointer">
            <div className="text-[10px] text-red-600 mb-0.5 text-center">Claim Requiring Action</div>
            <div className="text-base font-bold text-red-600">{metrics.claimRequiringAction}</div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT: Day Schedule Calendar View */}
        <div ref={calendarScrollRef} className="w-[40%] border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-3">
            {/* Calendar Header with Navigation */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">Upcoming Appointments</h2>
                <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {todayAppointments.length}
                </span>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-3 bg-gray-50 rounded px-2 py-1.5">
              <button
                onClick={handlePreviousDay}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                >
                  Today
                </button>
                <div className="text-xs text-gray-700 font-medium">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <button
                onClick={handleNextDay}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Time-based Schedule with Drag & Drop */}
            <div className="space-y-2">
              {timeSlots.map((hour) => {
                const appointment = getAppointmentAtTime(hour);
                const timeLabel = hour === 0 ? '12 AM' :
                                 hour < 12 ? `${hour}:00` :
                                 hour === 12 ? '12 PM' :
                                 `${hour - 12}:00`;

                // Check if current time indicator should be shown in this hour
                const currentHour = currentTime.getHours();
                const currentMinutes = currentTime.getMinutes();
                const isCurrentHour = currentHour === hour &&
                                     selectedDate.toDateString() === new Date().toDateString();
                const currentTimeOffset = (currentMinutes / 60) * 50; // 50px is min-h of slot

                return (
                  <div
                    key={hour}
                    className="flex gap-2 relative"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, hour)}
                    ref={isCurrentHour ? currentTimeRef : null}
                  >
                    {/* Time Column */}
                    <div className="text-xs text-gray-500 w-12 flex-shrink-0 pt-1 font-medium">
                      {timeLabel}
                    </div>

                    {/* Appointment or Empty Slot */}
                    <div className="flex-1 relative">
                      {appointment ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, appointment)}
                          onDragEnd={handleDragEnd}
                          className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded cursor-move hover:bg-blue-100 transition-colors"
                          onClick={() => onAppointmentClick?.(appointment)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-semibold text-gray-900 text-xs">
                              {appointment.patientName}
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="text-[10px] text-gray-600">
                            {appointment.patientAge || '-- Year M'}
                          </div>
                          {appointment.reason && (
                            <div className="text-[10px] text-gray-500 mt-1">{appointment.reason}</div>
                          )}
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded min-h-[50px] hover:bg-gray-50 transition-colors"></div>
                      )}

                      {/* Current Time Indicator */}
                      {isCurrentHour && (
                        <div
                          className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                          style={{ top: `${currentTimeOffset}px` }}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                          <div className="flex-1 h-0.5 bg-red-500"></div>
                          <div className="text-[10px] font-medium text-red-500 ml-2 bg-white px-1">
                            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: To Do Tasks + Stats Grid */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 space-y-3">
            {/* To Do Task Section */}
            <div className="bg-white rounded border border-gray-200">
              <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">To Do Task</h3>
                  <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                    {tasks.filter(t => t.status === 'new').length}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-1.5 max-h-60 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-[10px] flex-shrink-0">
                      {task.assignedTo.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs">{task.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {task.assignedTo}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Assign By: {task.assignedBy} • {task.dueDate}
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0',
                      task.status === 'inProgress' ? 'bg-yellow-100 text-yellow-700' :
                      task.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {task.status === 'inProgress' ? 'In Progress' :
                       task.status === 'pending' ? 'Pending' : 'New'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Grid - Appointments Chart + Messages */}
            <div className="grid grid-cols-2 gap-3">
              {/* Appointments Chart */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Appointments</h3>
                    <button className="text-xs text-blue-600 hover:underline">View Report</button>
                  </div>
                  <div className="flex gap-2 text-[10px] text-gray-500 mt-1">
                    <button className="hover:text-gray-700">Last Month</button>
                    <button className="hover:text-gray-700">This Year</button>
                    <button className="hover:text-gray-700">Custom</button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-gray-900">{appointmentStats.total}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                        <span className="text-gray-600">Scheduled</span>
                      </div>
                      <span className="font-semibold text-gray-900">{appointmentStats.scheduled}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Declined</span>
                      </div>
                      <span className="font-semibold text-gray-900">{appointmentStats.declined}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-500"></div>
                        <span className="text-gray-600">Cancelled</span>
                      </div>
                      <span className="font-semibold text-gray-900">{appointmentStats.cancelled}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-400"></div>
                        <span className="text-gray-600">No Show</span>
                      </div>
                      <span className="font-semibold text-gray-900">{appointmentStats.noShow}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
                  <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                    {messages.filter(m => m.unread).length}
                  </span>
                </div>
                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded transition-colors cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        {message.unread && (
                          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-blue-600 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-xs", message.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>{message.sender}</div>
                        <div className="text-[10px] text-gray-500 truncate">{message.preview}</div>
                      </div>
                      <div className="text-[10px] text-gray-400 flex-shrink-0">{message.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
