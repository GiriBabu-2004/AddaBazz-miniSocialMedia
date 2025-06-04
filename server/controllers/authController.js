const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

exports.register = async (req, res) => {
  const { username, name, age, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ error: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, name, age, email, password: hash });
  const token = jwt.sign({ email: user.email, userId: user._id }, 'copy');

  res.cookie('token', token, { httpOnly: true });
  res.json({ success: true });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ email: user.email, userId: user._id }, 'copy');
  res.cookie('token', token, { httpOnly: true });
  res.json({ success: true });
};

exports.logout = (req, res) => {
  res.clearCookie('token',{ httpOnly: true });
  res.json({ success: true });
};
