const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:orderId', protect, getPaymentDetails);

module.exports = router;
