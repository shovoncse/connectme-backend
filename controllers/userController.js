const User = require('../models/userModel');
const Post = require('../models/postModel');
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
      username: user.username,
      bio: user.bio,
      profession: user.profession,
      education: user.education,
      location: user.location,
      country: user.country,
      image: user.image,
      cover: user.cover,
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

  createdUser.username = createdUser._id.toString();

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
      username: user.username,
      bio: user.bio,
      profession: user.profession,
      education: user.education,
      location: user.location,
      country: user.country,
      image: user.image,
      cover: user.cover,
      accessToken: accessToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid User Data');
  }
});

// @desc Edit user profile details
// @route PUT /api/users
// @access Private
const editUser = asyncHandler(async (req, res) => {
  let {
    id,
    name,
    username,
    bio,
    image,
    cover,
    location,
    country,
    profession,
    education,
  } = req.body;

  username = username.toLowerCase().replace(/\s+/g, '');

  if (username.length > 15) {
    res.status(401);
    throw new Error('Username should be 15 characters maximum.');
  }

  if (name.length > 20) {
    res.status(401);
    throw new Error('Name should be 20 characters maximum.');
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(400);
    throw new Error('User Not Found');
  }

  const usernameExists = await User.findOne({ username: username });

  if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
    res.status(401);
    throw new Error('Username already exists!');
  }

  if (req.user._id.toString() !== id.toString()) {
    res.status(401);
    throw new Error('Not Authorized, user id is different');
  }


  user.name = name || user.name;
  user.username = username || user.username;
  user.bio = bio || user.bio;
  user.image = image || user.image;
  user.cover = cover || user.cover;
  user.location = location || user.location;
  user.country = country || user.country;
  user.profession = profession || user.profession;
  user.education = education || user.education;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    image: updatedUser.image,
    cover: updatedUser.cover,
    bio: updatedUser.bio,
    username: updatedUser.username,
    location: updatedUser.location,
    country: updatedUser.country,
    profession: updatedUser.profession,
    education: updatedUser.education,
    accessToken: generateAccessToken(updatedUser._id),
  });
});

// @desc Get User Profile
// @route GET /api/users/:id
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const username = req.params.id;

  const user = await User.findOne({ username: username });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    profession: user.profession,
    education: user.education,
    location: user.location,
    country: user.country,
    image: user.image,
    cover: user.cover,
  };


  const posts = await Post.find({ user: user._id })
    .populate('user', 'id name username image country')
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'id name username image country',
      },
    })
    .sort({ createdAt: -1 });
  res.json({ user: userData, posts });
});

// @desc useresname exisiting
// @route Get /api/user/verify/:id
// @access Private
const verifyUser = asyncHandler(async (req, res) => {
  const username = req.params.id;

  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(200).json({
      message: 'Username available',
      available: true
    });
  } else {
    return res.status(200).json({
      message: 'Username already exists',
      available: false
    });
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
  editUser,
  getUserProfile,
  logOutUser,
  verifyUser,
  refreshToken
};
