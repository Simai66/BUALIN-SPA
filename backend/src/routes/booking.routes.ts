import { Router } from 'express';
import { getBookings, createBooking, updateBookingStatus, getTimeSlots } from '../controllers/booking.controller';
import { authGuard, adminGuard } from '../middleware/auth';
import { validateBody, bookingSchema, updateBookingStatusSchema } from '../utils/validate';

const router = Router();

router.get('/bookings', authGuard, getBookings);
router.post('/bookings', authGuard, validateBody(bookingSchema), createBooking);
router.put('/bookings/:id/status', authGuard, adminGuard, validateBody(updateBookingStatusSchema), updateBookingStatus);
router.get('/booking/slots', getTimeSlots);

export default router;
