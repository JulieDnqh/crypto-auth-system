const express = require('express');
const router = express.Router();
const { generateKeys, getKeyStatus, deleteKey } = require('../controllers/rsaController');
const { getAuth } = require("../middleware/authMiddleware");

// Route để tạo cặp khóa mới
router.post('/generate', getAuth, generateKeys);

// Route để xem trạng thái khóa hiện tại
router.get('/status', getAuth, getKeyStatus);

router.delete('/delete', getAuth, deleteKey);

module.exports = router;