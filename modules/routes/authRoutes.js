const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signinStep1,
  verifyOtp,
  updateUserProfile,
  changePassword,
  getDashboardData,
} = require("../controllers/authController");
const { getAuth } = require("../middleware/authMiddleware"); // Import middleware

// Route cho việc đăng ký
router.post("/signup", signup);

// Route cho việc đăng nhập
router.post("/signin", signin);

router.post("/signin-step1", signinStep1);

router.post("/verify-otp", verifyOtp);

// Route ví dụ được bảo vệ
router.get('/dashboard', getAuth, getDashboardData);

// Route để cập nhật thông tin người dùng
router.put('/profile', getAuth, updateUserProfile);
router.put('/password', getAuth, changePassword);

module.exports = router;
