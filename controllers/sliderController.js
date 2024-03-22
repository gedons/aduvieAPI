const SliderImage = require('../models/SliderImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/slider');  
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

// Create Slider Image
exports.createSliderImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err.message);
      return res.status(400).json({ msg: err.message });
    } else {
      try {
        const { filename } = req.file;
        const { HeaderText } = req.body;
        const { BodyText } = req.body;
        const imageUrl = `/uploads/slider/${filename}`; 

        const newSliderImage = new SliderImage({
          imageUrl,
          HeaderText,
          BodyText
        });

        await newSliderImage.save();

        res.json({ msg: 'Slider image added successfully', sliderImage: newSliderImage });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  });
};

// Get All Slider Images
exports.getAllSliderImages = async (req, res) => {
  try {
    const sliderImages = await SliderImage.find();
    res.json(sliderImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete Slider Image
exports.deleteSliderImage = async (req, res) => {
    const { sliderId } = req.params;
  
    try {
      const sliderImages = await SliderImage.findByIdAndDelete(sliderId);
  
      if (!sliderImages) {
        return res.status(404).json({ msg: 'Slider not found' });
      }
  
      // If image exists, delete it before deleting the blog post
      if (sliderImages.imageUrl) {
        const filePath = path.join(__dirname, '..', sliderImages.imageUrl);
        fs.unlinkSync(filePath);
      }
  
      res.json({ msg: 'Slider deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};


 