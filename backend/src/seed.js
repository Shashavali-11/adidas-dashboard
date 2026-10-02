// Imports data/adidas_sales.csv into MongoDB. Run with: npm run seed
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const Sale = require('./models/Sale');
const Product = require('./models/Product');
const User = require('./models/User');
const { CATALOG, COLORS, parseLine } = require('./utils/catalog');

const CSV_PATH = process.env.SEED_CSV || path.join(__dirname, '..', 'data', 'adidas_sales.csv');

// Small seeded random number generator (LCG). Gives the same numbers every run
// so the stock levels and order statuses don't change between seeds.
function createRandom(seed) {
  let state = seed;
  return function random() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function toNumber(value) {
  return Number(String(value).replace(/[$,]/g, '')) || 0;
}

function parseDate(value) {
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date = new Date(`${value}T12:00:00Z`);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function pickStatus(random) {
  const value = random();
  if (value < 0.9) {
    return 'Delivered';
  }
  if (value < 0.95) {
    return 'Shipped';
  }
  if (value < 0.98) {
    return 'Processing';
  }
  return 'Returned';
}

function pickStock(index, random) {
  if (index % 9 === 4) {
    return 0;
  }
  if (index % 7 === 3) {
    return Math.floor(random() * 30) + 5;
  }
  return Math.floor(random() * 700) + 120;
}

async function seedDemoUser() {
  const email = (process.env.DEMO_EMAIL || 'admin@adidas.com').toLowerCase();
  const exists = await User.exists({ email });
  if (exists) {
    return;
  }
  await User.create({
    name: 'Demo Admin',
    email,
    password: process.env.DEMO_PASSWORD || 'Admin@123',
    role: 'admin',
  });
  console.log(`Demo user ready: ${email}`);
}

function buildProducts(rows, random) {
  // average price of each product line in the csv
  const priceTotals = {};
  for (const row of rows) {
    const line = row.Product;
    if (!priceTotals[line]) {
      priceTotals[line] = { sum: 0, count: 0 };
    }
    priceTotals[line].sum += toNumber(row['Price per Unit']);
    priceTotals[line].count += 1;
  }

  const products = [];
  let index = 0;
  for (const line of Object.keys(CATALOG)) {
    const totals = priceTotals[line];
    const averagePrice = totals ? totals.sum / totals.count : 45;
    const details = parseLine(line);

    CATALOG[line].forEach((name, position) => {
      products.push({
        sku: `ADI-${String(index + 1).padStart(3, '0')}`,
        name,
        productLine: line,
        ...details,
        price: Math.round(averagePrice * (0.85 + position * 0.09)) - 0.01,
        stock: pickStock(index, random),
        reorderLevel: 60,
        color: COLORS[index % COLORS.length],
        description: `${name} from the Adidas ${line} range. Comfortable, durable and built for everyday performance.`,
      });
      index += 1;
    });
  }
  return products;
}

function buildSales(rows, products, random) {
  const productsByLine = {};
  for (const product of products) {
    if (!productsByLine[product.productLine]) {
      productsByLine[product.productLine] = [];
    }
    productsByLine[product.productLine].push(product);
  }

  const sales = [];
  rows.forEach((row, index) => {
    const date = parseDate(row['Invoice Date']);
    if (!date) {
      return;
    }

    const line = row.Product;
    const lineProducts = productsByLine[line] || products;
    const product = lineProducts[Math.floor(random() * lineProducts.length)];
    const revenue = toNumber(row['Total Sales']);
    const profit = toNumber(row['Operating Profit']);

    sales.push({
      orderNumber: `INV-${100000 + index}`,
      retailer: row.Retailer,
      retailerId: row['Retailer ID'],
      invoiceDate: date,
      region: row.Region,
      state: row.State,
      city: row.City,
      productLine: line,
      ...parseLine(line),
      productSku: product.sku,
      productName: product.name,
      pricePerUnit: toNumber(row['Price per Unit']),
      unitsSold: toNumber(row['Units Sold']),
      totalSales: revenue,
      operatingProfit: profit,
      cost: Number((revenue - profit).toFixed(2)),
      operatingMargin: toNumber(row['Operating Margin']),
      salesMethod: row['Sales Method'],
      status: pickStatus(random),
      source: 'dataset',
    });
  });
  return sales;
}

async function seed({ force = false } = {}) {
  if (!force) {
    const count = await Sale.estimatedDocumentCount();
    if (count > 0) {
      return false;
    }
  }
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`Seed CSV not found at ${CSV_PATH}`);
  }

  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  console.log(`Seeding ${rows.length} sales rows from ${path.basename(CSV_PATH)} ...`);

  await Sale.deleteMany({});
  await Product.deleteMany({});

  const random = createRandom(42);
  const products = buildProducts(rows, random);
  await Product.insertMany(products);

  const sales = buildSales(rows, products, random);
  const batchSize = 2000;
  for (let i = 0; i < sales.length; i += batchSize) {
    await Sale.insertMany(sales.slice(i, i + batchSize), { ordered: false });
  }

  console.log(`Seed complete: ${sales.length} sales, ${products.length} products`);
  return true;
}

module.exports = { seed, seedDemoUser };

if (require.main === module) {
  require('dotenv').config();
  const { connectDB, closeDB } = require('./config/db');

  connectDB()
    .then(() => seed({ force: true }))
    .then(seedDemoUser)
    .then(closeDB)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
