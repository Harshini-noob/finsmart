const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const uploadRoute = require('./routes/upload');
const app = express();


// Routes
const analyzeRoute  = require('./routes/analyze');
const chatRoute     = require('./routes/chat');
const setuRoute     = require('./routes/setu');
const simulateRoute = require('./routes/simulate');
const taxRoute      = require('./routes/tax');

const authRoute     = require('./routes/auth');
const scoresRoute   = require('./routes/scores');
const goalsRoute    = require('./routes/goals');



// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRoute);

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.error('MongoDB error:', err.message));

// Public routes
app.use('/api/analyze',  analyzeRoute);
app.use('/api/chat',     chatRoute);
app.use('/api/setu',     setuRoute);
app.use('/api/simulate', simulateRoute);
app.use('/api/tax',      taxRoute);


// Auth routes
app.use('/api/auth',     authRoute);

// Protected routes (need login)
app.use('/api/scores',   scoresRoute);
app.use('/api/goals',    goalsRoute);

app.get('/', (req, res) => {
  res.json({ status: 'FinSmart API running! ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});