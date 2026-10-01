const Product = require('../models/Product');
const Sale = require('../models/Sale');
const ApiError = require('../utils/ApiError');
const { buildMatch } = require('../utils/filters');
const { round, escapeRegex } = require('../utils/helpers');

const SORT_FIELDS = ['name', 'price', 'stock', 'units', 'revenue', 'profit'];

async function listProducts(query) {
  const { match } = buildMatch(query);

  const productFilter = {};
  if (query.category) {
    productFilter.category = query.category;
  }
  if (query.gender) {
    productFilter.gender = query.gender;
  }
  if (query.search) {
    productFilter.name = new RegExp(escapeRegex(query.search), 'i');
  }
  if (query.stock === 'low') {
    productFilter.$expr = { $lte: ['$stock', '$reorderLevel'] };
  }
  if (query.stock === 'out') {
    productFilter.stock = 0;
  }

  let sortKey = 'name';
  if (SORT_FIELDS.includes(query.sort)) {
    sortKey = query.sort;
  }
  const direction = query.order === 'desc' ? -1 : 1;
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);

  // sales numbers per product, filtered by the same date/region filters
  const salesStats = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$productSku',
        units: { $sum: '$unitsSold' },
        revenue: { $sum: '$totalSales' },
        profit: { $sum: '$operatingProfit' },
      },
    },
  ]);
  const statsBySku = {};
  for (const stat of salesStats) {
    statsBySku[stat._id] = stat;
  }

  const found = await Product.find(productFilter).lean();
  const products = found.map((product) => {
    const stats = statsBySku[product.sku] || {};
    return {
      ...product,
      units: stats.units || 0,
      revenue: round(stats.revenue),
      profit: round(stats.profit),
    };
  });

  products.sort((a, b) => {
    let result;
    if (typeof a[sortKey] === 'string') {
      result = a[sortKey].localeCompare(b[sortKey]);
    } else {
      result = a[sortKey] - b[sortKey];
    }
    return result * direction;
  });

  const total = products.length;
  const items = products.slice((page - 1) * limit, page * limit);
  return { items, total, page, pages: Math.max(Math.ceil(total / limit), 1), limit };
}

async function getProduct(sku, query) {
  const product = await Product.findOne({ sku }).lean();
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const { match } = buildMatch(query);
  match.productSku = product.sku;

  const [history, regions, totalsResult] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$invoiceDate' } },
          revenue: { $sum: '$totalSales' },
          profit: { $sum: '$operatingProfit' },
          units: { $sum: '$unitsSold' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$region',
          revenue: { $sum: '$totalSales' },
          units: { $sum: '$unitsSold' },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalSales' },
          profit: { $sum: '$operatingProfit' },
          units: { $sum: '$unitsSold' },
          orders: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totals = totalsResult[0] || {};
  let margin = 0;
  if (totals.revenue) {
    margin = round((totals.profit / totals.revenue) * 100, 1);
  }

  return {
    product,
    metrics: {
      revenue: round(totals.revenue),
      profit: round(totals.profit),
      units: totals.units || 0,
      orders: totals.orders || 0,
      margin,
    },
    history: history.map((row) => ({
      label: row._id,
      revenue: round(row.revenue),
      profit: round(row.profit),
      units: row.units,
    })),
    regions: regions.map((row) => ({
      name: row._id,
      revenue: round(row.revenue),
      units: row.units,
    })),
  };
}

module.exports = { listProducts, getProduct };
