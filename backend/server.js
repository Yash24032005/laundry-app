// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => {
//     console.error('❌ MongoDB Connection Error:', err);
//     process.exit(1);
//   });

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// app.use('/api/payment', require('./routes/paymentRoutes'));

// // Health Check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Laundry Management API is running 🚀' });
// });

// // 404 Handler
// app.use('*', (req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📱 API: http://localhost:${PORT}/api`);
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// app.use(cors({
//   // Aapka Vercel URL aur local development dono allow honge
//   origin: [
//     "https://laundry-app-eosin.vercel.app", 
//     "http://localhost:3000"
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));
// backend/server.js mein CORS section ko isse replace karein
app.use(cors({
    origin: true, // Yeh dynamic origin allow karega
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Root Route (for Wake-up call)
app.get('/', (req, res) => {
  res.send('Laundry Management Backend is Live 🚀');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Laundry Management API is running 🚀' });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
});