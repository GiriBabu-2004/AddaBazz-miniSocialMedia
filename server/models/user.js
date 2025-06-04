const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: String,
  age: Number,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: 'user.png' },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users who follow this user
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // users this user follows
});

module.exports = mongoose.model('User', userSchema);
