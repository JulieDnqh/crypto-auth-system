const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { findUserPublicKey, addContact } = require('../controllers/userController');

// GET /api/users/key?email=some@email.com
router.get('/key', authMiddleware.getAuth, findUserPublicKey);

// POST /api/users/contacts - Add a new contact
router.post('/contacts', authMiddleware.getAuth, addContact);

module.exports = router;