const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Debug: Log environment variables (without showing the actual keys for security)
console.log('🔧 Environment Variables Status:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('GROK_API_KEY:', process.env.GROK_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('GORK_BACKROOM_API_KEY:', process.env.GORK_BACKROOM_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('ELEVENLABS_VOICE_ID:', process.env.ELEVENLABS_VOICE_ID ? '✅ Loaded' : '❌ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing');
console.log('PORT:', process.env.PORT || 3001);

const AIOrchestrator = require('./services/aiOrchestrator');

const app = express();
const httpServer = http.createServer(app);

// Configure CORS for both development and production
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://localhost:3000",
    process.env.FRONTEND_URL,
    process.env.RAILWAY_STATIC_URL,
    /railway\.app$/,
    /vercel\.app$/,
    /netlify\.app$/
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ["polling", "websocket"],
  allowEIO3: true
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AI Roundtable Backend'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roundtable')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('App will continue without MongoDB. Some features may be limited.');
  });

// Initialize AI Orchestrator with socket.io instance
const aiOrchestrator = new AIOrchestrator(io);

// Make orchestrator and io available to routes
app.set('aiOrchestrator', aiOrchestrator);
app.set('io', io);

// Start auto-roundtable (runs every 3 minutes)
aiOrchestrator.startAutoRoundtable(3);
console.log('🚀 Auto-roundtable started - will run every 3 minutes');

// Start server-side debate manager
aiOrchestrator.startDebateManager();
console.log('🎯 Server-side debate manager started');

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 WebSocket client connected:', socket.id);
  console.log('🔌 Total connected clients:', io.sockets.sockets.size);
  
  // Immediately send current debate state to new connection
  const currentState = aiOrchestrator.getCurrentDebateState();
  socket.emit('debateState', currentState);
  console.log('📺 Sent current debate state to new client:', socket.id);
  
  // Send a welcome message to confirm connection
  socket.emit('welcome', { 
    message: 'Connected to webhook server', 
    timestamp: new Date().toISOString() 
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket client disconnected:', socket.id, 'Reason:', reason);
    console.log('🔌 Remaining connected clients:', io.sockets.sockets.size);
  });
  
  socket.on('error', (error) => {
    console.log('🔌 WebSocket error for client:', socket.id, error);
  });
  
  // Handle ping/pong for connection stability
  socket.on('ping', () => {
    socket.emit('pong');
  });
  
  // Handle request for current debate state
  socket.on('getCurrentDebateState', () => {
    console.log('📡 Client requested current debate state:', socket.id);
    const currentState = aiOrchestrator.getCurrentDebateState();
    socket.emit('debateState', currentState);
    console.log('📺 Sent current debate state to requesting client:', socket.id);
  });
});

// Routes
const aiRoutes = require('./routes/ai');
const threadRoutes = require('./routes/threads');
const newsRoutes = require('./routes/news');
const webhookRoutes = require('./routes/webhooks');
const gorkRoutes = require('./routes/gork');

app.use('/api/ai', aiRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/gork', gorkRoutes);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server + Socket.IO listening on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhooks/twitter`);
  console.log(`Socket.IO endpoint: http://localhost:${PORT}/socket.io/`);
}); 