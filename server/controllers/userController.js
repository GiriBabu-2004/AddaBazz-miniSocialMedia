const User = require('../models/user.js');
const bcrypt = require('bcrypt');

// Get profile, including followers and following populated
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
      .populate('posts')
      .populate('followers', 'username name profilePic')  // get basic info of followers
      .populate('following', 'username name profilePic'); // get basic info of following

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload profile pic
exports.uploadProfilePic = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    user.profilePic = req.file.filename;
    await user.save();
    res.json({ success: true, profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Change username
exports.changeUsername = async (req, res) => {
  const { newUsername } = req.body;
  if (!newUsername || newUsername.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    const user = await User.findOne({ email: req.user.email });
    user.username = newUsername;
    await user.save();
    res.json({ success: true, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All password fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirm password do not match' });
  }
  try {
    const user = await User.findOne({ email: req.user.email });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const userToFollowId = req.params.userId;
    const loggedInUser = await User.findOne({ email: req.user.email });

    if (loggedInUser._id.equals(userToFollowId)) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(userToFollowId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User to follow not found' });
    }

    // Prevent duplicate follow
    if (userToFollow.followers.includes(loggedInUser._id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    userToFollow.followers.push(loggedInUser._id);
    loggedInUser.following.push(userToFollow._id);

    await userToFollow.save();
    await loggedInUser.save();

    res.json({ success: true, message: 'User followed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollowId = req.params.userId;
    const loggedInUser = await User.findOne({ email: req.user.email });

    if (loggedInUser._id.equals(userToUnfollowId)) {
      return res.status(400).json({ error: "You can't unfollow yourself" });
    }

    const userToUnfollow = await User.findById(userToUnfollowId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User to unfollow not found' });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => !followerId.equals(loggedInUser._id)
    );
    loggedInUser.following = loggedInUser.following.filter(
      (followingId) => !followingId.equals(userToUnfollow._id)
    );

    await userToUnfollow.save();
    await loggedInUser.save();

    res.json({ success: true, message: 'User unfollowed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get mutual followers (people you follow AND they follow you)
exports.getMutualFollowers = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const mutuals = await User.find({
      _id: { $in: user.following },
      following: user._id
    }).select('username name profilePic');

    res.json({ success: true, mutualFollowers: mutuals });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching mutual followers' });
  }
};
