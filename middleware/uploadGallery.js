const multer = require('multer');
const path = require('path');
 


// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/gallery/');  
  },
  filename: function (req, file, cb) {
    // Set a unique filename for the uploaded file
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 10MB file size limit
  },
});

module.exports = upload;
