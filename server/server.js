
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');          // ✅ NEW
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const socketHandler = require('./socket/socketHandler');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

// Attach io to every request
app.use((req, res, next) => { req.io = io; next(); });

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());                         // ✅ NEW

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/exchanges', require('./routes/exchangeRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));    // ✅ NEW
app.use('/api/reviews', require('./routes/reviewRoutes'));     // ✅ NEW
app.use('/api/settings', require('./routes/settingsRoutes')); // ✅ NEW

app.get('/api/health', (req, res) => res.json({ status: 'OK', db: 'Supabase + Drizzle' }));

socketHandler(io);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 SkillSwap Server running on port ${PORT}`));