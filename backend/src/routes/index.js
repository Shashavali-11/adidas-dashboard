const router = require('express').Router();
const auth = require('../controllers/auth');
const dashboard = require('../controllers/dashboard.controller');
const product = require('../controllers/product.controller');
const order = require('../controllers/order.controller');
const inventory = require('../controllers/inventory.controller');
const { protect } = require('../middleware/auth');

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);

// routes below need a token
router.use(protect);
router.get('/auth/me', auth.me);
router.put('/auth/me', auth.updateMe);

router.get('/meta', dashboard.getMeta);

router.get('/dashboard/kpis', dashboard.getKpis);
router.get('/dashboard/trend', dashboard.getTrend);
router.get('/dashboard/breakdown/:by', dashboard.getBreakdown);
router.get('/dashboard/top-products', dashboard.getTopProducts);
router.get('/dashboard/performance', dashboard.getPerformance);
router.get('/dashboard/alerts', dashboard.getDashboardAlerts);

router.get('/sales', dashboard.getSales);
router.get('/sales/export', dashboard.exportSales);

router.get('/products', product.getProducts);
router.get('/products/:id', product.getProduct);
router.get('/inventory', inventory.getInventoryList);

router.get('/orders', order.getOrders);
router.post('/orders', order.createOrder);

module.exports = router;
