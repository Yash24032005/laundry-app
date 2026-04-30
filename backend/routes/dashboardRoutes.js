const express = require('express');
const router = express.Router();
const { getDashboard, getRevenueChart } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboard);
router.get('/revenue-chart', protect, getRevenueChart);

module.exports = router;
