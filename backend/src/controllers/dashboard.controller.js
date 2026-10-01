const { asyncHandler } = require('../middleware/errorHandler');
const analytics = require('../services/analytics.service');
const { getAlerts } = require('../services/alerts.service');

const getMeta = asyncHandler(async (req, res) => {
  const meta = await analytics.getMeta();
  res.json(meta);
});

const getKpis = asyncHandler(async (req, res) => {
  const kpis = await analytics.getKpis(req.query);
  res.json(kpis);
});

const getTrend = asyncHandler(async (req, res) => {
  const trend = await analytics.getTrend(req.query);
  res.json(trend);
});

const getBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await analytics.getBreakdown(req.query, req.params.by);
  res.json(breakdown);
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await analytics.getTopProducts(req.query);
  res.json(products);
});

const getPerformance = asyncHandler(async (req, res) => {
  const performance = await analytics.getPerformance(req.query);
  res.json(performance);
});

const getDashboardAlerts = asyncHandler(async (req, res) => {
  const alerts = await getAlerts();
  res.json(alerts);
});

const getSales = asyncHandler(async (req, res) => {
  const sales = await analytics.getSales(req.query);
  res.json(sales);
});

const exportSales = asyncHandler(async (req, res) => {
  const csv = await analytics.exportSalesCsv(req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="adidas-sales.csv"');
  res.send(csv);
});

module.exports = {
  getMeta,
  getKpis,
  getTrend,
  getBreakdown,
  getTopProducts,
  getPerformance,
  getDashboardAlerts,
  getSales,
  exportSales,
};
