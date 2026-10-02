const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { getDataRange } = require('./analytics.service');
const { percentChange } = require('../utils/helpers');

async function getStockAlerts() {
  const products = await Product.find({ $expr: { $lte: ['$stock', '$reorderLevel'] } })
    .sort({ stock: 1 })
    .lean();

  return products.map((product) => {
    const outOfStock = product.stock === 0;
    return {
      type: outOfStock ? 'danger' : 'warning',
      kind: 'inventory',
      sku: product.sku,
      title: outOfStock ? `${product.name} is out of stock` : `${product.name} is running low`,
      detail: `${product.stock} units left (reorder level ${product.reorderLevel})`,
    };
  });
}

// regions whose revenue moved 25% or more between the last two months
async function getSalesAlerts() {
  const alerts = [];
  const range = await getDataRange(true);
  if (!range.max) {
    return alerts;
  }

  const year = range.max.getUTCFullYear();
  const month = range.max.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const prevMonthStart = new Date(Date.UTC(year, month - 1, 1));

  const rows = await Sale.aggregate([
    { $match: { invoiceDate: { $gte: prevMonthStart } } },
    {
      $group: {
        _id: { region: '$region', current: { $gte: ['$invoiceDate', monthStart] } },
        revenue: { $sum: '$totalSales' },
      },
    },
  ]);

  const byRegion = {};
  for (const row of rows) {
    const region = row._id.region;
    if (!byRegion[region]) {
      byRegion[region] = {};
    }
    if (row._id.current) {
      byRegion[region].current = row.revenue;
    } else {
      byRegion[region].previous = row.revenue;
    }
  }

  for (const region of Object.keys(byRegion)) {
    const revenue = byRegion[region];
    const change = percentChange(revenue.current || 0, revenue.previous || 0);
    if (change === null || Math.abs(change) < 25) {
      continue;
    }
    const direction = change > 0 ? 'up' : 'down';
    alerts.push({
      type: change > 0 ? 'success' : 'warning',
      kind: 'sales',
      title: `${region}: revenue ${direction} ${Math.abs(change)}%`,
      detail: `Latest month (${monthStart.toISOString().slice(0, 7)}) vs previous month`,
    });
  }
  return alerts;
}

async function getAlerts() {
  const stockAlerts = await getStockAlerts();
  const salesAlerts = await getSalesAlerts();
  return [...stockAlerts, ...salesAlerts];
}

module.exports = { getAlerts };
