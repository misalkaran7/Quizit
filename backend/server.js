const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const quizRoutes = require('./routes/quizRoutes.js');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api/quizzes', quizRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is operational' });
});

app.get('/', (req, res) => {
  res.send('MindArc Backend Engine is Live and Operational...');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running smoothly on port ${PORT}`);
});