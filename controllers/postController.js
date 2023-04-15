const Post = require('../models/postModel');
const asyncHandler = require('../utils/asyncHandler');
const { purifyXSS } = require('../utils/purifyXSS');
const User = require('../models/userModel');

// @desc Get all posts
// @route GET /api/posts
// @access Private
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate('user', 'name email username image').sort({ createdAt: -1 });
  res.json(posts);
});

// @desc Get post by id
// @route GET /api/posts/:id
// @access Private
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('user', 'name email');
  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc Create new post
// @route POST /api/posts
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const { postContent, image } = req.body;

  if (!postContent && !image) {
    res.status(400);
    throw new Error('Post content / image is required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const post = await Post.create({
    user: req.user,
    postContent: purifyXSS(postContent),
    image,
  });

  res.status(201).json(post);
});

// @desc Update a post
// @route PUT /api/posts/:id
// @access Private
const updatePost = asyncHandler(async (req, res) => {
  const { postContent } = req.body;

  if (!postContent) {
    res.status(400);
    throw new Error('Post content is required');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  post.postContent = purifyXSS(postContent);
  post.isEdited = true;
  await post.save();

  res.json(post);
});

// @desc Delete a post
// @route DELETE /api/posts/:id
// @access Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await post.remove();
  res.json({ message: 'Post removed' });
});

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
