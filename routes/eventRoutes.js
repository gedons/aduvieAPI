const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Event
router.post('/create', authMiddleware, eventController.createEvent);

// Get All Events
router.get('/all', eventController.getAllEvents);

// Update Event
router.put('/:eventId', authMiddleware, eventController.updateEvent);

// Update Event Status
router.put('/status', authMiddleware, eventController.updateEventStatus);

// Delete Event
router.delete('/:eventId', authMiddleware, eventController.deleteEvent);

// Total events
router.get('/total-event', eventController.getTotalEvents);

module.exports = router;
