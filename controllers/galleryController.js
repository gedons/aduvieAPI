const GalleryImage = require('../models/GalleryImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Dropbox } = require('dropbox');

 
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch  
});

exports.createGalleryImage = async (req, res) => {
  const file = req.file;

   if (!file) {
     return res.status(400).send('No file uploaded');
   }

  // request body
    const { galleryText } = req.body;
 
   try {
      const fileBuffer = fs.readFileSync(file.path);
      const path = `/uploads/${file.filename}`;
 
      const fileData = await dropbox.filesUpload({
        path: path,
        contents: fileBuffer,
      });
   
 
      // path for creating a shared link
      const sharedLinkPath = { path: fileData.result.path_display };
 
      // Create a shared link for the file
      const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings(sharedLinkPath);
 
      // Extract the link from the shared link
      let imageUrl = sharedLink.result.url;

     imageUrl = imageUrl.replace(/dl=0/, 'raw=1');


 //save to database
 const newGalleryImage = new GalleryImage({
  imageUrl,
  galleryText,
})
 
  try {
  await newGalleryImage.save();
    res.status(201).send({ msg: 'Gallery image added successfully', galleryImage: newGalleryImage });
  } catch (err) {
    console.error('Error creating gallery', err);
    return res.status(500).send('Error creating gallery');
  }
  } catch (err) {
   console.error('Error uploading file:', err);
   return res.status(500).send('Error uploading file', err);
  }
};

// Create Gallery Image
// exports.createGalleryImage = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error(err.message);
//       return res.status(400).json({ msg: err.message });
//     } else {
//       try {
//         const { filename } = req.file;
//         const { galleryText } = req.body;
//         const imageUrl = `/uploads/gallery/${filename}`; 

//         const newGalleryImage = new GalleryImage({
//           imageUrl,
//           galleryText,
//         });

//         await newGalleryImage.save();

//         res.json({ msg: 'Gallery image added successfully', galleryImage: newGalleryImage });
//       } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//       }
//     }
//   });
// };

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



 