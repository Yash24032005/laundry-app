// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();

// const User = require('./models/User');
// const Order = require('./models/Order');

// const seed = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/laundry_db');
//     console.log('✅ MongoDB connected');

//     // Clear existing data
//     await User.deleteMany({});
//     await Order.deleteMany({});
//     console.log('🗑️  Cleared existing data');

//     // Create admin user
//     const admin = await User.create({
//       name: 'Admin User',
//       email: 'admin@laundry.com',
//       password: 'admin123',
//       role: 'admin'
//     });

//     const staff = await User.create({
//       name: 'Staff User',
//       email: 'staff@laundry.com',
//       password: 'staff123',
//       role: 'staff'
//     });

//     console.log('👤 Users created');

//     // Create sample orders
//     const sampleOrders = [
//       {
//         customer: { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com' },
//         garments: [
//           { type: 'Shirt', quantity: 3, pricePerItem: 30, subtotal: 90 },
//           { type: 'Pants', quantity: 2, pricePerItem: 40, subtotal: 80 }
//         ],
//         totalAmount: 170,
//         status: 'DELIVERED',
//         paymentStatus: 'PAID',
//         amountPaid: 170,
//         createdBy: admin._id
//       },
//       {
//         customer: { name: 'Priya Patel', phone: '9123456789', email: 'priya@gmail.com' },
//         garments: [
//           { type: 'Saree', quantity: 2, pricePerItem: 80, subtotal: 160 },
//           { type: 'Suit', quantity: 1, pricePerItem: 150, subtotal: 150 }
//         ],
//         totalAmount: 310,
//         status: 'READY',
//         paymentStatus: 'PENDING',
//         createdBy: admin._id
//       },
//       {
//         customer: { name: 'Amit Verma', phone: '9988776655' },
//         garments: [
//           { type: 'Jacket', quantity: 1, pricePerItem: 100, subtotal: 100 },
//           { type: 'Jeans', quantity: 2, pricePerItem: 45, subtotal: 90 }
//         ],
//         totalAmount: 190,
//         status: 'PROCESSING',
//         paymentStatus: 'PENDING',
//         createdBy: staff._id
//       },
//       {
//         customer: { name: 'Sunita Gupta', phone: '9001122334', email: 'sunita@email.com', address: '42, MG Road, Delhi' },
//         garments: [
//           { type: 'Lehenga', quantity: 1, pricePerItem: 200, subtotal: 200 },
//           { type: 'Salwar Suit', quantity: 3, pricePerItem: 90, subtotal: 270 }
//         ],
//         totalAmount: 470,
//         status: 'RECEIVED',
//         paymentStatus: 'PENDING',
//         specialInstructions: 'Handle with care, delicate fabric',
//         createdBy: staff._id
//       },
//       {
//         customer: { name: 'Vikram Singh', phone: '9765432101' },
//         garments: [
//           { type: 'Blanket', quantity: 2, pricePerItem: 120, subtotal: 240 },
//           { type: 'Bed Sheet', quantity: 4, pricePerItem: 60, subtotal: 240 }
//         ],
//         totalAmount: 480,
//         status: 'DELIVERED',
//         paymentStatus: 'PAID',
//         amountPaid: 480,
//         paymentMethod: 'RAZORPAY',
//         createdBy: admin._id
//       }
//     ];

//     // Add status history to each
//     const ordersWithHistory = sampleOrders.map(o => ({
//       ...o,
//       statusHistory: [{ status: 'RECEIVED', updatedBy: o.createdBy }]
//     }));

//     await Order.create(ordersWithHistory);
//     console.log('📦 Sample orders created');

//     console.log('\n🎉 Seeding complete!\n');
//     console.log('Login credentials:');
//     console.log('  Admin: admin@laundry.com / admin123');
//     console.log('  Staff: staff@laundry.com / staff123\n');

//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Seeding failed:', err);
//     process.exit(1);
//   }
// };

// seed();


const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Order = require('./models/Order');

// ✅ Unique Order ID generator
const generateOrderId = () =>
  `LD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/laundry_os');
    console.log('✅ MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@laundry.com',
      password: 'admin123',
      role: 'admin'
    });

    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@laundry.com',
      password: 'staff123',
      role: 'staff'
    });

    console.log('👤 Users created');

    // Sample orders with UNIQUE orderId ✅
    const sampleOrders = [
      {
        orderId: generateOrderId(),
        customer: { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com' },
        garments: [
          { type: 'Shirt', quantity: 3, pricePerItem: 30, subtotal: 90 },
          { type: 'Pants', quantity: 2, pricePerItem: 40, subtotal: 80 }
        ],
        totalAmount: 170,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        amountPaid: 170,
        createdBy: admin._id
      },
      {
        orderId: generateOrderId(),
        customer: { name: 'Priya Patel', phone: '9123456789', email: 'priya@gmail.com' },
        garments: [
          { type: 'Saree', quantity: 2, pricePerItem: 80, subtotal: 160 },
          { type: 'Suit', quantity: 1, pricePerItem: 150, subtotal: 150 }
        ],
        totalAmount: 310,
        status: 'READY',
        paymentStatus: 'PENDING',
        createdBy: admin._id
      },
      {
        orderId: generateOrderId(),
        customer: { name: 'Amit Verma', phone: '9988776655' },
        garments: [
          { type: 'Jacket', quantity: 1, pricePerItem: 100, subtotal: 100 },
          { type: 'Jeans', quantity: 2, pricePerItem: 45, subtotal: 90 }
        ],
        totalAmount: 190,
        status: 'PROCESSING',
        paymentStatus: 'PENDING',
        createdBy: staff._id
      },
      {
        orderId: generateOrderId(),
        customer: { name: 'Sunita Gupta', phone: '9001122334', email: 'sunita@email.com', address: 'Delhi' },
        garments: [
          { type: 'Lehenga', quantity: 1, pricePerItem: 200, subtotal: 200 },
          { type: 'Salwar Suit', quantity: 3, pricePerItem: 90, subtotal: 270 }
        ],
        totalAmount: 470,
        status: 'RECEIVED',
        paymentStatus: 'PENDING',
        specialInstructions: 'Handle with care',
        createdBy: staff._id
      },
      {
        orderId: generateOrderId(),
        customer: { name: 'Vikram Singh', phone: '9765432101' },
        garments: [
          { type: 'Blanket', quantity: 2, pricePerItem: 120, subtotal: 240 },
          { type: 'Bed Sheet', quantity: 4, pricePerItem: 60, subtotal: 240 }
        ],
        totalAmount: 480,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        amountPaid: 480,
        paymentMethod: 'RAZORPAY',
        createdBy: admin._id
      }
    ];

    // Add status history
    const ordersWithHistory = sampleOrders.map(o => ({
      ...o,
      statusHistory: [{ status: 'RECEIVED', updatedBy: o.createdBy }]
    }));

    await Order.create(ordersWithHistory);
    console.log('📦 Sample orders created');

    console.log('\n🎉 Seeding complete!\n');
    console.log('Admin: admin@laundry.com / admin123');
    console.log('Staff: staff@laundry.com / staff123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();