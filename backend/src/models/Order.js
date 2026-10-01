const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      region: { type: String, default: 'West' },
      address: String,
    },
    items: [
      {
        sku: String,
        name: String,
        unitPrice: Number,
        quantity: Number,
        subtotal: Number,
      },
    ],
    total: Number,
    status: { type: String, default: 'Processing' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
