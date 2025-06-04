const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');

const Message = require('./models/message.js'); // Message model

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/images/uploads', express.static(path.join(__dirname, 'public/images/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/auth', postRoutes);
app.use('/api/messages', messageRoutes);

// Serve frontend from Vite build
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/miniSocialMedia3')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.locals.io = io;

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room ${userId}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, receiver, content } = data;

    if (!sender || !receiver || !content) {
      console.error('⚠️ Invalid message data:', data);
      return;
    }

    try {
      const newMessage = new Message({
        sender,
        receiver,
        content,
        timestamp: new Date(),
      });

      await newMessage.save();

      // Emit to receiver and sender rooms
      io.to(receiver).emit('receive_message', newMessage);
      socket.emit('receive_message', newMessage);

      console.log(`📨 Message sent from ${sender} to ${receiver}`);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❎ User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
