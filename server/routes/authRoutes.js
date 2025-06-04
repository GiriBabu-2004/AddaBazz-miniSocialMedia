const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController.js');

router.post('/create', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;