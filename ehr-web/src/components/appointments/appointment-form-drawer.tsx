'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointment';
import { medplum } from '@/lib/medplum';

interface AppointmentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  initialDate?: Date;
  editingAppointment?: Appointment | null;
}

type AppointmentType = 'single' | 'series' | 'group';
type TabType = 'appointment' | 'task' | 'unavailable';

export function AppointmentFormDrawer({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editingAppointment
}: AppointmentFormDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('appointment');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('single');
  const [loading, setLoading] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    centerId: '',
    doctorId: '',
    doctorName: '',
    patientId: '',
    patientName: '',
    operatory: '',
    treatmentCategory: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : '',
    time: '09:00',
    durationHours: 0,
    durationMinutes: 30,
    notes: '',
    sendEmail: false,
    sendSMS: false
  });

  // Dropdown options
  const [practitioners, setPractitioners] = useState<Array<{ id: string; name: string }>>([]);
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [treatmentCategories] = useState([
    'General Checkup',
    'Dental',
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
    'Surgery',
    'Consultation',
    'Follow-up',
    'Emergency'
  ]);

  useEffect(() => {
    if (isOpen) {
      loadPractitioners();
      loadPatients();
      if (editingAppointment) {
        populateEditForm(editingAppointment);
      } else if (initialDate) {
        setFormData(prev => ({
          ...prev,
          date: initialDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [isOpen, editingAppointment, initialDate]);

  const loadPractitioners = async () => {
    try {
      const bundle = await medplum.searchResources('Practitioner', {
        _count: 100
      });
      const practitionerList = bundle.map(p => ({
        id: p.id!,
        name: p.name?.[0] ? `${p.name[0].given?.join(' ')} ${p.name[0].family}` : 'Unknown'
      }));
      setPractitioners(practitionerList);
    } catch (error) {
      console.error('Error loading practitioners:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const bundle = await medplum.searchResources('Patient', {
        _count: 100,
        _sort: '-_lastUpdated'
      });
      const patientList = bundle.map(p => ({
        id: p.id!,
        name: p.name?.[0] ? `${p.name[0].given?.join(' ')} ${p.name[0].family}` : 'Unknown'
      }));
      setPatients(patientList);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const populateEditForm = (appointment: Appointment) => {
    const startDate = new Date(appointment.startTime);
    setFormData({
      centerId: '',
      doctorId: appointment.practitionerId,
      doctorName: appointment.practitionerName,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      operatory: '',
      treatmentCategory: appointment.appointmentType,
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().substring(0, 5),
      durationHours: Math.floor(appointment.duration / 60),
      durationMinutes: appointment.duration % 60,
      notes: appointment.reason || '',
      sendEmail: false,
      sendSMS: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const duration = (formData.durationHours * 60) + formData.durationMinutes;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const appointmentData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        practitionerId: formData.doctorId,
        practitionerName: formData.doctorName,
        appointmentType: formData.treatmentCategory,
        status: 'scheduled' as const,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        reason: formData.notes
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

      onSave(savedAppointment);
      handleClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      centerId: '',
      doctorId: '',
      doctorName: '',
      patientId: '',
      patientName: '',
      operatory: '',
      treatmentCategory: '',
      date: '',
      time: '09:00',
      durationHours: 0,
      durationMinutes: 30,
      notes: '',
      sendEmail: false,
      sendSMS: false
    });
    setIsNewPatient(false);
    setAppointmentType('single');
    setActiveTab('appointment');
    onClose();
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value;
    const doctor = practitioners.find(p => p.id === doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId,
      doctorName: doctor?.name || ''
    }));
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName: patient?.name || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('appointment')}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === 'appointment'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Appointment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('task')}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === 'task'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unavailable')}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === 'unavailable'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Doctor/Staff Unavailable
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Appointment Type Tabs */}
          {activeTab === 'appointment' && (
            <div className="flex gap-2 border-b border-gray-200 px-6 py-3">
              <button
                type="button"
                onClick={() => setAppointmentType('single')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  appointmentType === 'single'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Single Appointment
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType('series')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  appointmentType === 'series'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Appointment Series
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType('group')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  appointmentType === 'group'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Group Appointment
              </button>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {activeTab === 'appointment' && (
              <div className="space-y-4">
                {/* Center/Facility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Center<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.centerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, centerId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Center</option>
                    <option value="center1">Main Center</option>
                    <option value="center2">Branch Center</option>
                  </select>
                </div>

                {/* Doctor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Doctor<span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={handleDoctorChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Doctor</option>
                    {practitioners.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">New Patient</span>
                      <button
                        type="button"
                        onClick={() => setIsNewPatient(!isNewPatient)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isNewPatient ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isNewPatient ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {!isNewPatient ? (
                    <select
                      required
                      value={formData.patientId}
                      onChange={handlePatientChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter new patient name"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Operatory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operatory</label>
                  <select
                    value={formData.operatory}
                    onChange={(e) => setFormData(prev => ({ ...prev, operatory: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Operatory</option>
                    <option value="op1">Room 1</option>
                    <option value="op2">Room 2</option>
                    <option value="op3">Room 3</option>
                  </select>
                </div>

                {/* Treatment Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Treatment Category
                  </label>
                  <select
                    value={formData.treatmentCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatmentCategory: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Not Specified</option>
                    {treatmentCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date<span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time<span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={formData.durationHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationHours: parseInt(e.target.value) || 0 }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                      <span className="mt-1 text-xs text-gray-500">Hour(s)</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="30"
                      />
                      <span className="mt-1 text-xs text-gray-500">Minute(s)</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  />
                </div>

                {/* Email & SMS */}
                <details className="rounded-lg border border-gray-200">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700">
                    Email & SMS/WA
                  </summary>
                  <div className="space-y-3 px-4 pb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.sendEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Send Email Notification</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.sendSMS}
                        onChange={(e) => setFormData(prev => ({ ...prev, sendSMS: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Send SMS/WhatsApp Notification</span>
                    </label>
                  </div>
                </details>
              </div>
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'SAVING...' : 'SAVE'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
