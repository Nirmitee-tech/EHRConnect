'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Printer, Video, Plus } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface AppointmentListViewProps {
  appointments: Appointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onCreateAppointment?: () => void;
  onPrintList?: () => void;
  onInstantMeeting?: () => void;
  practitioners?: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string }>;
}

export function AppointmentListView({
  appointments,
  currentDate,
  onDateChange,
  onAppointmentClick,
  onCreateAppointment,
  onPrintList,
  onInstantMeeting,
  practitioners = [],
  locations = []
}: AppointmentListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(currentDate);

  // Calendar navigation
  const handlePreviousMonth = () => {
    const newDate = new Date(selectedCalendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedCalendarDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedCalendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedCalendarDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedCalendarDate(date);
    onDateChange(date);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = selectedCalendarDate.getFullYear();
    const month = selectedCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [selectedCalendarDate]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Date filter
      const aptDate = new Date(apt.startTime);
      if (aptDate.toDateString() !== currentDate.toDateString()) {
        return false;
      }

      // Search filter
      if (searchTerm && !apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Provider filter
      if (selectedProviders.length > 0 && !selectedProviders.includes(apt.practitionerName)) {
        return false;
      }

      // Location filter
      if (selectedLocations.length > 0 && apt.location && !selectedLocations.includes(apt.location)) {
        return false;
      }

      return true;
    });
  }, [appointments, currentDate, searchTerm, selectedProviders, selectedLocations]);

  // Group appointments by location
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: Appointment[] } = {};

    filteredAppointments.forEach(apt => {
      const location = apt.location || 'Virtual';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(apt);
    });

    // Sort appointments within each group by time
    Object.keys(groups).forEach(location => {
      groups[location].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return groups;
  }, [filteredAppointments]);

  const handleProviderToggle = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDuration = (minutes: number) => {
    return `(${minutes} Mins)`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full bg-white">
      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-3 space-y-3">
          {/* Mini Calendar */}
          <div className="bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200">
              <button
                onClick={handlePreviousMonth}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <h3 className="text-xs font-semibold text-gray-900">
                {selectedCalendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-2">
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-[9px] text-gray-500 text-center font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => date && handleDateClick(date)}
                    disabled={!date}
                    className={cn(
                      'aspect-square text-[10px] rounded flex items-center justify-center',
                      !date && 'invisible',
                      date && date.toDateString() === currentDate.toDateString()
                        ? 'bg-gray-900 text-white font-semibold'
                        : date && date.toDateString() === new Date().toDateString()
                        ? 'bg-gray-200 text-gray-900 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search By Name */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Search By Name</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-400"
              />
              <Search className="absolute right-2 top-2 h-3 w-3 text-gray-400" />
            </div>
          </div>

          {/* Providers Filter */}
          <div className="border border-gray-200 rounded p-2">
            <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Providers</h3>
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={selectedProviders.length === 0}
                  onChange={() => setSelectedProviders([])}
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span className="text-gray-700">All</span>
              </label>
              {practitioners.map(provider => (
                <label key={provider.id} className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider.name)}
                    onChange={() => handleProviderToggle(provider.name)}
                    className="w-3 h-3 rounded border-gray-300"
                  />
                  <span className="text-gray-700">{provider.name}</span>
                </label>
              ))}
              {selectedProviders.length > 0 && (
                <button
                  onClick={() => setSelectedProviders([])}
                  className="text-[10px] text-blue-600 hover:underline mt-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Locations Filter */}
          <div className="border border-gray-200 rounded p-2">
            <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Locations</h3>
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={selectedLocations.length === 0}
                  onChange={() => setSelectedLocations([])}
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span className="text-gray-700">All</span>
              </label>
              {locations.map(location => (
                <label key={location.id} className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location.name)}
                    onChange={() => handleLocationToggle(location.name)}
                    className="w-3 h-3 rounded border-gray-300"
                  />
                  <span className="text-gray-700">{location.name}</span>
                </label>
              ))}
              {selectedLocations.length > 0 && (
                <button
                  onClick={() => setSelectedLocations([])}
                  className="text-[10px] text-blue-600 hover:underline mt-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - APPOINTMENTS LIST */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {/* Action Buttons */}
        <div className="bg-white border-b border-gray-200 px-4 py-2.5">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onPrintList}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
            >
              <Printer className="h-3.5 w-3.5" />
              Print List
            </button>
            <button
              onClick={onInstantMeeting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
            >
              <Video className="h-3.5 w-3.5" />
              Instant Meeting
            </button>
            <button
              onClick={onCreateAppointment}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Appointment
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Middle - Appointments List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {Object.keys(groupedAppointments).length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                No appointments found for the selected date and filters
              </div>
            ) : (
              Object.entries(groupedAppointments).map(([location, apts]) => (
                <div key={location} className="bg-white rounded border border-gray-200">
                  {/* Location Header */}
                  <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900">
                      {location} ({currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </h3>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-600 uppercase">
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">Patient Name</div>
                    <div className="col-span-2">Date of Birth</div>
                    <div className="col-span-3">Contact Details</div>
                    <div className="col-span-1">Insurance</div>
                    <div className="col-span-1">Provider Name</div>
                    <div className="col-span-1">Chief Complaint</div>
                  </div>

                  {/* Appointments */}
                  <div className="divide-y divide-gray-200">
                    {apts.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className="grid grid-cols-12 gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        {/* Time */}
                        <div className="col-span-2">
                          <div className="text-xs text-gray-900 font-medium">
                            {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {formatDuration(apt.duration)}
                          </div>
                        </div>

                        {/* Patient Name */}
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-gray-600">
                              {getInitials(apt.patientName)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {apt.patientName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              #{apt.patientId || 'P1231'}
                            </div>
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="col-span-2">
                          <div className="text-xs text-gray-700">
                            {apt.patientAge || '02-29-1959 (74)'}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            Female
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="col-span-3 text-[10px] text-gray-600 space-y-0.5">
                          <div>71 Racine Road, VT 05468</div>
                          <div>609-707-9755</div>
                          <div className="text-blue-600">katiebell@gmail.com</div>
                        </div>

                        {/* Insurance */}
                        <div className="col-span-1">
                          <div className="text-[10px] text-gray-700">
                            Aetna Medicare
                          </div>
                        </div>

                        {/* Provider Name */}
                        <div className="col-span-1">
                          <div className="text-[10px] text-gray-700">
                            {apt.practitionerName}
                          </div>
                        </div>

                        {/* Chief Complaint */}
                        <div className="col-span-1">
                          <div className="text-[10px] text-gray-700">
                            {apt.reason || apt.type || 'Infection'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-64 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3">
            {/* Stats */}
            <div className="border border-gray-200 rounded p-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Today's Summary</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-600">Total</span>
                  <span className="text-xs font-semibold text-gray-900">{filteredAppointments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-600">Scheduled</span>
                  <span className="text-xs font-semibold text-blue-600">{filteredAppointments.filter(a => a.status === 'scheduled').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-600">In Progress</span>
                  <span className="text-xs font-semibold text-green-600">{filteredAppointments.filter(a => a.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-600">Completed</span>
                  <span className="text-xs font-semibold text-gray-600">{filteredAppointments.filter(a => a.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-600">Cancelled</span>
                  <span className="text-xs font-semibold text-red-600">{filteredAppointments.filter(a => a.status === 'cancelled').length}</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="border border-gray-200 rounded p-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Info</h3>
              <div className="text-[10px] text-gray-600 space-y-1">
                <div>Selected Date:</div>
                <div className="font-medium text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
