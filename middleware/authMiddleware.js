const config = require('../config/config');
const jwt = require('jsonwebtoken');
 

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if token does not exist
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token.replace('Bearer ', ''), config.SESSION_SECRET);

    // Set user in request object
    req.user = decoded.user;

    // Call next middleware
    next();
  } catch (err) {
    // If token is not valid
    res.status(401).json({ msg: 'Invalid token' });
  }
};

module.exports = authMiddleware;
