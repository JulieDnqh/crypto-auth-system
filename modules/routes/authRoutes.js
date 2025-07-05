const express = require('express');
const router = express.Router();
const { signup, signin, signinStep1, verifyOtp } = require('../controllers/authController');

// Route cho việc đăng ký
router.post('/signup', signup);

// Route cho việc đăng nhập
router.post('/signin', signin);

router.post('/signin-step1', signinStep1);

router.post('/verify-otp', verifyOtp);

module.exports = router;