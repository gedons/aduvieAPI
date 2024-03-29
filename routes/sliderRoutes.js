const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const authMiddleware = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadSlider')

// Create Slider Image
router.post('/slider', authMiddleware, upload.single('image'), sliderController.createSliderImage);

// Get All Slider Images
router.get('/slider', sliderController.getAllSliderImages);

// Delete Slider 
router.delete('/slider/:sliderId', authMiddleware, sliderController.deleteSliderImage);

module.exports = router;
