const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to handle contact form submission
router.post('/submit', contactController.submitContactForm);

// Admin View Contact Messages Endpoint
router.get('/messages', authMiddleware, contactController.getAllContactMessages);

// Admin Delete Contact Message Endpoint
router.delete('/messages/:messageId', authMiddleware, contactController.deleteContactMessage);

// Admin Send Email to Contact Email Endpoint
router.post('/send-email', authMiddleware, contactController.sendEmailToContact);

// Backend API Route for Admin to Get All Emails
router.get('/emails', authMiddleware, contactController.getAllContactEmails);

// Backend API Route for Admin to Get a Single Message by ID
router.get('/message/:id', authMiddleware, contactController.getContactMessageById);



module.exports = router;
