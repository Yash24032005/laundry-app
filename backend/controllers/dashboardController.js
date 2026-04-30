const Order = require('../models/Order');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      statusCounts,
      totalRevenue,
      todayOrders,
      monthRevenue,
      recentOrders,
      garmentStats,
      paymentStats
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),

      // Orders per status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Total revenue (all paid + pending)
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' }, paid: { $sum: '$amountPaid' } } }
      ]),

      // Today's orders
      Order.countDocuments({ createdAt: { $gte: today } }),

      // This month revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Recent 5 orders
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderId customer status totalAmount createdAt'),

      // Most popular garments
      Order.aggregate([
        { $unwind: '$garments' },
        { $group: { _id: '$garments.type', totalQuantity: { $sum: '$garments.quantity' }, totalRevenue: { $sum: '$garments.subtotal' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]),

      // Payment stats
      Order.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Format status counts
    const statusMap = { RECEIVED: 0, PROCESSING: 0, READY: 0, DELIVERED: 0 };
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    const revenue = totalRevenue[0] || { total: 0, paid: 0 };
    const monthRev = monthRevenue[0]?.total || 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          todayOrders,
          totalRevenue: revenue.total,
          totalCollected: revenue.paid,
          pendingAmount: revenue.total - revenue.paid,
          monthRevenue: monthRev
        },
        ordersByStatus: statusMap,
        recentOrders,
        popularGarments: garmentStats,
        paymentBreakdown: paymentStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get revenue chart data (last 7 days)
// @route   GET /api/dashboard/revenue-chart
exports.getRevenueChart = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
