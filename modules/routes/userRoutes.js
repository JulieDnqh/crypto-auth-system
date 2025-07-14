const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { findUserPublicKey } = require('../controllers/userController');

// GET /api/users/key?email=some@email.com
router.get('/key', authMiddleware.getAuth, findUserPublicKey);

module.exports = router;