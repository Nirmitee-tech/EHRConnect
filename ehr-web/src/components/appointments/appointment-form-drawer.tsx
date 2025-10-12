'use client';

import React, { useState, useMemo } from 'react';
import { AppointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointment';
import { DrawerHeader } from './appointment-form-components/DrawerHeader';
import { AppointmentTypeTabs } from './appointment-form-components/AppointmentTypeTabs';
import { AppointmentFormFields } from './appointment-form-components/AppointmentFormFields';
import { DrawerFooter } from './appointment-form-components/DrawerFooter';
import { useAppointmentForm } from './appointment-form-components/useAppointmentForm';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface AppointmentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  initialDate?: Date;
  editingAppointment?: Appointment | null;
  existingAppointments?: Appointment[];
}

type AppointmentType = 'single' | 'series' | 'group';
type TabType = 'appointment' | 'task' | 'unavailable';
type BookingStatus = 'form' | 'confirming' | 'waitlist' | 'success';

const TREATMENT_CATEGORIES = [
  'General Checkup',
  'Dental',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Surgery',
  'Consultation',
  'Follow-up',
  'Emergency'
];

const DEFAULT_LOCATIONS = [
  'Room 1',
  'Room 2',
  'Room 3',
  'Consultation Room A',
  'Consultation Room B',
  'Emergency Room'
];

export function AppointmentFormDrawer({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editingAppointment,
  existingAppointments = []
}: AppointmentFormDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('appointment');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('single');
  const [loading, setLoading] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('form');
  const [locations, setLocations] = useState<string[]>(DEFAULT_LOCATIONS);
  const [conflictingAppointments, setConflictingAppointments] = useState<Appointment[]>([]);

  const {
    formData,
    practitioners,
    patients,
    updateField,
    handleDoctorChange,
    handlePatientChange,
    resetForm
  } = useAppointmentForm(initialDate, editingAppointment);

  // Check for conflicting appointments, leaves, and working hours
  const checkConflicts = (startTime: Date, endTime: Date): Appointment[] => {
    const conflicts: Appointment[] = [];

    // Find selected practitioner
    const selectedPractitioner = practitioners.find(p => p.id === formData.doctorId);

    if (selectedPractitioner) {
      // Check for vacations/leaves
      if (selectedPractitioner.vacations && selectedPractitioner.vacations.length > 0) {
        selectedPractitioner.vacations.forEach((vacation: any) => {
          const vacStart = new Date(vacation.startDate);
          const vacEnd = new Date(vacation.endDate);
          vacEnd.setHours(23, 59, 59, 999); // End of day

          if (startTime <= vacEnd && endTime >= vacStart) {
            conflicts.push({
              id: `vacation-${vacation.id}`,
              patientName: `${selectedPractitioner.name} - ${vacation.type || 'Vacation'}`,
              practitionerId: selectedPractitioner.id,
              practitionerName: selectedPractitioner.name,
              appointmentType: vacation.type || 'vacation',
              status: 'scheduled',
              startTime: vacStart,
              endTime: vacEnd,
              duration: 0,
              isAllDay: true,
              allDayEventType: vacation.type || 'vacation',
              reason: `Practitioner is on ${vacation.type || 'vacation'} during this time`
            } as Appointment);
          }
        });
      }

      // Check working hours
      if (selectedPractitioner.officeHours && selectedPractitioner.officeHours.length > 0) {
        const dayOfWeek = startTime.getDay();
        const daySchedule = selectedPractitioner.officeHours.find((h: any) => h.dayOfWeek === dayOfWeek);

        if (daySchedule && !daySchedule.isWorking) {
          conflicts.push({
            id: `non-working-day-${dayOfWeek}`,
            patientName: `${selectedPractitioner.name} - Not Working`,
            practitionerId: selectedPractitioner.id,
            practitionerName: selectedPractitioner.name,
            appointmentType: 'unavailable',
            status: 'cancelled',
            startTime: startTime,
            endTime: endTime,
            duration: 0,
            reason: `Practitioner is not working on ${startTime.toLocaleDateString('en-US', { weekday: 'long' })}`
          } as Appointment);
        } else if (daySchedule && daySchedule.isWorking) {
          // Check if within working hours
          const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
          const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

          const workStart = new Date(startTime);
          workStart.setHours(startHour, startMin, 0, 0);

          const workEnd = new Date(startTime);
          workEnd.setHours(endHour, endMin, 0, 0);

          if (startTime < workStart || endTime > workEnd) {
            conflicts.push({
              id: `outside-hours-${dayOfWeek}`,
              patientName: `${selectedPractitioner.name} - Outside Working Hours`,
              practitionerId: selectedPractitioner.id,
              practitionerName: selectedPractitioner.name,
              appointmentType: 'unavailable',
              status: 'cancelled',
              startTime: workStart,
              endTime: workEnd,
              duration: 0,
              reason: `Practitioner's working hours are ${daySchedule.startTime} - ${daySchedule.endTime}`
            } as Appointment);
          }
        }
      }
    }

    // Check for overlapping appointments
    const appointmentConflicts = existingAppointments.filter(apt => {
      if (editingAppointment && apt.id === editingAppointment.id) return false;

      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);

      // Check if same practitioner and location
      const samePractitioner = apt.practitionerId === formData.doctorId || apt.practitionerName === formData.doctorName;
      const sameLocation = apt.location === formData.location;

      if (!samePractitioner && !sameLocation) return false;

      // Check time overlap
      return (startTime < aptEnd && endTime > aptStart);
    });

    return [...conflicts, ...appointmentConflicts];
  };

  const handleAddLocation = (location: string) => {
    if (!locations.includes(location)) {
      setLocations([...locations, location]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = formData.isAllDay
      ? new Date(formData.date)
      : new Date(`${formData.date}T${formData.time}`);

    const duration = formData.isAllDay ? 0 : (formData.durationHours * 60) + formData.durationMinutes;
    const endDateTime = formData.isAllDay
      ? new Date(formData.date)
      : new Date(startDateTime.getTime() + duration * 60000);

    // Check for conflicts (skip if emergency)
    let conflicts = checkConflicts(startDateTime, endDateTime);

    // If emergency, filter out leave/vacation/working hour conflicts
    if (formData.isEmergency) {
      conflicts = conflicts.filter(c =>
        !c.id?.startsWith('vacation-') &&
        !c.id?.startsWith('non-working-day-') &&
        !c.id?.startsWith('outside-hours-')
      );
    }

    if (conflicts.length > 0 && bookingStatus === 'form') {
      setConflictingAppointments(conflicts);
      setBookingStatus('confirming');
      return;
    }

    await saveAppointment(startDateTime, endDateTime, duration);
  };

  const saveAppointment = async (startDateTime: Date, endDateTime: Date, duration: number) => {
    setLoading(true);

    try {
      // Fetch practitioner details to get color
      const practitioner = practitioners.find(p => p.id === formData.doctorId);

      const appointmentData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        practitionerId: formData.doctorId,
        practitionerName: formData.doctorName,
        practitionerColor: practitioner?.color, // Add color immediately
        appointmentType: formData.treatmentCategory,
        status: (bookingStatus === 'waitlist' ? 'waitlist' : 'scheduled') as any,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        reason: formData.notes,
        location: formData.location,
        isAllDay: formData.isAllDay,
        allDayEventType: formData.allDayEventType
      };

      let savedAppointment: Appointment;
      if (editingAppointment) {
        savedAppointment = await AppointmentService.updateAppointment(
          editingAppointment.id,
          appointmentData
        );
      } else {
        savedAppointment = await AppointmentService.createAppointment(appointmentData);
      }

      setBookingStatus('success');
      setTimeout(() => {
        onSave(savedAppointment);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment. Please try again.');
      setBookingStatus('form');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWaitlist = () => {
    setBookingStatus('waitlist');
    const startDateTime = new Date(`${formData.date}T${formData.time}`);
    const duration = (formData.durationHours * 60) + formData.durationMinutes;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    saveAppointment(startDateTime, endDateTime, duration);
  };

  const handleConfirmBooking = () => {
    const startDateTime = new Date(`${formData.date}T${formData.time}`);
    const duration = (formData.durationHours * 60) + formData.durationMinutes;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    saveAppointment(startDateTime, endDateTime, duration);
  };

  const handleClose = () => {
    resetForm();
    setIsNewPatient(false);
    setAppointmentType('single');
    setActiveTab('appointment');
    setBookingStatus('form');
    setConflictingAppointments([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={bookingStatus === 'form' ? handleClose : undefined}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl">
        {bookingStatus === 'form' ? (
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <DrawerHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={handleClose}
            />

            {activeTab === 'appointment' && (
              <AppointmentTypeTabs
                appointmentType={appointmentType}
                onTypeChange={setAppointmentType}
              />
            )}

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {activeTab === 'appointment' && (
                <AppointmentFormFields
                  formData={formData}
                  practitioners={practitioners}
                  patients={patients}
                  treatmentCategories={TREATMENT_CATEGORIES}
                  locations={locations}
                  isNewPatient={isNewPatient}
                  onFormDataChange={updateField}
                  onDoctorChange={handleDoctorChange}
                  onPatientChange={handlePatientChange}
                  onToggleNewPatient={() => setIsNewPatient(!isNewPatient)}
                  onAddLocation={handleAddLocation}
                />
              )}

              {activeTab === 'task' && (
                <div className="text-center text-gray-500">
                  Task management coming soon...
                </div>
              )}

              {activeTab === 'unavailable' && (
                <div className="text-center text-gray-500">
                  Doctor/Staff availability management coming soon...
                </div>
              )}
            </div>

            <DrawerFooter loading={loading} onCancel={handleClose} />
          </form>
        ) : bookingStatus === 'confirming' ? (
          /* Confirmation Screen */
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Appointment</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900">Potential Conflicts Detected</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    This appointment may conflict with {conflictingAppointments.length} existing appointment(s).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Conflicting Appointments:</h4>
                {conflictingAppointments.map((apt) => (
                  <div key={apt.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{apt.patientName}</p>
                        <p className="text-sm text-gray-600">with {apt.practitionerName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(apt.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          {' - '}
                          {new Date(apt.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                        {apt.location && (
                          <p className="text-sm text-gray-500">Location: {apt.location}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-gray-200 p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">What would you like to do?</h4>
                <p className="text-sm text-gray-600">
                  You can proceed with booking anyway (which may require rescheduling conflicting appointments),
                  or add this appointment to the waitlist.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setBookingStatus('form')}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleAddToWaitlist}
                disabled={loading}
                className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Add to Waitlist
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Anyway'}
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="flex h-full flex-col items-center justify-center px-6 py-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {bookingStatus === 'waitlist' ? 'Added to Waitlist' : 'Appointment Booked'}
              </h2>
              <p className="text-gray-600">
                {bookingStatus === 'waitlist'
                  ? 'The appointment has been added to the waitlist. You will be notified when a slot becomes available.'
                  : 'The appointment has been successfully scheduled.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
