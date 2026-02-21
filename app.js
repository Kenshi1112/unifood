// Import dependencies
  const express = require('express');
  const http = require('http'); // Import http module
  const { WebSocketServer } = require('ws'); // Import WebSocket server
  const jwt = require('jsonwebtoken'); // To verify JWT tokens
  const mongoose = require('mongoose');
  const Chat = require('./models/chat'); // นำเข้า Chat Model ที่เพิ่งสร้าง
  const dotenv = require('dotenv');
  const cors = require('cors');
  const path = require('path');

  // Load environment variables from .env file
  dotenv.config();

  // Force unbuffered output
  process.stdout._handle.setBlocking(true);
  process.stderr._handle.setBlocking(true);
  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
  }

  // Initialize the Express app
  const app = express();

  // Middleware
  app.use(cors()); // Enable Cross-Origin Resource Sharing
  app.use(express.json()); // Parse incoming JSON requests
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data (form submissions)
  app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like images, CSS, JS

  // Create an HTTP server from the Express app
  const server = http.createServer(app);

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });

  // Import routes for restaurant, authentication, and reviews
  const restaurantRoutes = require('./routes/restaurantRoutes');
  const authRoutes = require('./routes/authRoutes');
  const reviewRoutes = require('./routes/reviewRoutes');
  const issueRoutes = require('./routes/issueRoutes');

  // Use routes
  app.use('/api/restaurant', restaurantRoutes); // Route for restaurant-related actions
  app.use('/api/auth', authRoutes); // Route for authentication (login/signup)
  app.use('/api/review', reviewRoutes); // Route for review-related actions
  app.use('/api/issue', issueRoutes); // Route for issue reporting

  // Serve frontend HTML for the homepage
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html')); // Main page of the app
  });

  // Serve frontend HTML for adding a restaurant
  app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addRestaurant.html'));
  });

  // Serve frontend HTML for editing a restaurant
  app.get('/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editRestaurant.html'));
  });

  // Serve frontend HTML for restaurant details
  app.get('/restaurant/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'restaurantDetails.html'));
  });

  // Serve frontend HTML for reviewing a restaurant
  app.get('/review/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'review.html'));
  });

  // Serve frontend HTML for login
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  });

  // Serve frontend HTML for register
  app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
  });

  // Serve frontend HTML for profile
  app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
  });

  // Serve frontend HTML for Admin Panel
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
  });

  //แก้ backend รับแจ้งปัญหา
  app.get('/issue', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'issue.html'));
  });

  // Error handling middleware (404 and other errors)
  app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error); // Pass error to next middleware
  });

  // Global error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {}, // Show detailed error in development mode
    });
  });

  // Start the server
  const PORT = process.env.PORT || 3001; // Use the port specified in .env or default to 3001
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server });
const chatRooms = new Map();

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

server.on('close', () => {
  clearInterval(interval);
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', async (message) => { // 👈 เปลี่ยนเป็น async เพื่อใช้กับ Database
    try {
      const data = JSON.parse(message);

      if (data.type === 'join' && data.token && data.restaurantId) {
        jwt.verify(data.token, process.env.JWT_SECRET, async (err, decoded) => {
          if (err) return ws.close(1008, 'Invalid token');
          
          ws.userId = decoded.id;
          ws.restaurantId = data.restaurantId;

          if (!chatRooms.has(ws.restaurantId)) {
            chatRooms.set(ws.restaurantId, new Set());
          }
          chatRooms.get(ws.restaurantId).add(ws);
          console.log(`User ${ws.userId} joined room for restaurant ${ws.restaurantId}`);

          // 🌟 ดึงประวัติแชทเก่าจาก Database มาโชว์
          try {
            const history = await Chat.find({ restaurant: ws.restaurantId })
                                      .sort({ createdAt: 1 }) // เรียงจากเก่าไปใหม่
                                      .limit(50); // โชว์ 50 ข้อความล่าสุด
            
            // ส่งประวัติแชทกลับไปให้คนที่เพิ่งเข้าห้อง
            ws.send(JSON.stringify({
              type: 'history',
              messages: history.map(msg => ({
                text: msg.message,
                senderId: msg.sender.toString()
              }))
            }));
          } catch (err) {
            console.error('Failed to fetch chat history', err);
          }
        });

      } else if (data.type === 'message' && data.text) {
        if (!ws.userId || !data.restaurantId) return;

        // 🌟 บันทึกข้อความใหม่ลง Database
        try {
          const newChat = await Chat.create({
            restaurant: data.restaurantId,
            sender: ws.userId,
            message: data.text
          });

          // เตรียมข้อความสำหรับส่งให้ทุกคนในห้อง
          const messageToSend = JSON.stringify({
            type: 'message',
            text: newChat.message,
            senderId: newChat.sender.toString() // ส่ง ID คนพิมพ์ไปด้วย
          });

          // บรอดแคสต์ให้ทุกคนที่เปิดแชทร้านนี้อยู่
          const room = chatRooms.get(data.restaurantId);
          if (room) {
            room.forEach(client => {
              if (client.readyState === ws.OPEN) {
                client.send(messageToSend);
              }
            });
          }
        } catch (err) {
          console.error('Failed to save chat message', err);
        }
      }
    } catch (e) {
      console.error('WebSocket: Failed to process message', e);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    if (ws.restaurantId && chatRooms.has(ws.restaurantId)) {
      chatRooms.get(ws.restaurantId).delete(ws);
    }
  });

  ws.on('error', (error) => console.error('WebSocket error:', error));
});