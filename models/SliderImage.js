const mongoose = require('mongoose');

const sliderImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  HeaderText: { type: String, required: true },
  BodyText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SliderImage', sliderImageSchema);
