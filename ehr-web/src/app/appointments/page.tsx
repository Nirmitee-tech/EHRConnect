'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarView, Appointment, AppointmentStats } from '@/types/appointment';
import { CalendarToolbar } from '@/components/appointments/calendar-toolbar';
import { DayView } from '@/components/appointments/day-view';
import { WeekViewDraggable } from '@/components/appointments/week-view-draggable';
import { MonthView } from '@/components/appointments/month-view';
import { AppointmentStatsPanel } from '@/components/appointments/appointment-stats';
import { AppointmentFormDrawer } from '@/components/appointments/appointment-form-drawer';
import { AppointmentDetailsDrawer } from '@/components/appointments/appointment-details-drawer';
import { MiniCalendar } from '@/components/appointments/mini-calendar';
import { EventFilters, EventCategory } from '@/components/appointments/event-filters';
import { AppointmentService } from '@/services/appointment.service';
import { EncounterService } from '@/services/encounter.service';
import { Loader2, Plus, ChevronDown, RefreshCw, Info, ArrowRight, Keyboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrintAppointments } from '@/components/appointments/print-appointments';
import { useFacility } from '@/contexts/facility-context';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { io, Socket } from 'socket.io-client';
import { getSession } from '@/lib/auth';

// Medical appointment categories
const medicalCategories: EventCategory[] = [
  { id: 'consultation', label: 'Consultation', color: 'bg-blue-500', checked: true },
  { id: 'follow-up', label: 'Follow-up', color: 'bg-green-500', checked: true },
  { id: 'emergency', label: 'Emergency', color: 'bg-red-500', checked: true },
  { id: 'routine', label: 'Routine Check-up', color: 'bg-purple-500', checked: true },
  { id: 'surgery', label: 'Surgery', color: 'bg-orange-500', checked: true }
];

export default function AppointmentsPage() {
  const router = useRouter();
  const { currentFacility } = useFacility();

  // Socket.IO connection
  const socketRef = useRef<Socket | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>(medicalCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'online' | 'followups'>('appointments');
  const [showTreatmentCategories, setShowTreatmentCategories] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [practitionerFilter, setPractitionerFilter] = useState<string | null>(null);
  const [practitionerSearchQuery, setPractitionerSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'admin' | 'doctor'>('admin');
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null); // For doctor view
  const [showLocations, setShowLocations] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New appointment
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewAppointment();
      }
      // Ctrl/Cmd + R: Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadAppointments();
        loadStats();
      }
      // T: Go to today
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        handleToday();
      }
      // Escape: Close any open drawer
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsDetailsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Get unique practitioners with appointment counts
  const practitioners = useMemo(() => {
    const practitionerMap = new Map<string, number>();
    allAppointments.forEach(apt => {
      const name = apt.practitionerName;
      practitionerMap.set(name, (practitionerMap.get(name) || 0) + 1);
    });
    return Array.from(practitionerMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allAppointments]);

  // Get unique locations with appointment counts
  const locations = useMemo(() => {
    const locationMap = new Map<string, number>();
    allAppointments.forEach(apt => {
      const location = apt.location || 'Unassigned';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });
    return Array.from(locationMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allAppointments]);

  // Filter practitioners by search query
  const filteredPractitioners = useMemo(() => {
    if (!practitionerSearchQuery) return practitioners;
    const query = practitionerSearchQuery.toLowerCase();
    return practitioners.filter(p => p.name.toLowerCase().includes(query));
  }, [practitioners, practitionerSearchQuery]);

  // Filter locations by search query
  const filteredLocations = useMemo(() => {
    if (!locationSearchQuery) return locations;
    const query = locationSearchQuery.toLowerCase();
    return locations.filter(l => l.name.toLowerCase().includes(query));
  }, [locations, locationSearchQuery]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const inPersonCount = allAppointments.filter(apt => {
      const aptType = (apt.appointmentType || apt.type || '').toLowerCase();
      return !aptType.includes('online') && !aptType.includes('virtual') && !aptType.includes('telemedicine') && !aptType.includes('telehealth');
    }).length;

    const onlineCount = allAppointments.filter(apt => {
      const aptType = (apt.appointmentType || apt.type || '').toLowerCase();
      return aptType.includes('online') || aptType.includes('virtual') || aptType.includes('telemedicine') || aptType.includes('telehealth');
    }).length;

    const followupCount = allAppointments.filter(apt => {
      const aptType = (apt.appointmentType || apt.type || apt.category || '').toLowerCase();
      return aptType.includes('follow-up') || aptType.includes('followup') || aptType.includes('follow up');
    }).length;

    return { inPersonCount, onlineCount, followupCount };
  }, [allAppointments]);

  // Filter appointments based on selected categories, search query, and status
  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(apt => {
      // View mode filter - Doctor view only shows their appointments
      if (viewMode === 'doctor' && currentDoctorId) {
        if (apt.practitionerId !== currentDoctorId && apt.practitionerName !== currentDoctorId) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'online') {
        // Show only online/virtual appointments
        const aptType = (apt.appointmentType || apt.type || '').toLowerCase();
        if (!aptType.includes('online') && !aptType.includes('virtual') && !aptType.includes('telemedicine') && !aptType.includes('telehealth')) {
          return false;
        }
      } else if (activeTab === 'followups') {
        // Show only follow-up appointments
        const aptType = (apt.appointmentType || apt.type || apt.category || '').toLowerCase();
        if (!aptType.includes('follow-up') && !aptType.includes('followup') && !aptType.includes('follow up')) {
          return false;
        }
      } else if (activeTab === 'appointments') {
        // Show in-person appointments (exclude online appointments)
        const aptType = (apt.appointmentType || apt.type || '').toLowerCase();
        if (aptType.includes('online') || aptType.includes('virtual') || aptType.includes('telemedicine') || aptType.includes('telehealth')) {
          return false;
        }
      }

      // Location filter
      if (locationFilter) {
        const aptLocation = apt.location || 'Unassigned';
        if (aptLocation !== locationFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && apt.status !== statusFilter) {
        return false;
      }

      // Practitioner filter
      if (practitionerFilter && apt.practitionerName !== practitionerFilter) {
        return false;
      }

      // Category filter - check both category and appointmentType/type fields
      const aptCategory = apt.category || apt.appointmentType || apt.type;
      if (aptCategory) {
        const categoryEnabled = categories.find(c => c.id === aptCategory)?.checked ?? true;
        if (!categoryEnabled) return false;
      }

      // Search filter (for patient names in the appointments list)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return apt.patientName.toLowerCase().includes(query);
      }

      return true;
    });
  }, [allAppointments, categories, searchQuery, statusFilter, practitionerFilter, activeTab, viewMode, currentDoctorId, locationFilter]);

  // Track the last loaded range to avoid unnecessary reloads
  const [lastLoadedRange, setLastLoadedRange] = React.useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    const rangeKey = `${startDate.toISOString()}-${endDate.toISOString()}`;

    // Only reload if we're viewing a different date range
    if (lastLoadedRange?.start !== startDate.toISOString() || lastLoadedRange?.end !== endDate.toISOString()) {
      loadAppointments();
      loadStats();
      setLastLoadedRange({ start: startDate.toISOString(), end: endDate.toISOString() });
    }
  }, [currentDate, view]);

  // Recalculate stats when active tab changes
  useEffect(() => {
    calculateStats(allAppointments);
  }, [activeTab]);

  // Initialize Socket.IO for real-time updates
  useEffect(() => {
    const initSocket = async () => {
      try {
        const session = await getSession();
        if (!session?.token || !session?.orgId) {
          console.log('No session available for Socket.IO');
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const socket = io(API_URL, {
          auth: {
            token: session.token,
            orgId: session.orgId
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('✅ Connected to real-time appointment service');
        });

        socket.on('connected', (data: any) => {
          console.log('Real-time service ready:', data.message);
        });

        socket.on('disconnect', () => {
          console.log('❌ Disconnected from real-time service');
        });

        socket.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error.message);
        });

        // Listen for appointment events
        socket.on('appointment:created', (data: any) => {
          console.log('📅 Appointment created:', data);
          loadAppointments();
          loadStats();
        });

        socket.on('appointment:updated', (data: any) => {
          console.log('✏️ Appointment updated:', data);
          loadAppointments();
          loadStats();
        });

        socket.on('appointment:cancelled', (data: any) => {
          console.log('❌ Appointment cancelled:', data);
          loadAppointments();
          loadStats();
        });

        socket.on('slots:changed', (data: any) => {
          console.log('🔄 Slots changed:', data);
          loadAppointments();
        });
      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Loading appointments from:', startDate.toLocaleDateString(), 'to:', endDate.toLocaleDateString());
      const data = await AppointmentService.getAppointments(startDate, endDate);
      console.log('Loaded appointments:', data.length);
      console.log('Appointments data:', data.map(apt => ({
        id: apt.id,
        patient: apt.patientName,
        start: new Date(apt.startTime).toLocaleString(),
        end: new Date(apt.endTime).toLocaleString()
      })));
      setAllAppointments(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAllAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments: Appointment[]) => {
    // Filter appointments based on active tab
    let tabFilteredAppointments = appointments;
    if (activeTab === 'online') {
      tabFilteredAppointments = appointments.filter(apt => {
        const aptType = (apt.appointmentType || apt.type || '').toLowerCase();
        return aptType.includes('online') || aptType.includes('virtual') || aptType.includes('telemedicine') || aptType.includes('telehealth');
      });
    } else if (activeTab === 'followups') {
      tabFilteredAppointments = appointments.filter(apt => {
        const aptType = (apt.appointmentType || apt.type || apt.category || '').toLowerCase();
        return aptType.includes('follow-up') || aptType.includes('followup') || aptType.includes('follow up');
      });
    } else if (activeTab === 'appointments') {
      tabFilteredAppointments = appointments.filter(apt => {
        const aptType = (apt.appointmentType || apt.type || '').toLowerCase();
        return !aptType.includes('online') && !aptType.includes('virtual') && !aptType.includes('telemedicine') && !aptType.includes('telehealth');
      });
    }

    const stats = {
      total: tabFilteredAppointments.length,
      scheduled: tabFilteredAppointments.filter(a => a.status === 'scheduled').length,
      inProgress: tabFilteredAppointments.filter(a => a.status === 'in-progress').length,
      completed: tabFilteredAppointments.filter(a => a.status === 'completed').length,
      cancelled: tabFilteredAppointments.filter(a => a.status === 'cancelled').length
    };
    setStats(stats);
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await AppointmentService.getAppointmentStats(startOfDay, endOfDay);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      calculateStats(allAppointments);
    }
  };

  const getDateRange = () => {
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);

    const startDate = new Date(current);
    const endDate = new Date(current);

    if (view === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      // Get day of week (0 = Sunday, 6 = Saturday)
      const dayOfWeek = current.getDay();

      // Start of week (Sunday)
      startDate.setDate(current.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);

      // End of week (Saturday)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Month view
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDrawerOpen(true);
  };

  const handleMissed = (appointment: Appointment) => {
    // Update appointment status to no-show
    setAllAppointments(prev => prev.map(apt =>
      apt.id === appointment.id ? { ...apt, status: 'no-show' } : apt
    ));
    AppointmentService.updateAppointment(appointment.id, { status: 'no-show' });
  };

  const handleCheckIn = (appointment: Appointment) => {
    // Update appointment status to in-progress
    setAllAppointments(prev => prev.map(apt =>
      apt.id === appointment.id ? { ...apt, status: 'in-progress' } : apt
    ));
    AppointmentService.updateAppointment(appointment.id, { status: 'in-progress' });
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    // Update appointment status to cancelled
    setAllAppointments(prev => prev.map(apt =>
      apt.id === appointment.id ? { ...apt, status: 'cancelled' } : apt
    ));
    AppointmentService.updateAppointment(appointment.id, { status: 'cancelled' });
  };

  const handleCopyAppointment = (appointment: Appointment) => {
    // Copy appointment details to clipboard
    const text = `Appointment: ${appointment.patientName}\nPractitioner: ${appointment.practitionerName}\nTime: ${new Date(appointment.startTime).toLocaleString()}\nDuration: ${appointment.duration} mins`;
    navigator.clipboard.writeText(text);
    alert('Appointment details copied to clipboard');
  };

  const handleStartEncounter = async (appointment: Appointment) => {
    try {
      // Create encounter from appointment
      const encounter = await EncounterService.createFromAppointment(appointment);

      // Update appointment status to in-progress
      await AppointmentService.updateAppointment(appointment.id, { status: 'in-progress' });
      setAllAppointments(prev => prev.map(apt =>
        apt.id === appointment.id ? { ...apt, status: 'in-progress' } : apt
      ));

      // Navigate to encounter page
      router.push(`/encounters/${encounter.id}`);
    } catch (error) {
      console.error('Error starting encounter:', error);
      alert('Failed to start encounter. Please try again.');
    }
  };

  const handleDateClick = (date: Date) => {
    setClickedDate(date);
    setIsDrawerOpen(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setClickedDate(currentDate);
    setIsDrawerOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDrawerOpen(true);
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    // Check if it's an update or a new appointment
    const existingIndex = allAppointments.findIndex(apt => apt.id === appointment.id);

    if (existingIndex >= 0) {
      // Update existing appointment
      setAllAppointments(prev => prev.map(apt =>
        apt.id === appointment.id ? appointment : apt
      ));
    } else {
      // Add new appointment
      setAllAppointments(prev => [...prev, appointment]);
    }

    // Recalculate stats with updated data
    const updatedAppointments = existingIndex >= 0
      ? allAppointments.map(apt => apt.id === appointment.id ? appointment : apt)
      : [...allAppointments, appointment];
    calculateStats(updatedAppointments);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(categories.map(c =>
      c.id === categoryId ? { ...c, checked: !c.checked } : c
    ));
  };

  const handleAppointmentDrop = async (appointment: Appointment, newDate: Date, newHour: number) => {
    try {
      // Calculate new start and end times
      // newHour can be a decimal (e.g., 9.5 for 9:30)
      const hours = Math.floor(newHour);
      const minutes = Math.round((newHour - hours) * 60);

      const newStartTime = new Date(newDate);
      newStartTime.setHours(hours, minutes, 0, 0);

      const duration = appointment.duration;
      const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

      // Optimistically update the UI first
      setAllAppointments(prev => prev.map(apt =>
        apt.id === appointment.id
          ? { ...apt, startTime: newStartTime, endTime: newEndTime }
          : apt
      ));

      // Update the appointment in the backend
      const updates: Partial<Appointment> = {
        startTime: newStartTime,
        endTime: newEndTime
      };

      await AppointmentService.updateAppointment(appointment.id, updates);

    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to reschedule appointment. Please try again.');
      // Reload to revert visual changes on error
      loadAppointments();
    }
  };

  const handleCreateFromDrag = (date: Date, startHour: number, endHour: number) => {
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);

    // Calculate duration in minutes
    const durationMinutes = (endHour - startHour) * 60;

    // Open the drawer with pre-filled date and time
    setClickedDate(startTime);
    setIsDrawerOpen(true);
  };

  const handleAppointmentResize = async (appointment: Appointment, newStartTime: Date, newEndTime: Date) => {
    try {
      // Calculate new duration in minutes
      const durationMs = newEndTime.getTime() - newStartTime.getTime();
      const newDuration = Math.round(durationMs / (1000 * 60));

      console.log('🔄 Resizing appointment:', {
        id: appointment.id,
        patient: appointment.patientName,
        oldStart: new Date(appointment.startTime).toLocaleString(),
        oldEnd: new Date(appointment.endTime).toLocaleString(),
        oldDuration: appointment.duration,
        newStart: newStartTime.toLocaleString(),
        newEnd: newEndTime.toLocaleString(),
        newDuration
      });

      // Optimistically update the UI first
      setAllAppointments(prev => prev.map(apt =>
        apt.id === appointment.id
          ? { ...apt, startTime: newStartTime, endTime: newEndTime, duration: newDuration }
          : apt
      ));

      // Update the appointment in the backend
      const updates: Partial<Appointment> = {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: newDuration
      };

      const result = await AppointmentService.updateAppointment(appointment.id, updates);
      console.log('✅ Appointment resized successfully:', result);

    } catch (error) {
      console.error('❌ Error resizing appointment:', error);
      alert('Failed to resize appointment. Please try again.');
      // Reload to revert visual changes on error
      loadAppointments();
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      // Optimistically update the UI
      setAllAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
      ));

      // Update the appointment in the backend
      await AppointmentService.updateAppointment(appointmentId, { status: newStatus as any });

      // Reload to ensure data consistency
      loadAppointments();
      loadStats();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status. Please try again.');
      loadAppointments();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Floating Add Button */}
      <Button
        onClick={handleNewAppointment}
        className="fixed bottom-8 right-8 z-30 h-14 w-14 rounded-full bg-blue-600 text-white p-0 shadow-lg hover:bg-blue-700"
        title="New Appointment (Ctrl+N)"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Keyboard Shortcuts Helper */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="fixed bottom-8 right-28 z-30 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow-md transition-colors"
        title="Keyboard Shortcuts"
      >
        <Keyboard className="h-4 w-4 text-gray-700" />
      </button>

      {/* Shortcuts Popup */}
      {showShortcuts && (
        <div className="fixed bottom-24 right-28 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Appointment</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+N</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Refresh</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+R</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Go to Today</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">T</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Close Drawer</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Esc</kbd>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-gray-200">
        <CalendarToolbar
          currentDate={currentDate}
          view={view}
          onViewChange={handleViewChange}
          onDateChange={handleDateChange}
          onToday={handleToday}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            // If switching to doctor view, set a default doctor (first in list)
            if (mode === 'doctor' && practitioners.length > 0) {
              setCurrentDoctorId(practitioners[0].name);
            }
          }}
        />
        {/* Print button hidden - not needed for daily use */}
        {/* <PrintAppointments
          appointments={filteredAppointments}
          date={currentDate}
          view={view}
          facilityName={currentFacility?.name}
        /> */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main calendar area */}
        <div className="flex-1 overflow-hidden bg-white">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  appointments={filteredAppointments}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentDrop={handleAppointmentDrop}
                  onCreateAppointment={handleCreateFromDrag}
                  onAppointmentResize={handleAppointmentResize}
                />
              )}
              {view === 'week' && (
                <WeekViewDraggable
                  currentDate={currentDate}
                  appointments={filteredAppointments}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentDrop={handleAppointmentDrop}
                  onCreateAppointment={handleCreateFromDrag}
                  onAppointmentResize={handleAppointmentResize}
                  onStatusChange={handleStatusChange}
                  onStartEncounter={handleStartEncounter}
                />
              )}
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  appointments={filteredAppointments}
                  onAppointmentClick={handleAppointmentClick}
                  onDateClick={handleDateClick}
                />
              )}
            </>
          )}
        </div>

        {/* Right Sidebar - Compact Style */}
        <div className={`border-l border-gray-200 bg-gray-50 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-12' : 'w-80'
        }`}>
          {/* Toggle Button */}
          <div className="bg-white border-b border-gray-200 flex items-center justify-between px-2 py-2.5">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
            {!isSidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-900 flex-1 ml-2">Today</h2>
            )}
          </div>

          {/* Tabs */}
          {!isSidebarCollapsed && (
            <div className="bg-white border-b border-gray-200 flex">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Appointments</span>
                  {tabCounts.inPersonCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tabCounts.inPersonCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('online')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'online'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Online</span>
                  {tabCounts.onlineCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTab === 'online' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tabCounts.onlineCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('followups')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'followups'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Follow ups</span>
                  {tabCounts.followupCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTab === 'followups' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tabCounts.followupCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Status Filters - Compact */}
          {!isSidebarCollapsed && (
            <div className="bg-white px-3 py-2 border-b border-gray-200">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setStatusFilter(null)}
                  className={`flex items-center justify-center min-w-[58px] h-14 rounded transition-all ${
                    statusFilter === null
                      ? 'bg-blue-900 text-white ring-2 ring-blue-900 ring-offset-1'
                      : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{stats.total}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide">All</div>
                  </div>
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === 'scheduled' ? null : 'scheduled')}
                  className={`flex items-center justify-center min-w-[58px] h-14 rounded transition-all ${
                    statusFilter === 'scheduled'
                      ? 'bg-gray-700 text-white ring-2 ring-gray-700 ring-offset-1'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base font-bold">{stats.scheduled}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide">Sched</div>
                  </div>
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === 'in-progress' ? null : 'in-progress')}
                  className={`flex items-center justify-center min-w-[58px] h-14 rounded transition-all ${
                    statusFilter === 'in-progress'
                      ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-1'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base font-bold">{stats.inProgress}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide">In Out</div>
                  </div>
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === 'completed' ? null : 'completed')}
                  className={`flex items-center justify-center min-w-[58px] h-14 rounded transition-all ${
                    statusFilter === 'completed'
                      ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-1'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base font-bold">{stats.completed}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide">Done</div>
                  </div>
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === 'cancelled' ? null : 'cancelled')}
                  className={`flex items-center justify-center min-w-[58px] h-14 rounded transition-all ${
                    statusFilter === 'cancelled'
                      ? 'bg-gray-700 text-white ring-2 ring-gray-700 ring-offset-1'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base font-bold">{stats.cancelled}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide">Cancel</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    loadAppointments();
                    loadStats();
                  }}
                  className="flex items-center justify-center min-w-[44px] h-14 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Filters */}
          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-y-auto">
            {/* Treatment Categories */}
            <div className="bg-white border-b border-gray-200">
              <button
                onClick={() => setShowTreatmentCategories(!showTreatmentCategories)}
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xs font-medium text-gray-900">Treatment Categories</h3>
                <ChevronDown
                  className={`h-3 w-3 text-gray-500 transition-transform ${
                    showTreatmentCategories ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showTreatmentCategories && (
                <div className="px-4 pb-3">
                  <EventFilters
                    categories={categories}
                    searchQuery=""
                    onCategoryToggle={handleCategoryToggle}
                    onSearchChange={() => {}}
                  />
                </div>
              )}
            </div>

            {/* Practitioners */}
            {viewMode === 'admin' && (
              <div className="bg-white border-b border-gray-200">
                <button
                  onClick={() => setShowDoctors(!showDoctors)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xs font-medium text-gray-900">Practitioners</h3>
                  <ChevronDown
                    className={`h-3 w-3 text-gray-500 transition-transform ${showDoctors ? 'rotate-180' : ''}`}
                  />
                </button>
                {showDoctors && (
                  <div className="px-4 pb-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Search practitioners..."
                      value={practitionerSearchQuery}
                      onChange={(e) => setPractitionerSearchQuery(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => setPractitionerFilter(null)}
                        className={`w-full px-2 py-1.5 text-left text-xs rounded transition-colors flex items-center justify-between ${
                          practitionerFilter === null
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>All Practitioners</span>
                        <span className="text-xs font-semibold">{practitioners.reduce((sum, p) => sum + p.count, 0)}</span>
                      </button>
                      {filteredPractitioners.map((practitioner) => (
                        <button
                          key={practitioner.name}
                          onClick={() => setPractitionerFilter(practitioner.name)}
                          className={`w-full px-2 py-1.5 text-left text-xs rounded transition-colors flex items-center justify-between ${
                            practitionerFilter === practitioner.name
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="truncate">{practitioner.name}</span>
                          <span className="text-xs font-semibold ml-2">{practitioner.count}</span>
                        </button>
                      ))}
                      {filteredPractitioners.length === 0 && practitionerSearchQuery && (
                        <div className="px-2 py-2 text-xs text-gray-500 text-center">
                          No practitioners found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Doctor Selector for Doctor View */}
            {viewMode === 'doctor' && (
              <div className="bg-white border-b border-gray-200">
                <div className="px-4 py-2.5">
                  <SearchableSelect
                    label="Select Practitioner"
                    options={practitioners.map(p => ({
                      value: p.name,
                      label: p.name,
                      subtitle: `${p.count} appointment${p.count !== 1 ? 's' : ''}`
                    }))}
                    value={currentDoctorId || ''}
                    onChange={(value) => setCurrentDoctorId(value)}
                    placeholder="Choose a practitioner..."
                  />
                </div>
              </div>
            )}

            {/* Locations */}
            <div className="bg-white border-b border-gray-200">
              <button
                onClick={() => setShowLocations(!showLocations)}
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xs font-medium text-gray-900">Locations</h3>
                <ChevronDown
                  className={`h-3 w-3 text-gray-500 transition-transform ${showLocations ? 'rotate-180' : ''}`}
                />
              </button>
              {showLocations && (
                <div className="px-4 pb-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setLocationFilter(null)}
                      className={`w-full px-2 py-1.5 text-left text-xs rounded transition-colors flex items-center justify-between ${
                        locationFilter === null
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>All Locations</span>
                      <span className="text-xs font-semibold">{locations.reduce((sum, l) => sum + l.count, 0)}</span>
                    </button>
                    {filteredLocations.map((location) => (
                      <button
                        key={location.name}
                        onClick={() => setLocationFilter(location.name)}
                        className={`w-full px-2 py-1.5 text-left text-xs rounded transition-colors flex items-center justify-between ${
                          locationFilter === location.name
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{location.name}</span>
                        <span className="text-xs font-semibold ml-2">{location.count}</span>
                      </button>
                    ))}
                    {filteredLocations.length === 0 && locationSearchQuery && (
                      <div className="px-2 py-2 text-xs text-gray-500 text-center">
                        No locations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Appointments List */}
            <div className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mx-auto mb-1.5">
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">No appointments</p>
                </div>
              ) : (
                filteredAppointments
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => handleAppointmentClick(appointment)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Info className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">
                              {appointment.patientName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mt-0.5">
                              <span>
                                {new Date(appointment.startTime).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span>{appointment.duration}m</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                              appointment.status === 'scheduled'
                                ? 'bg-gray-200 text-gray-700'
                                : appointment.status === 'in-progress'
                                ? 'bg-red-100 text-red-700'
                                : appointment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {appointment.status === 'scheduled' ? 'Sched' :
                             appointment.status === 'in-progress' ? 'In Out' :
                             appointment.status === 'completed' ? 'Done' : 'Cancel'}
                          </span>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Appointment Form Drawer */}
      <AppointmentFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedAppointment(null);
          setClickedDate(undefined);
        }}
        onSave={handleSaveAppointment}
        initialDate={clickedDate}
        editingAppointment={selectedAppointment}
        existingAppointments={allAppointments}
      />

      {/* Appointment Details Drawer */}
      <AppointmentDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onEdit={(apt) => {
          setSelectedAppointment(apt);
          setIsDrawerOpen(true);
        }}
        onMissed={handleMissed}
        onCheckIn={handleCheckIn}
        onCancel={handleCancelAppointment}
        onCopy={handleCopyAppointment}
        onStartEncounter={handleStartEncounter}
        onAppointmentUpdated={() => {
          loadAppointments();
          loadStats();
        }}
        onCreateSuperbill={(apt) => {
          router.push(`/billing/claims/new?appointmentId=${apt.id}`);
        }}
      />
    </div>
  );
}
