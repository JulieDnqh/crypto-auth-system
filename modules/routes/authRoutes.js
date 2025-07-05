const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');

// Route cho việc đăng ký
router.post('/signup', signup);

// Route cho việc đăng nhập
router.post('/signin', signin);

module.exports = router;