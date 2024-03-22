const GalleryImage = require('../models/GalleryImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/gallery');  
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 9000000 },  
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Check file type
function checkFileType(file, cb) {  
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// Create Gallery Image
exports.createGalleryImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err.message);
      return res.status(400).json({ msg: err.message });
    } else {
      try {
        const { filename } = req.file;
        const { galleryText } = req.body;
        const imageUrl = `/uploads/gallery/${filename}`; 

        const newGalleryImage = new GalleryImage({
          imageUrl,
          galleryText,
        });

        await newGalleryImage.save();

        res.json({ msg: 'Gallery image added successfully', galleryImage: newGalleryImage });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  });
};

// Get All Slider Images
exports.getAllGalleryImages = async (req, res) => {
  try {
    const galleryImages = await GalleryImage.find();
    res.json(galleryImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete Slider Image
exports.deleteGalleryImage = async (req, res) => {
    const { galleryId } = req.params;
  
    try {
      const galleryImages = await GalleryImage.findByIdAndDelete(galleryId);
  
      if (!galleryImages) {
        return res.status(404).json({ msg: 'Gallery not found' });
      }
  
      // If image exists, delete it before deleting the blog post
      if (galleryImages.imageUrl) {
        const filePath = path.join(__dirname, '..', galleryImages.imageUrl);
        fs.unlinkSync(filePath);
      }
  
      res.json({ msg: 'Gallery deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Update Gallery Image
exports.updateGalleryImage = async (req, res) => {
  const { galleryId } = req.params;
  const imageFile = req.file;

  try {
      let galleryImage = await GalleryImage.findById(galleryId);

      if (!galleryImage) {
          return res.status(404).json({ msg: 'Gallery not found' });
      }

      if (galleryImage.imageUrl) {
          const filePath = path.join(__dirname, '..', galleryImage.imageUrl);
          fs.unlinkSync(filePath);
      }

      galleryImage.imageUrl = `/uploads/gallery/${imageFile.filename}`;
      galleryImage.save();

      res.json({ msg: 'Gallery image updated successfully', galleryImage });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
};



 