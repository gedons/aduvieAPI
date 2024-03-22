const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BlogPost = require('../models/BlogPost');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 9000000 }, // 1MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// Create Blog Post
exports.createBlogPost = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err.message);
      return res.status(400).json({ msg: err.message });
    } else {
      // Check if file is uploaded
      if (req.file) {
        
        let image = req.file.path;  
        image = image.replace(/\\/g, '/');

        const { title, content } = req.body;

        try {
          const blogPost = new BlogPost({
            title,
            content,
            image  
          });

          await blogPost.save();

          res.json({ msg: 'Blog post created successfully', blogPost });
        } catch (err) {
          // If error occurs, delete uploaded file
          fs.unlinkSync(req.file.path);
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      } else {
        // No file uploaded, proceed without image
        const { title, content } = req.body;

        try {
          const blogPost = new BlogPost({
            title,
            content
          });

          await blogPost.save();

          res.json({ msg: 'Blog post created successfully', blogPost });
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      }
    }
  });
};

// Get All Blog Posts
exports.getAllBlogPosts = async (req, res) => {
    try {
      const blogPosts = await BlogPost.find()
      res.json(blogPosts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Get Latest Blog Post For Front
exports.getLatestBlogPost = async (req, res) => {
  try {
    const latestBlogPost = await BlogPost.find()
      .sort({ _id: -1 })
      .limit(6);
    res.json(latestBlogPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get Single Blog Post
exports.getBlogPostById = async (req, res) => {
    const { postId } = req.params;
  
    try {
      const blogPost = await BlogPost.findById(postId);
  
      if (!blogPost) {
        return res.status(404).json({ msg: 'Blog post not found' });
      }
  
      res.json(blogPost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

exports.updateBlogPost = async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    const imageFile = req.file; // New image file
  
    try {
      let blogPost = await BlogPost.findByIdAndUpdate(postId, { title, content });
  
      if (!blogPost) {
        return res.status(404).json({ msg: 'Blog post not found' });
      }
  
      // Update image if a new one is uploaded
      if (imageFile) {
        // Delete the old image only if it exists
        if (blogPost.image) {
          try {
            fs.unlinkSync(blogPost.image);
          } catch (err) {
            console.error('Error deleting old image:', err.message);
          }
        }
        blogPost.image = imageFile.path;
      }
  
      res.json({ msg: 'Blog post updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Get a single blog post by title
exports.getSingleFrontBlogPost = async (req, res) => {
  const { id } = req.params;

  try {
      const blogPost = await BlogPost.findOne({ id });

      if (!blogPost) {
          return res.status(404).json({ msg: 'Blog post not found' });
      }

      res.json(blogPost);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
};

  
// Delete Blog Post
exports.deleteBlogPost = async (req, res) => {
    const { postId } = req.params;
  
    try {
      const blogPost = await BlogPost.findByIdAndDelete(postId);
  
      if (!blogPost) {
        return res.status(404).json({ msg: 'Blog post not found' });
      }
  
      // If image exists, delete it before deleting the blog post
      if (blogPost.image) {
        fs.unlinkSync(blogPost.image);
      }
  
      res.json({ msg: 'Blog post deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

// Get total number of blog
exports.getTotalBlogs = async (req, res) => {
  try {
    const totalBlog = await BlogPost.countDocuments();
    res.status(200).json({ totalBlog });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch total blog', error: error.message });
  }
};

  
