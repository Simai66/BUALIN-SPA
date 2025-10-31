import { db } from '../config/db';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Helper to support both integer (epoch ms) and ISO string timestamps in SQLite
const addWhereBetweenDate = (
  qb: any,
  column: string,
  start: Date,
  end: Date
) => {
  qb.whereBetween(column, [start.getTime(), end.getTime()])
    .orWhereBetween(column, [start.toISOString(), end.toISOString()]);
};

const addWhereDateCompare = (
  qb: any,
  column: string,
  op: string,
  value: Date
) => {
  qb.where(column, op, value.getTime()).orWhere(column, op, value.toISOString());
};

/**
 * ตรวจสอบว่าช่วงเวลาทับซ้อนกันหรือไม่
 */
export const isOverlapping = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

/**
 * ตรวจสอบว่าพนักงานว่างในช่วงเวลาที่กำหนด
 */
export const isTherapistAvailable = async (
  therapistId: number,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: number
): Promise<boolean> => {
  // Check if within schedule
  const schedule = await db('schedules')
    .where('therapist_id', therapistId)
    .where((qb) => {
      addWhereDateCompare(qb, 'start_datetime', '<=', startTime);
    })
    .where((qb) => {
      addWhereDateCompare(qb, 'end_datetime', '>=', endTime);
    })
    .first();

  if (!schedule) {
    return false; // Not in schedule
  }

  // Check overlapping bookings (except cancelled)
  let query = db('bookings')
    .where('therapist_id', therapistId)
    .whereNot('status', 'cancelled')
    .where((qb) => {
      addWhereDateCompare(qb, 'booking_datetime', '<', endTime);
    });

  if (excludeBookingId) {
    query = query.whereNot('id', excludeBookingId);
  }

  const overlappingBookings = await query;

  for (const booking of overlappingBookings) {
    const bookingStart = new Date(booking.booking_datetime);
    
    // Get service duration
    const service = await db('services')
      .where('id', booking.service_id)
      .first();
    
    if (!service) continue;

    const bookingEnd = new Date(
      bookingStart.getTime() + service.duration_minutes * 60000
    );

    if (isOverlapping(startTime, endTime, bookingStart, bookingEnd)) {
      return false;
    }
  }

  return true;
};

/**
 * สร้าง time slots สำหรับวันที่กำหนด
 */
export const generateTimeSlots = async (
  serviceId: number,
  therapistId: number,
  date: string, // YYYY-MM-DD
  stepMinutes: number = 30
): Promise<TimeSlot[]> => {
  const service = await db('services').where('id', serviceId).first();
  if (!service) {
    return [];
  }

  const durationMinutes = service.duration_minutes;

  // Get therapist schedule for this date
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const schedules = await db('schedules')
    .where('therapist_id', therapistId)
    .where((qb) => {
      addWhereBetweenDate(qb, 'start_datetime', startOfDay, endOfDay);
    });

  if (schedules.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const schedule of schedules) {
    const scheduleStart = new Date(schedule.start_datetime);
    const scheduleEnd = new Date(schedule.end_datetime);

    let currentTime = new Date(scheduleStart);

    while (currentTime.getTime() + durationMinutes * 60000 <= scheduleEnd.getTime()) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

      // Skip past slots
      if (slotStart <= now) {
        currentTime = new Date(currentTime.getTime() + stepMinutes * 60000);
        continue;
      }

      // Check availability
      const available = await isTherapistAvailable(
        therapistId,
        slotStart,
        slotEnd
      );

      slots.push({
        start: slotStart,
        end: slotEnd,
        available,
      });

      currentTime = new Date(currentTime.getTime() + stepMinutes * 60000);
    }
  }

  return slots;
};

/**
 * Format date to Thai locale string
 */
export const formatThaiDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(date);
};
