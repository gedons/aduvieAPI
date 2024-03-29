const SliderImage = require('../models/SliderImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Dropbox } = require('dropbox');

 
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch  
});

 

// Create Slider Image
exports.createSliderImage = async (req, res) => {
  const file = req.file;

   if (!file) {
     return res.status(400).send('No file uploaded');
   }

  // request body
  const { HeaderText, BodyText } = req.body;
   
 
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
    const newSliderImage = new SliderImage({
      imageUrl,
      HeaderText,
      BodyText
    })

    try {
      await newSliderImage.save();
        res.status(201).send({ msg: 'Slider image added successfully', newSliderImage });
      } catch (err) {
        console.error('Error creating image', err);
        return res.status(500).send('Error creating image');
      }
      } catch (err) {
       console.error('Error uploading file:', err);
       return res.status(500).send('Error uploading file');
      }
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


 