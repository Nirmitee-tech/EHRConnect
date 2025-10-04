'use client';

import React, { useState } from 'react';
import { AppointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointment';
import { DrawerHeader } from './appointment-form-components/DrawerHeader';
import { AppointmentTypeTabs } from './appointment-form-components/AppointmentTypeTabs';
import { AppointmentFormFields } from './appointment-form-components/AppointmentFormFields';
import { DrawerFooter } from './appointment-form-components/DrawerFooter';
import { useAppointmentForm } from './appointment-form-components/useAppointmentForm';

interface AppointmentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  initialDate?: Date;
  editingAppointment?: Appointment | null;
}

type AppointmentType = 'single' | 'series' | 'group';
type TabType = 'appointment' | 'task' | 'unavailable';

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

  const {
    formData,
    practitioners,
    patients,
    updateField,
    handleDoctorChange,
    handlePatientChange,
    resetForm
  } = useAppointmentForm(initialDate, editingAppointment);

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
    resetForm();
    setIsNewPatient(false);
    setAppointmentType('single');
    setActiveTab('appointment');
    onClose();
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
                isNewPatient={isNewPatient}
                onFormDataChange={updateField}
                onDoctorChange={handleDoctorChange}
                onPatientChange={handlePatientChange}
                onToggleNewPatient={() => setIsNewPatient(!isNewPatient)}
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
      </div>
    </>
  );
}
