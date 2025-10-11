import { Appointment } from '@/types/appointment';

// Get dates for the current week (October 11-17, 2020 style)
const getWeekDate = (dayOffset: number) => {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayOffset);
  return targetDate;
};

const createAppointment = (
  id: string,
  name: string,
  dayOffset: number,
  startHour: number,
  duration: number,
  category: 'bryntum' | 'hotel' | 'michael',
  color: string,
  isAllDay: boolean = false
): Appointment => {
  const date = getWeekDate(dayOffset);
  const startTime = new Date(date);
  startTime.setHours(isAllDay ? 0 : startHour, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(isAllDay ? 23 : startHour + duration, isAllDay ? 59 : 0, isAllDay ? 59 : 0, 0);

  return {
    id,
    patientName: name,
    practitionerName: category === 'bryntum' ? 'Bryntum Team' : category === 'hotel' ? 'Hotel Park' : 'Michael Johnson',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'scheduled',
    type: 'consultation',
    duration: duration * 60,
    notes: '',
    category,
    color,
    isAllDay
  };
};

export const sampleAppointments: Appointment[] = [
  // Sunday (Oct 11) - All day event
  createAppointment('hackathon', 'Hackathon 2020', 0, 0, 0, 'bryntum', 'bg-green-500', true),

  // Monday (Oct 12)
  createAppointment('relax', 'Relax and...', 1, 7, 1, 'michael', 'bg-red-400'),

  // Monday (Oct 12)
  createAppointment('breakfast-mon', 'Breakfast', 1, 9, 1, 'michael', 'bg-orange-400'),
  createAppointment('team-scrum', 'Team Scrum', 1, 10, 2, 'bryntum', 'bg-blue-500'),
  createAppointment('scheduler-grid', 'Scheduler Grid introduc...', 1, 12, 1, 'bryntum', 'bg-blue-500'),
  createAppointment('lunch-mon', 'Lunch', 1, 14, 1, 'michael', 'bg-orange-400'),
  createAppointment('active-client', 'Active client project review', 1, 15, 2, 'bryntum', 'bg-blue-500'),
  createAppointment('dinner-mon', 'Dinner', 1, 19, 1, 'michael', 'bg-orange-400'),

  // Tuesday (Oct 13)
  createAppointment('breakfast-tue', 'Breakfast', 2, 9, 1, 'michael', 'bg-orange-400'),
  createAppointment('roadmap', 'Roadmap for 2020', 2, 10, 2, 'bryntum', 'bg-blue-500'),
  createAppointment('review-tickets', 'Review Assembla tickets and...', 2, 12, 1, 'bryntum', 'bg-blue-500'),
  createAppointment('lunch-tue', 'Lunch', 2, 14, 1, 'michael', 'bg-orange-400'),
  createAppointment('active-program', 'Active program...', 2, 15, 2, 'bryntum', 'bg-blue-500'),
  createAppointment('dinner-tue', 'Dinner', 2, 19, 1, 'michael', 'bg-orange-400'),

  // Wednesday (Oct 14)
  createAppointment('breakfast-wed', 'Breakfast', 3, 9, 1, 'michael', 'bg-orange-400'),
  createAppointment('excursion', 'Excursion', 3, 10, 2, 'hotel', 'bg-orange-300'),
  createAppointment('lunch-wed', 'Lunch', 3, 14, 1, 'michael', 'bg-orange-400'),
  createAppointment('team-building', 'Team Building', 3, 18, 1, 'bryntum', 'bg-green-500'),
  createAppointment('dinner-wed', 'Dinner', 3, 19, 1, 'michael', 'bg-orange-400'),

  // Thursday (Oct 15)
  createAppointment('gantt-review', 'Gantt re...', 4, 7, 1, 'bryntum', 'bg-blue-400'),
  createAppointment('breakfast-thu', 'Breakfast', 4, 9, 1, 'michael', 'bg-orange-400'),
  createAppointment('lunch-thu', 'Lunch', 4, 14, 1, 'michael', 'bg-orange-400'),
  createAppointment('dinner-thu', 'Dinner', 4, 19, 1, 'michael', 'bg-orange-400'),

  // Friday (Oct 16)
  createAppointment('root-cause', 'Root Ca...', 5, 7, 1, 'bryntum', 'bg-red-500'),
  createAppointment('breakfast-fri', 'Breakfast', 5, 9, 1, 'michael', 'bg-orange-400'),
  createAppointment('lunch-fri', 'Lunch', 5, 14, 1, 'michael', 'bg-orange-400'),
  createAppointment('splitjs-conf', 'Split.JS confere... Monitori... and Reprodu...', 5, 18, 2, 'bryntum', 'bg-orange-500'),
  createAppointment('dinner-fri', 'Dinner', 5, 19, 1, 'michael', 'bg-orange-400'),

  // Saturday (Oct 17)
  createAppointment('pair-prog', 'Pair prog...', 6, 7, 1, 'bryntum', 'bg-purple-500'),
  createAppointment('breakfast-sat', 'Breakfast', 6, 9, 1, 'michael', 'bg-orange-400'),
  createAppointment('lunch-sat', 'Lunch', 6, 14, 1, 'michael', 'bg-orange-400'),
  createAppointment('dinner-sat', 'Dinner', 6, 19, 1, 'michael', 'bg-orange-400'),
];

export const eventCategories = [
  { id: 'bryntum', label: 'Bryntum team', color: 'bg-blue-500', checked: true },
  { id: 'hotel', label: 'Hotel Park', color: 'bg-orange-400', checked: true },
  { id: 'michael', label: 'Michael Johnson', color: 'bg-red-500', checked: true }
];
