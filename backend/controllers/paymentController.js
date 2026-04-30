const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const laundryOrder = await Order.findOne({
      $or: [
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderId }
      ]
    });

    if (!laundryOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (laundryOrder.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(laundryOrder.totalAmount * 100), // paise
      currency: 'INR',
      receipt: laundryOrder.orderId,
      notes: {
        customerName: laundryOrder.customer.name,
        customerPhone: laundryOrder.customer.phone,
        laundryOrderId: laundryOrder.orderId
      }
    });

    // Save razorpay order id
    laundryOrder.razorpayOrderId = razorpayOrder.id;
    await laundryOrder.save();

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        customerName: laundryOrder.customer.name,
        customerPhone: laundryOrder.customer.phone,
        customerEmail: laundryOrder.customer.email || '',
        laundryOrderId: laundryOrder.orderId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, laundryOrderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed - Invalid signature' });
    }

    // Update order payment status
    const order = await Order.findOne({ orderId: laundryOrderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'PAID';
    order.paymentMethod = 'RAZORPAY';
    order.razorpayPaymentId = razorpay_payment_id;
    order.amountPaid = order.totalAmount;
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      data: {
        orderId: order.orderId,
        paymentId: razorpay_payment_id,
        amount: order.totalAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get payment details
// @route   GET /api/payment/:orderId
exports.getPaymentDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).select('orderId totalAmount amountPaid paymentStatus paymentMethod razorpayPaymentId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
