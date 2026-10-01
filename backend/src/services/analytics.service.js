const Sale = require('../models/Sale');
const ApiError = require('../utils/ApiError');
const { buildMatch, periodKey } = require('../utils/filters');
const { round, percentChange, escapeRegex, toDateString } = require('../utils/helpers');

const SUMS = {
  revenue: { $sum: '$totalSales' },
  profit: { $sum: '$operatingProfit' },
  cost: { $sum: '$cost' },
  units: { $sum: '$unitsSold' },
  orders: { $sum: 1 },
};

const BREAKDOWN_FIELDS = {
  category: '$category',
  region: '$region',
  retailer: '$retailer',
  method: '$salesMethod',
  state: '$state',
  gender: '$gender',
  line: '$productLine',
  style: '$style',
};

const SALES_SORT_FIELDS = [
  'invoiceDate',
  'productName',
  'unitsSold',
  'totalSales',
  'operatingProfit',
  'retailer',
  'region',
  'status',
];

const CSV_COLUMNS = [
  'orderNumber',
  'invoiceDate',
  'retailer',
  'region',
  'state',
  'city',
  'productName',
  'productLine',
  'pricePerUnit',
  'unitsSold',
  'totalSales',
  'cost',
  'operatingProfit',
  'operatingMargin',
  'salesMethod',
  'status',
];

function formatTotals(totals) {
  const data = totals || {};
  const revenue = round(data.revenue);
  const profit = round(data.profit);
  const orders = data.orders || 0;

  let avgOrderValue = 0;
  if (orders) {
    avgOrderValue = round(revenue / orders);
  }
  let profitMargin = 0;
  if (revenue) {
    profitMargin = round((profit / revenue) * 100);
  }

  return {
    revenue,
    profit,
    cost: round(data.cost),
    units: data.units || 0,
    orders,
    avgOrderValue,
    profitMargin,
  };
}

async function getTotals(match) {
  const result = await Sale.aggregate([{ $match: match }, { $group: { _id: null, ...SUMS } }]);
  return formatTotals(result[0]);
}

// min and max invoice date, optionally only for the rows that came from the csv
async function getDataRange(datasetOnly) {
  const pipeline = [];
  if (datasetOnly) {
    pipeline.push({ $match: { source: 'dataset' } });
  }
  pipeline.push({
    $group: { _id: null, min: { $min: '$invoiceDate' }, max: { $max: '$invoiceDate' } },
  });

  const result = await Sale.aggregate(pipeline);
  if (!result.length) {
    return { min: null, max: null };
  }
  return { min: result[0].min, max: result[0].max };
}

function formatDate(date) {
  if (!date) {
    return null;
  }
  return toDateString(date);
}

async function getMeta() {
  const [regions, retailers, methods, categories, states, range] = await Promise.all([
    Sale.distinct('region'),
    Sale.distinct('retailer'),
    Sale.distinct('salesMethod'),
    Sale.distinct('category'),
    Sale.distinct('state'),
    getDataRange(false),
  ]);
  // orders placed at checkout are dated today, so they are left out of dataEnd
  const datasetRange = await getDataRange(true);

  return {
    dataEnd: formatDate(datasetRange.max),
    regions: regions.sort(),
    retailers: retailers.sort(),
    methods: methods.sort(),
    categories: categories.sort(),
    states: states.sort(),
    minDate: formatDate(range.min),
    maxDate: formatDate(range.max),
  };
}

async function getKpis(query) {
  const { match, from, to } = buildMatch(query);
  const current = await getTotals(match);

  let previous = null;
  let changes = null;
  let previousRange = null;

  if (from && to) {
    // previous period is the same length, right before the selected one
    const span = to.getTime() - from.getTime() + 1;
    const prevFrom = new Date(from.getTime() - span);
    const prevTo = new Date(from.getTime() - 1);
    const prevMatch = buildMatch(query, { from: prevFrom, to: prevTo }).match;

    previous = await getTotals(prevMatch);
    previousRange = { from: toDateString(prevFrom), to: toDateString(prevTo) };

    changes = {};
    for (const key of Object.keys(current)) {
      changes[key] = percentChange(current[key], previous[key]);
    }
    if (previous.orders) {
      changes.profitMargin = round(current.profitMargin - previous.profitMargin, 1);
    } else {
      changes.profitMargin = null;
    }
  }

  return { current, previous, changes, previousRange };
}

async function getTrend(query) {
  const { match } = buildMatch(query);
  const rows = await Sale.aggregate([
    { $match: match },
    { $group: { _id: periodKey(query.period), ...SUMS } },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    label: row._id,
    revenue: round(row.revenue),
    profit: round(row.profit),
    cost: round(row.cost),
    units: row.units,
    orders: row.orders,
  }));
}

async function getBreakdown(query, by) {
  if (!BREAKDOWN_FIELDS[by]) {
    throw new ApiError(400, `Unknown breakdown "${by}"`);
  }
  const { match } = buildMatch(query);
  const limit = Math.min(Number(query.limit) || 50, 100);

  const rows = await Sale.aggregate([
    { $match: match },
    { $group: { _id: BREAKDOWN_FIELDS[by], ...SUMS } },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);

  let totalRevenue = 0;
  for (const row of rows) {
    totalRevenue += row.revenue;
  }

  return rows.map((row) => {
    let margin = 0;
    if (row.revenue) {
      margin = round((row.profit / row.revenue) * 100, 1);
    }
    let share = 0;
    if (totalRevenue) {
      share = round((row.revenue / totalRevenue) * 100, 1);
    }
    return {
      name: row._id,
      revenue: round(row.revenue),
      profit: round(row.profit),
      cost: round(row.cost),
      units: row.units,
      orders: row.orders,
      margin,
      share,
    };
  });
}

async function getTopProducts(query) {
  const { match } = buildMatch(query);
  let sortBy = 'units';
  if (['revenue', 'profit', 'units'].includes(query.sortBy)) {
    sortBy = query.sortBy;
  }
  const limit = Math.min(Number(query.limit) || 5, 50);

  const rows = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$productSku',
        name: { $first: '$productName' },
        line: { $first: '$productLine' },
        ...SUMS,
      },
    },
    { $sort: { [sortBy]: -1 } },
    { $limit: limit },
  ]);

  return rows.map((row) => ({
    sku: row._id,
    name: row.name,
    line: row.line,
    revenue: round(row.revenue),
    profit: round(row.profit),
    units: row.units,
  }));
}

// compares the latest month in the dataset with the month before it
async function getPerformance(query) {
  const { match } = buildMatch({ ...query, from: undefined, to: undefined });
  const range = await getDataRange(true);
  if (!range.max) {
    return null;
  }

  const year = range.max.getUTCFullYear();
  const month = range.max.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const prevMonthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 1) - 1);

  const [current, previous] = await Promise.all([
    getTotals({ ...match, invoiceDate: { $gte: monthStart, $lte: monthEnd } }),
    getTotals({ ...match, invoiceDate: { $gte: prevMonthStart, $lt: monthStart } }),
  ]);

  return {
    month: monthStart.toISOString().slice(0, 7),
    current,
    previous,
    changes: {
      revenue: percentChange(current.revenue, previous.revenue),
      profit: percentChange(current.profit, previous.profit),
      units: percentChange(current.units, previous.units),
    },
  };
}

function buildSalesQuery(query) {
  const { match } = buildMatch(query);
  if (query.status) {
    match.status = query.status;
  }
  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i');
    match.$or = [
      { productName: regex },
      { retailer: regex },
      { orderNumber: regex },
      { city: regex },
      { state: regex },
    ];
  }

  let sortField = 'invoiceDate';
  if (SALES_SORT_FIELDS.includes(query.sort)) {
    sortField = query.sort;
  }
  const direction = query.order === 'asc' ? 1 : -1;

  return { match, sort: { [sortField]: direction, _id: -1 } };
}

async function getSales(query) {
  const { match, sort } = buildSalesQuery(query);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const [items, total] = await Promise.all([
    Sale.find(match)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Sale.countDocuments(match),
  ]);

  return { items, total, page, pages: Math.max(Math.ceil(total / limit), 1), limit };
}

function toCsvValue(value) {
  let text = '';
  if (value instanceof Date) {
    text = toDateString(value);
  } else if (value !== null && value !== undefined) {
    text = String(value);
  }
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function exportSalesCsv(query) {
  const { match, sort } = buildSalesQuery(query);
  const rows = await Sale.find(match).sort(sort).limit(50000).lean();

  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) {
    const values = CSV_COLUMNS.map((column) => toCsvValue(row[column]));
    lines.push(values.join(','));
  }
  return lines.join('\n');
}

module.exports = {
  getMeta,
  getKpis,
  getTrend,
  getBreakdown,
  getTopProducts,
  getPerformance,
  getSales,
  exportSalesCsv,
  getDataRange,
  round,
};
