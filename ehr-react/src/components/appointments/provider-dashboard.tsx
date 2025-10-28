'use client';

import React, { useState, useEffect } from 'react';
import type { Appointment } from '@/types/appointment';
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
  Calendar,
  MessageSquare,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProviderDashboardProps {
  practitionerId: string;
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
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
  onAppointmentClick
}: ProviderDashboardProps) {
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

  // Get today's appointments
  const today = new Date();
  const todayAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Calculate appointment stats
  const appointmentStats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    declined: appointments.filter(a => a.status === 'cancelled').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no-show').length
  };

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
      <span className={cn('px-2 py-1 rounded text-xs font-medium', style.bg, style.text)}>
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

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Uncheck Notification Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Uncheck Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {/* Row 1 */}
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Faxes</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.faxes}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FlaskConical className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Lab Results</div>
                <div className="text-2xl font-bold text-gray-900">{String(metrics.labResults).padStart(2, '0')}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Pill className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">eRx</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.eRx}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <UserPlus className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Referrals</div>
                <div className="text-2xl font-bold text-gray-900">{String(metrics.referrals).padStart(2, '0')}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <CheckSquare className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Tasks</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.tasks}</div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FileCheck className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Documents</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.documents}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <ClipboardList className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Unassigned Encounter</div>
                <div className="text-2xl font-bold text-gray-900">{String(metrics.unassignedEncounter).padStart(2, '0')}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Claim Received</div>
                <div className="text-2xl font-bold text-gray-900">{String(metrics.claimReceived).padStart(2, '0')}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Claim In Process</div>
                <div className="text-2xl font-bold text-gray-900">{String(metrics.claimInProcess).padStart(2, '0')}</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-6 w-6 text-red-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Claim Requiring Action</div>
                <div className="text-2xl font-bold text-red-600">{metrics.claimRequiringAction}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Upcoming Appointments */}
          <div className="col-span-5">
            <Card className="h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {todayAppointments.length}
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:underline">
                  <Calendar className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4">
                  PST &nbsp;&nbsp;&nbsp; {today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No appointments scheduled for today
                    </div>
                  ) : (
                    todayAppointments.map((apt, idx) => (
                      <div key={apt.id} className="flex gap-4">
                        {/* Time */}
                        <div className="text-sm text-gray-600 w-16 flex-shrink-0">
                          {formatTime(apt.startTime)}
                        </div>

                        {/* Appointment Card */}
                        <div
                          className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => onAppointmentClick?.(apt)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900">
                              {apt.patientName} ({apt.patientName.split(' ').pop()?.match(/\d+/)?.[0] || ''} Year {apt.patientName.includes('M)') ? 'M' : 'F'})
                            </div>
                            {getStatusBadge(apt.status)}
                          </div>
                          {apt.reason && (
                            <div className="text-xs text-gray-600">{apt.reason}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Tasks and Stats */}
          <div className="col-span-7 space-y-6">
            {/* To Do Tasks */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">To Do Task</CardTitle>
                  <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {tasks.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">
                        {task.assignedTo.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                        <div className="text-xs text-gray-600">
                          {task.assignedTo} • pr12341 31-12-1963 (M) 0 month
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Assign By: {task.assignedBy} 12-07-2022
                        </div>
                      </div>
                      <span className={cn(
                        'px-3 py-1 rounded text-xs font-medium',
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
              </CardContent>
            </Card>

            {/* Bottom Row - Stats and Messages */}
            <div className="grid grid-cols-2 gap-6">
              {/* Appointments Summary with Donut Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Appointments</CardTitle>
                    <button className="text-xs text-blue-600 hover:underline">View Report</button>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mt-1">
                    <button className="hover:text-gray-900">Last Month</button>
                    <button className="hover:text-gray-900">This Year</button>
                    <button className="hover:text-gray-900">Custom</button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900">{appointmentStats.total}</div>
                  </div>

                  {/* Simple stats list instead of actual donut chart */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                        <span className="text-gray-600">Scheduled</span>
                      </div>
                      <span className="font-semibold">{appointmentStats.scheduled}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Declined</span>
                      </div>
                      <span className="font-semibold">{appointmentStats.declined}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span className="text-gray-600">Cancelled</span>
                      </div>
                      <span className="font-semibold">{appointmentStats.cancelled}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                        <span className="text-gray-600">No Show</span>
                      </div>
                      <span className="font-semibold">{appointmentStats.noShow}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="relative">
                          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          {message.unread && (
                            <div className="absolute top-0 right-0 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">{message.sender}</div>
                          <div className="text-xs text-gray-600 truncate">{message.preview}</div>
                        </div>
                        <div className="text-xs text-gray-500 flex-shrink-0">{message.time}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
