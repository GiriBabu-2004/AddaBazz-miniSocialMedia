const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/authMiddleware.js');
const upload = require('../config/multerconfig.js');
const {
  getProfile,
  uploadProfilePic,
  changeUsername,
  changePassword,
  followUser,     // Import follow controller
  unfollowUser,
  getMutualFollowers    // Import unfollow controller

} = require('../controllers/userController.js');

router.get('/profile', isLoggedIn, getProfile);
router.post('/upload', isLoggedIn, upload.single('image'), uploadProfilePic);
router.put('/change-username', isLoggedIn, changeUsername);
router.put('/change-password', isLoggedIn, changePassword);

// Add follow/unfollow routes
router.post('/follow/:userId', isLoggedIn, followUser);
router.post('/unfollow/:userId', isLoggedIn, unfollowUser);

router.get('/mutual-followers', isLoggedIn, getMutualFollowers);

module.exports = router;
