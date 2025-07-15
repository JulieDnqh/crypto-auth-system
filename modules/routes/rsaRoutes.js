const express = require('express');
const router = express.Router();
const { generateKeys, getKeyStatus, deleteKey, verifyPrivateKeyAccess, getMyKey } = require('../controllers/rsaController');
const { getAuth } = require("../middleware/authMiddleware");

// Route để tạo cặp khóa mới
router.post('/generate', getAuth, generateKeys);

// Route để xem trạng thái khóa hiện tại
router.get('/status', getAuth, getKeyStatus);

router.delete('/delete', getAuth, deleteKey);

router.post('/verify-access', getAuth, verifyPrivateKeyAccess);

// Route mới để lấy thông tin khóa của người dùng đang đăng nhập
router.get('/my-key', getAuth, getMyKey);

module.exports = router;