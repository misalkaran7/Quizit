const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import backend routes
const quizRoutes = require('../backend/routes/quizRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection caching for Serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState >= 1;
    console.log('MongoDB connected successfully in serverless function');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Support both /quizzes and /api/quizzes to prevent 404 from rewrite path stripping
app.use('/quizzes', quizRoutes);
app.use('/api/quizzes', quizRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Fallback 404 logger
app.use((req, res) => {
  console.log('Unhandled API route:', req.method, req.url);
  res.status(404).json({ error: `Route not found on serverless API: ${req.method} ${req.url}` });
});

module.exports = app;
