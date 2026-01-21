const { verifyToken } = require('../utils/jwt.utils.js');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    console.log("token : ", token);
    const decoded = verifyToken(token);
    console.log("decoded : ", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED'
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
  }
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    if (req.user.role_id !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = {
  auth,
  requireRole
}; 