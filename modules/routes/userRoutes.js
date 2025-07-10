const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Dùng middleware của admin
const { findUserPublicKey } = require('../controllers/userController');

// GET /api/users/key?email=some@email.com
router.get('/key', adminAuth, findUserPublicKey);

module.exports = router;