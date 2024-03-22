const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Blog Post
router.post('/create', authMiddleware, blogController.createBlogPost);

// Get All Blog Posts
router.get('/all', blogController.getAllBlogPosts);

//  Get Latest Blog Post For Front
router.get('/latest', blogController.getLatestBlogPost);

// Admin Get Single Blog Post
router.get('/single/:postId', blogController.getBlogPostById);

// Get a single blog post by id front
router.get('/single/:id', blogController.getSingleFrontBlogPost);


// Update Blog Post 
router.put('/update/:postId', authMiddleware, blogController.updateBlogPost);

// Delete Blog Post
router.delete('/delete/:postId', authMiddleware, blogController.deleteBlogPost);

// Total blog
router.get('/total-blog', blogController.getTotalBlogs);


module.exports = router;
