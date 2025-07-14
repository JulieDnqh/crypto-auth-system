const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateQrCode, decodeQrCode } = require('../controllers/qrCodeController');
const { getAuth } = require("../middleware/authMiddleware");

const upload = multer(); // Khởi tạo multer để xử lý multipart/form-data

// Route để tạo QR code từ thông tin khóa của người dùng đã xác thực
router.post('/generate', getAuth, generateQrCode);

// Route để giải mã QR code từ một file ảnh
router.post('/decode', getAuth, upload.single('qrCodeImage'), decodeQrCode);

module.exports = router;