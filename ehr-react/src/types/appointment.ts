export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled' | 'waitlist';

// Types of all-day events
export type AllDayEventType = 'appointment' | 'leave' | 'vacation' | 'holiday' | 'conference' | 'training' | 'other';

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  practitionerId?: string;
  practitionerName: string;
  practitionerColor?: string; // Practitioner's color from staff settings
  appointmentType?: string;
  type?: string;
  status: AppointmentStatus;
  startTime: Date | string;
  endTime: Date | string;
  duration: number; // in minutes
  reason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  category?: string;
  color?: string;
  isAllDay?: boolean;
  allDayEventType?: AllDayEventType; // Type of all-day event
  location?: string; // Location/room where appointment takes place
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export type CalendarView = 'day' | 'week' | 'month' | 'dashboard';

export interface CalendarSlot {
  time: Date;
  appointments: Appointment[];
  isAvailable: boolean;
}

export interface DaySchedule {
  date: Date;
  slots: CalendarSlot[];
}
