const { asyncHandler } = require('../middleware/errorHandler');
const productService = require('../services/product.service');

const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.listProducts(req.query);
  res.json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id, req.query);
  res.json(product);
});

module.exports = { getProducts, getProduct };
