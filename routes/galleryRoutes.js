const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadGallery');



// Create gallery Image
router.post('/gallery', authMiddleware, upload.single('image'), galleryController.createGalleryImage);

// Get All gallery Images
router.get('/gallery', galleryController.getAllGalleryImages);

// Delete gallery image 
router.delete('/gallery/:galleryId', authMiddleware, galleryController.deleteGalleryImage);

module.exports = router;
