const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true },
    name: { type: String, required: true, index: true },
    productLine: String,
    category: { type: String, index: true },
    gender: String,
    style: String,
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 50 },
    color: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
