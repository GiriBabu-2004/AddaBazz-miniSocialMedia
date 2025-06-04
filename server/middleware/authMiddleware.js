const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = jwt.verify(token, 'copy');
    req.user = data;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = isLoggedIn;