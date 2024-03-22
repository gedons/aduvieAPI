const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  galleryText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
