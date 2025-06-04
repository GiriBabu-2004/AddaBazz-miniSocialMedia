const Post = require('../models/post.js');
const User = require('../models/user.js');

exports.createPost = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await Post.create({ content: req.body.content, user: user._id });
    user.posts.push(post._id);
    await user.save();

    // Populate post with user data to send via socket
    await post.populate('user', 'username');

    // Emit new post event via Socket.IO
    if (req.app.locals.io) {
      req.app.locals.io.emit('newPost', post);
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating post' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { content: req.body.content });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating post' });
  }
};

exports.getEditPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting post' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user.userId;
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while toggling like' });
  }
};

// NEW: Fetch all posts with user info, newest first
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username') // get username only
      .sort({ createdAt: -1 }); // newest posts first

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
};
