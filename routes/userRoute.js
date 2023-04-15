const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  editUser,
  refreshToken,
  getUserProfile,
  logOutUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.route('/').put(protect, editUser);
router.route('/:id').get(protect, getUserProfile);
router.post('/login', loginUser);
router.post('/logout', protect, logOutUser);
router.route('/refresh_token').post(refreshToken);

module.exports = router;
