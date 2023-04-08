const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  deletePost,
  getPostById,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllPosts).post(protect, createPost);

router
  .route('/:id')
  .get(protect, getPostById)
  .delete(protect, deletePost);

module.exports = router;
