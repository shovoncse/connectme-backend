const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  deletePost,
  getPostById,
  likePost,
  likeComment,
  createComment,
  deleteComment,
  updatePost
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createPost);
router.route('/').get(protect, getAllPosts);

router.route('/:id').delete(protect, deletePost);
router.route('/:id').get(protect, getPostById);
router.route('/:id').put(protect, updatePost);
router.route('/:id').post(protect, createComment);

router.route('/:id/like').get(protect, likePost);
router
  .route('/:id/:comId')
  .get(protect, likeComment)
  .delete(protect, deleteComment);

module.exports = router;