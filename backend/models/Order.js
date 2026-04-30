const mongoose = require('mongoose');

// Predefined garment pricing
const GARMENT_PRICES = {
  'Shirt': 30,
  'Pants': 40,
  'Saree': 80,
  'Suit': 150,
  'Jacket': 100,
  'Dress': 90,
  'Kurta': 50,
  'Lehenga': 200,
  'Blanket': 120,
  'Bed Sheet': 60,
  'Curtain': 80,
  'Jeans': 45,
  'T-Shirt': 25,
  'Sweater': 60,
  'Coat': 130,
  'Salwar Suit': 90,
  'Sherwani': 250,
  'Other': 40
};

const garmentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: Object.keys(GARMENT_PRICES)
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerItem: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: String
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  garments: [garmentSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'],
    default: 'RECEIVED'
  },
  statusHistory: [statusHistorySchema],
  estimatedDelivery: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'PAID'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'RAZORPAY', 'UPI', 'CARD'],
    default: 'CASH'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amountPaid: {
    type: Number,
    default: 0
  },
  specialInstructions: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Generate unique Order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `LD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  // Set estimated delivery (3 days from order)
  if (!this.estimatedDelivery) {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 3);
    this.estimatedDelivery = delivery;
  }

  // Add initial status to history
  if (this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status });
  }

  next();
});

// Static method to get garment prices
orderSchema.statics.getGarmentPrices = function() {
  return GARMENT_PRICES;
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.GARMENT_PRICES = GARMENT_PRICES;
