'use client';

import React, { useState, useEffect } from 'react';
import { CalendarView, Appointment, AppointmentStats } from '@/types/appointment';
import { CalendarToolbar } from '@/components/appointments/calendar-toolbar';
import { WeekViewDraggable } from '@/components/appointments/week-view-draggable';
import { MonthView } from '@/components/appointments/month-view';
import { AppointmentStatsPanel } from '@/components/appointments/appointment-stats';
import { AppointmentFormDrawer } from '@/components/appointments/appointment-form-drawer';
import { AppointmentService } from '@/services/appointment.service';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  useEffect(() => {
    loadAppointments();
    loadStats();
  }, [currentDate, view]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const data = await AppointmentService.getAppointments(startDate, endDate);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
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
    }
  };

  const getDateRange = () => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);

    if (view === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
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
    // You can add a modal or drawer here to show appointment details
    console.log('Selected appointment:', appointment);
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
    loadAppointments();
    loadStats();
  };

  const handleAppointmentDrop = async (appointment: Appointment, newDate: Date, newHour: number) => {
    try {
      // Calculate new start and end times
      const newStartTime = new Date(newDate);
      newStartTime.setHours(newHour, 0, 0, 0);
      
      const duration = appointment.duration;
      const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

      // Update the appointment
      await AppointmentService.updateAppointment(appointment.id, {
        startTime: newStartTime,
        endTime: newEndTime
      });

      // Reload appointments
      loadAppointments();
      loadStats();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to reschedule appointment. Please try again.');
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

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Floating Add Button */}
      <Button
        onClick={handleNewAppointment}
        className="fixed bottom-8 right-8 z-30 h-14 w-14 rounded-full bg-blue-600 p-0 shadow-lg hover:bg-blue-700"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        onToday={handleToday}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main calendar area */}
        <div className="flex-1 overflow-hidden bg-white">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {view === 'week' && (
                <WeekViewDraggable
                  currentDate={currentDate}
                  appointments={appointments}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentDrop={handleAppointmentDrop}
                  onCreateAppointment={handleCreateFromDrag}
                />
              )}
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  appointments={appointments}
                  onAppointmentClick={handleAppointmentClick}
                  onDateClick={handleDateClick}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar with statistics */}
        <div className="w-80 border-l border-gray-200 bg-white p-6">
          <AppointmentStatsPanel stats={stats} loading={loading} />
          
          {/* Additional filters or options can go here */}
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Filters</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>All Doctors</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>All Treatment Categories</span>
              </label>
            </div>
          </div>

              {selectedAppointment && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Selected Appointment</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="font-semibold text-gray-900">{selectedAppointment.patientName}</p>
                <p className="mt-1 text-sm text-gray-600">{selectedAppointment.practitionerName}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(selectedAppointment.startTime).toLocaleString()}
                </p>
                <Button
                  onClick={() => handleEditAppointment(selectedAppointment)}
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                >
                  Edit Appointment
                </Button>
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
      />
    </div>
  );
}
