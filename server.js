require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fs = require('fs');
const connectDB = require('./config/db');
const { getUnreadCount } = require('./utils/notificationHelper');
const { getFriendSuggestions } = require('./utils/friendSuggestions');
const errorHandler = require('./middleware/errorHandler');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const Message = require('./models/Message');

connectDB();

const app = express();
const server = http.createServer(app);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isCloudDB = process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb+srv');
const sessionStore = isCloudDB
  ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 14 * 24 * 60 * 60 })
  : null;

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'miniconnect_neon_super_secret_key_12345',
  resave: false,
  saveUninitialized: false,
  store: sessionStore || undefined,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, secure: false, sameSite: 'lax' }
});

app.use(sessionMiddleware);
app.use(apiRateLimiter);

app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.activePath = req.path;
  res.locals.unreadNotifications = 0;
  res.locals.unreadMessages = 0;
  res.locals.friendSuggestions = [];

  if (req.session.user) {
    try {
      res.locals.unreadNotifications = await getUnreadCount(req.session.user.id);
      const unreadMsgs = await Message.find({ receiver: req.session.user.id, seen: false });
      res.locals.unreadMessages = Array.isArray(unreadMsgs) ? unreadMsgs.length : 0;
      res.locals.friendSuggestions = await getFriendSuggestions(req.session.user.id, 8);
    } catch (err) {
      console.error('Locals middleware error:', err.message);
    }
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/posts', require('./routes/postRoutes'));
app.use('/post', require('./routes/postEditRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/', require('./routes/followRoutes'));
app.use('/', require('./routes/bookmarkRoutes'));
app.use('/saved-posts', require('./routes/savedRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/search', require('./routes/searchRoutes'));
app.use('/api/ai', require('./routes/captionRoutes'));
app.use('/dashboard', require('./routes/analyticsRoutes'));

// Chat routes (optional — only if chat module files exist)
try {
  app.use('/chat', require('./routes/chatRoutes'));
  const { Server } = require('socket.io');
  const initSocket = require('./config/socket');
  const io = new Server(server, { cors: { origin: '*' } });
  io.engine.use(sessionMiddleware);
  initSocket(io);
  app.set('io', io);
} catch (err) {
  console.warn('Chat/Socket.IO module not loaded:', err.message);
}

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found - MiniConnect' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or run: npx kill-port ${PORT}`);
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
