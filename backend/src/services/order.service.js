const Order = require('../models/Order');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const ApiError = require('../utils/ApiError');

const COST_RATIO = 0.55;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function validateOrder(customer, items) {
  if (!customer || !customer.name || !customer.name.trim()) {
    throw new ApiError(400, 'Valid customer name and email are required');
  }
  if (!EMAIL_REGEX.test(customer.email || '')) {
    throw new ApiError(400, 'Valid customer name and email are required');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }
}

// takes the stock for every item, and puts it back if any item fails
async function reserveStock(items) {
  const lines = [];
  const reserved = [];

  try {
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, `Invalid quantity for ${item.sku}`);
      }

      // decrement only if there is enough stock, so two orders can't oversell the same item
      const product = await Product.findOneAndUpdate(
        { sku: item.sku, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        const existing = await Product.findOne({ sku: item.sku });
        if (!existing) {
          throw new ApiError(404, `Product ${item.sku} not found`);
        }
        throw new ApiError(409, `Insufficient stock for ${existing.name} (only ${existing.stock} left)`);
      }

      reserved.push({ sku: product.sku, quantity });
      lines.push({ product, quantity });
    }
  } catch (err) {
    for (const entry of reserved) {
      await Product.updateOne({ sku: entry.sku }, { $inc: { stock: entry.quantity } });
    }
    throw err;
  }

  return lines;
}

async function createOrder(body, userId) {
  const { customer, items } = body;
  validateOrder(customer, items);

  const lines = await reserveStock(items);
  const orderNumber = `WEB-${Date.now().toString().slice(-8)}`;

  const orderItems = [];
  let total = 0;
  for (const line of lines) {
    const subtotal = Number((line.product.price * line.quantity).toFixed(2));
    orderItems.push({
      sku: line.product.sku,
      name: line.product.name,
      unitPrice: line.product.price,
      quantity: line.quantity,
      subtotal,
    });
    total += subtotal;
  }
  total = Number(total.toFixed(2));

  const order = await Order.create({
    orderNumber,
    user: userId,
    customer,
    items: orderItems,
    total,
  });

  // also save each line as a sale so it shows up in the dashboard numbers
  const now = new Date();
  const sales = lines.map((line, index) => {
    const product = line.product;
    const revenue = orderItems[index].subtotal;
    const cost = Number((revenue * COST_RATIO).toFixed(2));
    return {
      orderNumber,
      retailer: 'Adidas Online Store',
      retailerId: '0000001',
      invoiceDate: now,
      region: customer.region || 'West',
      state: '-',
      city: '-',
      productLine: product.productLine,
      category: product.category,
      gender: product.gender,
      style: product.style,
      productSku: product.sku,
      productName: product.name,
      pricePerUnit: product.price,
      unitsSold: line.quantity,
      totalSales: revenue,
      cost,
      operatingProfit: Number((revenue - cost).toFixed(2)),
      operatingMargin: 1 - COST_RATIO,
      salesMethod: 'Online',
      status: 'Processing',
      source: 'checkout',
    };
  });
  await Sale.insertMany(sales);

  return order;
}

function listOrders(limit, userId) {
  const filter = {};
  if (userId) {
    filter.user = userId;
  }
  const max = Math.min(Number(limit) || 20, 100);
  return Order.find(filter).sort({ createdAt: -1 }).limit(max).lean();
}

module.exports = { createOrder, listOrders };
