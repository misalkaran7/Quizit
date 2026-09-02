const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Point to your backend route handlers
const quizRoutes = require('../backend/routes/quizRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection helper for Serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
  } catch (err) {
    console.error('Mongo connection error:', err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Mount the quiz routes
app.use('/api/quizzes', quizRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

module.exports = app;
