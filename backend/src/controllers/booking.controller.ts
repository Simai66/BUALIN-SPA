import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { calculateBookingPrice } from '../utils/price';
import { isTherapistAvailable, generateTimeSlots, formatThaiDateTime } from '../utils/time';
import { sendBookingEmail } from '../config/mail';

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { start, end, status, service_id, therapist_id } = req.query;
    const isAdmin = req.user?.role === 'admin';

    let query = db('bookings')
      .select(
        'bookings.*',
        'services.name as service_name',
        'therapists.name as therapist_name'
      )
      .join('services', 'bookings.service_id', 'services.id')
      .join('therapists', 'bookings.therapist_id', 'therapists.id');

    if (start) {
      query = query.where('booking_datetime', '>=', start);
    }
    if (end) {
      query = query.where('booking_datetime', '<=', end);
    }
    if (status) {
      query = query.where('bookings.status', status);
    }
    if (service_id) {
      query = query.where('service_id', service_id);
    }
    if (therapist_id) {
      query = query.where('therapist_id', therapist_id);
    }

    // Non-admin can only see their own bookings
    if (!isAdmin) {
      const user = await db('users').where('id', req.user?.id).first();
      if (user) {
        query = query.where('customer_phone', user.phone);
      }
    }

    const bookings = await query.orderBy('booking_datetime', 'desc');

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { service_id, therapist_id, booking_datetime, promotion_id } = req.body;

    // Get user info
    const user = await db('users').where('id', req.user?.id).first();
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    // Validate service
    const service = await db('services').where('id', service_id).first();
    if (!service || !service.is_active) {
      return res.status(400).json({ message: 'บริการไม่พร้อมใช้งาน' });
    }

    // Validate therapist
    const therapist = await db('therapists').where('id', therapist_id).first();
    if (!therapist || !therapist.is_active) {
      return res.status(400).json({ message: 'พนักงานไม่พร้อมให้บริการ' });
    }

    const bookingDate = new Date(booking_datetime);
    const endTime = new Date(bookingDate.getTime() + service.duration_minutes * 60000);

    // Check availability
    const available = await isTherapistAvailable(therapist_id, bookingDate, endTime);
    if (!available) {
      return res.status(400).json({ message: 'ช่วงเวลานี้ไม่ว่าง กรุณาเลือกเวลาอื่น' });
    }

    // Calculate price
    const { price, promotion } = await calculateBookingPrice(
      service_id,
      bookingDate,
      promotion_id
    );

    // Create booking
    const [bookingId] = await db('bookings').insert({
      customer_name: user.full_name,
      customer_phone: user.phone,
      service_id,
      therapist_id,
      booking_datetime: bookingDate,
      status: 'pending',
      price_at_booking: price,
      promotion_id: promotion?.id || null,
    });

    // Send email notification
    try {
      await sendBookingEmail('new', {
        customerName: user.full_name,
        customerEmail: user.email,
        serviceName: service.name,
        therapistName: therapist.name,
        bookingDatetime: formatThaiDateTime(bookingDate),
        price,
        status: 'pending',
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    res.status(201).json({
      message: 'จองสำเร็จ',
      bookingId,
      price,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการจอง' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await db('bookings').where('id', id).first();
    if (!booking) {
      return res.status(404).json({ message: 'ไม่พบการจอง' });
    }

    await db('bookings').where('id', id).update({ status });

    // Get full booking details for email
    const fullBooking = await db('bookings')
      .select(
        'bookings.*',
        'services.name as service_name',
        'therapists.name as therapist_name',
        'users.email as customer_email'
      )
      .join('services', 'bookings.service_id', 'services.id')
      .join('therapists', 'bookings.therapist_id', 'therapists.id')
      .leftJoin('users', 'bookings.customer_phone', 'users.phone')
      .where('bookings.id', id)
      .first();

    if (fullBooking && fullBooking.customer_email) {
      try {
        const emailType = status === 'confirmed' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : null;
        if (emailType) {
          await sendBookingEmail(emailType, {
            customerName: fullBooking.customer_name,
            customerEmail: fullBooking.customer_email,
            serviceName: fullBooking.service_name,
            therapistName: fullBooking.therapist_name,
            bookingDatetime: formatThaiDateTime(new Date(fullBooking.booking_datetime)),
            price: parseFloat(fullBooking.price_at_booking),
            status,
          });
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    res.json({ message: 'อัปเดตสถานะสำเร็จ' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const getTimeSlots = async (req: Request, res: Response) => {
  try {
    const { service_id, therapist_id, date } = req.query;

    if (!service_id || !therapist_id || !date) {
      return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    const slots = await generateTimeSlots(
      Number(service_id),
      Number(therapist_id),
      String(date),
      30 // 30 minute steps
    );

    res.json({ slots });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};
