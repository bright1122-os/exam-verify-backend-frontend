import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-__v');

    if (!req.user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (!req.user.isActive) {
      return errorResponse(res, 'Account deactivated', 403);
    }

    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token failed', 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};
