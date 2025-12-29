const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  logger.info('Authenticate - Token:', { token: token ? 'Present' : 'Missing' });
  if (!token) {
    logger.error('Authenticate - No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('Authenticate - Decoded:', { 
      userId: decoded.userId, 
      roles: decoded.roles || 'None' 
    });
    req.user = decoded;
    next();
  } catch (err) {
    logger.error('Authenticate - Error:', { error: err.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  logger.info('Authorize - Checking:', { 
    userId: req.user?.userId, 
    roles: req.user?.roles || 'None', 
    required: roles 
  });
  if (!req.user?.roles?.some(role => roles.includes(role))) {
    logger.error('Authorize - Failed:', {
      userId: req.user?.userId,
      roles: req.user?.roles || 'None',
      required: roles
    });
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  next();
};

module.exports = { authenticate, authorize };