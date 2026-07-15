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

app.get('/', (req, res) => {
  res.send('MindArc Backend Engine is Live and Operational...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});