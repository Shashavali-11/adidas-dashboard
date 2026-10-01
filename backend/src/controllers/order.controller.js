const { asyncHandler } = require('../middleware/errorHandler');
const orderService = require('../services/order.service');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user._id);
  res.status(201).json(order);
});

const getOrders = asyncHandler(async (req, res) => {
  // admins see every order, everyone else only their own
  let userId = req.user._id;
  if (req.user.role === 'admin') {
    userId = null;
  }
  const orders = await orderService.listOrders(req.query.limit, userId);
  res.json(orders);
});

module.exports = { createOrder, getOrders };
