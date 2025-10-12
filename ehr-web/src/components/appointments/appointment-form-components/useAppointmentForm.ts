import { useState, useEffect } from 'react';
import { medplum } from '@/lib/medplum';
import { Appointment } from '@/types/appointment';

interface FormData {
  centerId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  operatory: string;
  treatmentCategory: string;
  date: string;
  time: string;
  durationHours: number;
  durationMinutes: number;
  notes: string;
  sendEmail: boolean;
  sendSMS: boolean;
  isAllDay?: boolean;
  allDayEventType?: string;
  isEmergency?: boolean;
  location?: string;
}

export function useAppointmentForm(initialDate?: Date, editingAppointment?: Appointment | null) {
  const [formData, setFormData] = useState<FormData>({
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

  const [practitioners, setPractitioners] = useState<Array<{ id: string; name: string; color?: string; vacations?: any[]; officeHours?: any[] }>>([]);
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
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
  }, [editingAppointment, initialDate]);

  const loadPractitioners = async () => {
    try {
      const bundle = await medplum.searchResources('Practitioner', {
        _count: 100
      });
      const practitionerList = bundle.map(p => {
        // Extract color from extension
        const colorExtension = p.extension?.find(
          (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-color'
        );

        // Extract vacation data
        const vacationExtension = p.extension?.find(
          (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-vacation'
        );

        // Extract office hours
        const officeHoursExtension = p.extension?.find(
          (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-office-hours'
        );

        return {
          id: p.id!,
          name: p.name?.[0] ? `${p.name[0].given?.join(' ')} ${p.name[0].family}` : 'Unknown',
          color: colorExtension?.valueString,
          vacations: vacationExtension?.valueString ? JSON.parse(vacationExtension.valueString) : [],
          officeHours: officeHoursExtension?.valueString ? JSON.parse(officeHoursExtension.valueString) : []
        };
      });
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const resetForm = () => {
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
  };

  return {
    formData,
    practitioners,
    patients,
    updateField,
    handleDoctorChange,
    handlePatientChange,
    resetForm
  };
}
