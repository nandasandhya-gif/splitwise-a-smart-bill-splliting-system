const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use('/api', authRoutes);

mongoose.connect('mongodb://localhost:27017/splitwise', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB error:', err);
});

app.listen(3000, () => console.log('Server running on port 3000'));
