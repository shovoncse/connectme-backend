const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUsersList,
  refreshToken,
  logOutUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getUsersList)
  .post(registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logOutUser);
router.route('/refresh_token').post(refreshToken);

module.exports = router;
