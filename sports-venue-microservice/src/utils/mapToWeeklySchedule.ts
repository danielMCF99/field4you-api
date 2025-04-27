import { TimeSlot, WeeklySchedule } from '../domain/entities/SportsVenue';

interface InputSchedule {
  Monday?: { startTime: string; endTime: string }[];
  Tuesday?: { startTime: string; endTime: string }[];
  Wednesday?: { startTime: string; endTime: string }[];
  Thursday?: { startTime: string; endTime: string }[];
  Friday?: { startTime: string; endTime: string }[];
  Saturday?: { startTime: string; endTime: string }[];
  Sunday?: { startTime: string; endTime: string }[];
}

function mapSlots(
  slots?: { startTime: string; endTime: string }[]
): TimeSlot[] {
  if (!slots) return [];
  return slots.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));
}

export function mapToWeeklySchedule(input: InputSchedule): WeeklySchedule {
  return {
    Monday: mapSlots(input.Monday),
    Tuesday: mapSlots(input.Tuesday),
    Wednesday: mapSlots(input.Wednesday),
    Thursday: mapSlots(input.Thursday),
    Friday: mapSlots(input.Friday),
    Saturday: mapSlots(input.Saturday),
    Sunday: mapSlots(input.Sunday),
  };
}
