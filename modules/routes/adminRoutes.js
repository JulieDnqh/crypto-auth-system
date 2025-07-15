const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const { getAllUsers, lockUserAccount, unlockUserAccount, getAllLogs } = require('../controllers/adminController');

// All admin routes will use authMiddleware.getAuth and adminAuth

// GET all users
router.get('/users', authMiddleware.getAuth, adminAuth, getAllUsers);

// POST lock user account
router.post('/users/:userId/lock', authMiddleware.getAuth, adminAuth, lockUserAccount);

// POST unlock user account
router.post('/users/:userId/unlock', authMiddleware.getAuth, adminAuth, unlockUserAccount);

// GET all logs
router.get('/logs', authMiddleware.getAuth, adminAuth, getAllLogs);

module.exports = router;