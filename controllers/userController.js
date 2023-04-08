const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
} = require('../utils/tokens.js');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// @desc Auth user and get token
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user && (await user.matchPassword(password))) {

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken: accessToken,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (name.length > 20) {
    res.status(400);
    throw new Error('Name should be 20 characters maximum.');
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  // Hash password before saving to the database
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const createdUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  const user = await createdUser.save();

  if (user) {
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    sendRefreshToken(res, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken: accessToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid User Data');
  }
});

const logOutUser = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { path: '/refresh_token' });
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = '';
    await user.save();
    res.status(200).json({ message: 'Logged out' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc Refresh tokens
// @route POST /api/users/refresh_token
// @access Public
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(404)
      .send({ accessToken: '', message: 'Token Not Found' });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({ accessToken: '' });
  }
  const user = await User.findById(decoded.id);
  if (!user)
    return res.status(404).send({ accessToken: '', message: 'User Not Found' });
  if (user.refreshToken !== token) {
    return res.send({ accessToken: '' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();


  sendRefreshToken(res, refreshToken);
  return res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    accessToken: accessToken,
  });
});


module.exports = {
  loginUser,
  registerUser,
  logOutUser,
  refreshToken
};
