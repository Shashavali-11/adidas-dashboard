const { asyncHandler } = require('../middleware/errorHandler');
const { getInventory } = require('../services/inventory.service');

const getInventoryList = asyncHandler(async (req, res) => {
  const inventory = await getInventory();
  res.json(inventory);
});

module.exports = { getInventoryList };
