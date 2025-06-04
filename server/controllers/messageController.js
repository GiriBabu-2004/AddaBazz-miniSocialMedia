const Message = require('../models/message.js'); // Import Message model

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    if (!sender || !receiver || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Message send failed' });
  }
};

exports.getMessages = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'username profilePic')
      .populate('receiver', 'username profilePic');

    res.json({ success: true, messages }); // ✅ This format matches frontend expectation
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not fetch messages' });
  }
};
