require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sketchfabRoutes = require('./routes/sketchfab');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/sketchfab', sketchfabRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: http://localhost:5173`);
});