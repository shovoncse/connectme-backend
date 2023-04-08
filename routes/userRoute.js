const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  refreshToken,
  logOutUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logOutUser);
router.route('/refresh_token').post(refreshToken);

module.exports = router;
