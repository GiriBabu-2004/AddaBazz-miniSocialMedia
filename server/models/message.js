const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Optional index for faster queries
messageSchema.index({ sender: 1, receiver: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
