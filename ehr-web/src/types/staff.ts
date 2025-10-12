export interface OfficeHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isWorking: boolean;
}

export interface VacationSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  type: 'vacation' | 'sick' | 'personal' | 'conference' | 'other';
}

export interface StaffMember {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  qualification: string;
  active: boolean;
  resourceType: string;
  // Extended fields for comprehensive management
  color?: string; // Custom color for calendar
  officeHours?: OfficeHours[];
  vacationSchedules?: VacationSchedule[];
  appointmentTypes?: string[]; // Types of appointments this provider handles
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'per-diem';
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // in minutes
  color: string;
  description?: string;
  category: 'consultation' | 'follow-up' | 'emergency' | 'routine' | 'surgery' | 'online' | 'custom';
  allowedProviders?: string[]; // Provider IDs who can perform this type
  requiresPreparation?: boolean;
  preparationInstructions?: string;
}

export const DEFAULT_OFFICE_HOURS: OfficeHours[] = [
  { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorking: false }, // Sunday
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true },  // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isWorking: true },  // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isWorking: true },  // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isWorking: true },  // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isWorking: true },  // Friday
  { dayOfWeek: 6, startTime: '00:00', endTime: '00:00', isWorking: false }, // Saturday
];

export const DEFAULT_APPOINTMENT_TYPES: AppointmentType[] = [
  {
    id: '1',
    name: 'General Consultation',
    duration: 30,
    color: '#3B82F6',
    category: 'consultation',
    description: 'Standard consultation appointment'
  },
  {
    id: '2',
    name: 'Follow-up Visit',
    duration: 15,
    color: '#10B981',
    category: 'follow-up',
    description: 'Follow-up after initial consultation or treatment'
  },
  {
    id: '3',
    name: 'Emergency',
    duration: 20,
    color: '#EF4444',
    category: 'emergency',
    description: 'Emergency or urgent care appointment'
  },
  {
    id: '4',
    name: 'Routine Check-up',
    duration: 45,
    color: '#8B5CF6',
    category: 'routine',
    description: 'Annual or routine health check-up'
  },
  {
    id: '5',
    name: 'Online Consultation',
    duration: 20,
    color: '#F59E0B',
    category: 'online',
    description: 'Virtual consultation via video call'
  },
];

export const PROVIDER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];
