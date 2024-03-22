const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Book Event
router.post('/book', bookingController.bookEvent);

//view user booking (admin)
router.get('/all', authMiddleware, bookingController.getAllBookings);

// Update Booking Status (admin)
router.put('/:bookingId/status', authMiddleware, bookingController.updateBookingStatus);

// Delete Booking(admin)
router.delete('/:bookingId/delete', authMiddleware, bookingController.deleteBooking);

// Total booking
router.get('/total-booking', bookingController.getTotalBookings);

module.exports = router;
