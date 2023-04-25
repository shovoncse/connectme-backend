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
  const { postContent, image } = req.body;

  if (!postContent && !image) {
    res.status(400);
    throw new Error('Content is required');
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
  post.image = image;
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

// @desc Create a comment
// @route POST /api/posts/:id
// @access Private
const createComment = asyncHandler(async (req, res) => {
  let { commentContent } = req.body;

  commentContent = purifyXSS(commentContent);
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.comments.push({
    user: req.user._id,
    likes: [],
    numLikes: 0,
    isLiked: false,
    commentContent: commentContent,
  });
  post.numComments = post.comments.length;
  const createdPost = await post.save();

  if (post.user.toString() !== req.user._id.toString()) {
    const notification = new Notification({
      receiver: post.user,
      sender: req.user._id,
      read: false,
      action: 'comment',
      message: 'commented on your post.',
      link: `/posts/${post._id}`,
    });

    await notification.save();
  }

  // return the comment and user info
  const comment = createdPost.comments[createdPost.comments.length - 1];
  const user = await User.findById(req.user._id).select('name username image');
  comment.user = user;

  res.status(201).json(comment);
});

// @desc Delete a comment
// @route DEL /api/posts/:id/:comId
// @access Private
const deleteComment = asyncHandler(async (req, res) => {
  const { id, comId } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.comments = post.comments.filter((com) => {
    return com._id.toString() !== comId.toString();
  });
  post.numComments = post.comments.length;
  await post.save();
  res.status(201).json({ message: `Deleted the comment` });
});

// @desc Like a post
// @route POST /api/posts/:id/like
// @access Private
const likePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  let task = '';
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const alreadyLiked = post.likes.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );
    post.numLikes = post.likes.length;
    task = 'Unliked';
  } else {
    post.likes.push({ user: req.user._id });
    post.numLikes = post.likes.length;
    task = 'Liked';

    if (post.user.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        receiver: post.user,
        sender: req.user._id,
        read: false,
        action: 'like',
        message: 'liked your post.',
        link: `/posts/${post._id}`,
      });

      await notification.save();
    }
  }

  await post.save();

  res.status(201).json({ message: `${task} the post` });
});

// @desc Like a comment
// @route POST /api/posts/:id/:comId/like
// @access Private
const likeComment = asyncHandler(async (req, res) => {
  const { id, comId } = req.params;
  const post = await Post.findById(id);
  let task = '';
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  post.comments.forEach(async (com) => {
    if (com._id.toString() === comId.toString()) {
      const alreadyLiked = com.likes.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyLiked) {
        com.likes = com.likes.filter(
          (r) => r.user.toString() !== req.user._id.toString()
        );
        com.numLikes = com.likes.length;
        task = 'Unliked';
      } else {
        com.likes.push({ user: req.user._id });
        com.numLikes = com.likes.length;
        task = 'Liked';

        if (com.user.toString() !== req.user._id.toString()) {
          const notification = new Notification({
            receiver: com.user,
            sender: req.user._id,
            read: false,
            action: 'like',
            message: 'liked your comment.',
            link: `/posts/${post._id}`,
          });

          await notification.save();
        }
      }
    }
  });
  await post.save();

  res.status(201).json({ message: `${task} the comment` });
});


module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  likePost,
  createComment,
  deleteComment,
  likeComment,
  deletePost,
};
