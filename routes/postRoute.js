const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  deletePost,
  getPostById,
  updatePost
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createPost);
router.route('/').get(protect, getAllPosts);

router.route('/:id').delete(protect, deletePost);
router.route('/:id').get(protect, getPostById);
router.route('/:id').put(protect, updatePost);

module.exports = router;