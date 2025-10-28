import { Router } from 'express';
import { getBookings, createBooking, updateBookingStatus, getTimeSlots, lookupBookingsByPhone } from '../controllers/booking.controller';
import { authGuard, adminGuard } from '../middleware/auth';
import { validateBody, bookingSchema, updateBookingStatusSchema } from '../utils/validate';

const router = Router();

router.get('/bookings', authGuard, getBookings);
router.post('/bookings', validateBody(bookingSchema), createBooking);
router.put('/bookings/:id/status', authGuard, adminGuard, validateBody(updateBookingStatusSchema), updateBookingStatus);
router.get('/booking/slots', getTimeSlots);
// Public lookup by phone
router.get('/bookings/lookup', lookupBookingsByPhone);

export default router;
