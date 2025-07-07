const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signinStep1,
  verifyOtp,
} = require("../controllers/authController");
const { getAuth } = require("../middleware/authMiddleware"); // Import middleware

// Route cho việc đăng ký
router.post("/signup", signup);

// Route cho việc đăng nhập
router.post("/signin", signin);

router.post("/signin-step1", signinStep1);

router.post("/verify-otp", verifyOtp);

// Route ví dụ được bảo vệ
router.get("/dashboard", getAuth, (req, res) => {
  res.json({ message: "Bạn đã truy cập thành công profile!", user: req.user });
});

module.exports = router;
