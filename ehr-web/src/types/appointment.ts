export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;
  appointmentType: string;
  status: AppointmentStatus;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  reason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarSlot {
  time: Date;
  appointments: Appointment[];
  isAvailable: boolean;
}

export interface DaySchedule {
  date: Date;
  slots: CalendarSlot[];
}
