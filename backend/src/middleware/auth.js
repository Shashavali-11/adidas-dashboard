const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('./errorHandler');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env');
  }
  return secret;
}

function signToken(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: user._id }, getSecret(), { expiresIn });
}

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  let token = null;
  if (header.startsWith('Bearer ')) {
    token = header.slice(7);
  }
  if (!token) {
    throw new ApiError(401, 'Please sign in to continue');
  }

  let payload;
  try {
    payload = jwt.verify(token, getSecret());
  } catch (err) {
    throw new ApiError(401, 'Your session has expired. Please sign in again');
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(401, 'Account no longer exists');
  }
  req.user = user;
  next();
});

module.exports = { protect, signToken };
