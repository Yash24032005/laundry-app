const express = require('express');
const router = express.Router();
const {
  createOrder, getOrders, getOrder,
  updateStatus, updateOrder, deleteOrder, getGarmentPrices
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/garment-prices', protect, getGarmentPrices);
router.route('/').get(protect, getOrders).post(protect, createOrder);
router.route('/:id').get(protect, getOrder).put(protect, updateOrder).delete(protect, adminOnly, deleteOrder);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
