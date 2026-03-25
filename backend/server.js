const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyzeRoute = require('./routes/analyze');
const chatRoute = require('./routes/chat');
const setuRoute = require('./routes/setu');
const simulateRoute = require('./routes/simulate');
const taxRoute = require('./routes/tax');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/simulate', simulateRoute);
app.use('/api/tax', taxRoute);

app.use('/api/analyze', analyzeRoute);
app.use('/api/chat', chatRoute);
app.use('/api/setu', setuRoute);

app.get('/', (req, res) => {
  res.json({ status: 'FinSmart backend running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});