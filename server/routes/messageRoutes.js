const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController.js');
const router = express.Router();

router.post('/', sendMessage);
router.get('/:userId/:otherUserId', getMessages); // Get messages between 2 users

module.exports = router;
