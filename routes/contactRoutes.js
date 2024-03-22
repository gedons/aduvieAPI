const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Route to handle contact form submission
router.post('/submit', contactController.submitContactForm);

module.exports = router;
