const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  editUser,
  refreshToken,
  getUserProfile,
  verifyUser,
  logOutUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
router.route('/verify_username/:id').get(protect, verifyUser);
router.post('/', registerUser);
router.route('/').put(protect, editUser);
router.route('/:id').get(protect, getUserProfile);
router.post('/login', loginUser);
router.post('/logout', protect, logOutUser);
router.route('/refresh_token').post(refreshToken);

module.exports = router;
