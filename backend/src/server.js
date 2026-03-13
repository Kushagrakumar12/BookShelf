const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10kb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };
    if (res.statusCode >= 400) {
      console.error(JSON.stringify(log));
    } else {
      console.log(JSON.stringify(log));
    }
  });
  next();
});

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/books', bookRoutes);

// Health check — basic (for Docker HEALTHCHECK / load balancers)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Detailed health check — for monitoring dashboards
app.get('/api/health/detailed', async (req, res) => {
  const mongoState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const memUsage = process.memoryUsage();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    mongodb: {
      status: mongoState[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    nodeVersion: process.version,
  };

  const httpStatus = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(httpStatus).json(health);
});

// Start server only when not in test mode
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
