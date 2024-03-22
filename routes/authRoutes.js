const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin login
router.post('/login', authController.adminLogin);

// Update Admin Password
router.put('/update-password', authMiddleware, authController.updatePassword);


// Create Sub-Admin
router.post('/sub-admin', authMiddleware, authController.createSubAdmin);

// Total admin
router.get('/total-admin', authController.getTotalAdmins);

module.exports = router;
