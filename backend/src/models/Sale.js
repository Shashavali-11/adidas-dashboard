const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, index: true },
    retailer: { type: String, index: true },
    retailerId: String,
    invoiceDate: { type: Date, required: true, index: true },
    region: { type: String, index: true },
    state: String,
    city: String,
    productLine: String, // e.g. "Men's Street Footwear" (as in the dataset)
    category: { type: String, index: true }, // Footwear | Apparel
    gender: { type: String, index: true }, // Men | Women
    style: String, // Street | Athletic | Apparel
    productSku: { type: String, index: true },
    productName: { type: String, index: true },
    pricePerUnit: Number,
    unitsSold: Number,
    totalSales: Number, // revenue
    cost: Number, // totalSales - operatingProfit
    operatingProfit: Number,
    operatingMargin: Number,
    salesMethod: { type: String, index: true },
    status: { type: String, default: 'Delivered' },
    source: { type: String, default: 'dataset' }, // dataset | checkout
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
