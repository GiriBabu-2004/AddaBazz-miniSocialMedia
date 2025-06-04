const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/authMiddleware.js');
const {
  createPost,
  updatePost,
  getEditPost,
  deletePost,
  toggleLike,
  getAllPosts // <-- import the new controller method
} = require('../controllers/postController.js');

// Route to fetch all posts (visible to logged-in users)
router.get('/posts', isLoggedIn, getAllPosts);  // NEW route

router.post('/post', isLoggedIn, createPost);
router.put('/updatePost/:id', isLoggedIn, updatePost);
router.get('/edit/:id', isLoggedIn, getEditPost);
router.delete('/delete/:id', isLoggedIn, deletePost);
router.post('/likes/:id', isLoggedIn, toggleLike);

module.exports = router;
