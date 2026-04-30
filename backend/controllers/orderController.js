const Order = require('../models/Order');
const { GARMENT_PRICES } = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { customer, garments, specialInstructions, paymentMethod, estimatedDeliveryDays } = req.body;

    if (!garments || garments.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one garment is required' });
    }

    // Calculate prices for each garment
    const processedGarments = garments.map(g => {
      const pricePerItem = g.pricePerItem || GARMENT_PRICES[g.type] || 40;
      const subtotal = pricePerItem * g.quantity;
      return { type: g.type, quantity: g.quantity, pricePerItem, subtotal };
    });

    const totalAmount = processedGarments.reduce((sum, g) => sum + g.subtotal, 0);

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (estimatedDeliveryDays || 3));

    const order = await Order.create({
      customer,
      garments: processedGarments,
      totalAmount,
      specialInstructions,
      paymentMethod: paymentMethod || 'CASH',
      estimatedDelivery,
      createdBy: req.user._id,
      statusHistory: [{ status: 'RECEIVED', updatedBy: req.user._id }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders with filters
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { status, customerName, phone, garmentType, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (status) query.status = status.toUpperCase();
    if (customerName) query['customer.name'] = { $regex: customerName, $options: 'i' };
    if (phone) query['customer.phone'] = { $regex: phone, $options: 'i' };
    if (garmentType) query['garments.type'] = { $regex: garmentType, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email'),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { orderId: req.params.id }]
    }).populate('createdBy', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { orderId: req.params.id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user._id, note });

    // If delivered, mark payment as paid for cash orders
    if (status === 'DELIVERED' && order.paymentMethod === 'CASH') {
      order.paymentStatus = 'PAID';
      order.amountPaid = order.totalAmount;
    }

    await order.save();

    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order details
// @route   PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const { customer, specialInstructions, estimatedDelivery } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { customer, specialInstructions, estimatedDelivery } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order updated', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete order (admin only)
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get garment price list
// @route   GET /api/orders/garment-prices
exports.getGarmentPrices = async (req, res) => {
  res.json({ success: true, data: GARMENT_PRICES });
};
