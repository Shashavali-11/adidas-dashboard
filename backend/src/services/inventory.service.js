const Product = require('../models/Product');

async function getInventory() {
  const items = await Product.find().sort({ stock: 1 }).lean();

  let totalUnits = 0;
  let stockValue = 0;
  let low = 0;
  let out = 0;

  for (const item of items) {
    totalUnits += item.stock;
    stockValue += item.stock * item.price;
    if (item.stock === 0) {
      out += 1;
    } else if (item.stock <= item.reorderLevel) {
      low += 1;
    }
  }

  return {
    items,
    summary: {
      totalSkus: items.length,
      totalUnits,
      stockValue: Number(stockValue.toFixed(2)),
      low,
      out,
    },
  };
}

module.exports = { getInventory };
