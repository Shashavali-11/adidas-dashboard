const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../middleware/errorHandler');
const { signToken } = require('../middleware/auth');

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    region: user.region,
  };
}

function sessionResponse(user) {
  return { token: signToken(user), user: publicUser(user) };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !String(name).trim()) {
    throw new ApiError(400, 'Name is required');
  }
  if (!EMAIL_REGEX.test(email || '')) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.exists({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(sessionResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const passwordMatches = await user.matchPassword(String(password));
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json(sessionResponse(user));
});

function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

const updateMe = asyncHandler(async (req, res) => {
  const { name, region, password } = req.body || {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw new ApiError(400, 'Name cannot be empty');
    }
    req.user.name = name;
  }
  if (region !== undefined) {
    req.user.region = region;
  }
  if (password) {
    if (String(password).length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }
    req.user.password = password;
  }

  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

module.exports = { register, login, me, updateMe };
