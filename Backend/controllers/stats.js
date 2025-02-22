const User = require("../models/user");
const Order = require("../models/order");
const Inventory = require("../models/inventory");

const handleGetMonthlyStats = async (req, res) => {
  try {
    // Get the first and last date of the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Fetch the counts for users, orders, and inventory
    const [totalUsers, newUsersThisMonth, totalOrders, ordersThisMonth, inventoryData] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({
        isDeleted: false,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Order.countDocuments({ isDeleted: false }),
      Order.countDocuments({
        isDeleted: false,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Inventory.find({}), // Fetch all inventory documents
    ]);

    let totalProducts = 0;
    const categoryDistribution = {};

    // Process inventory data
    inventoryData.forEach((item) => {
      const { category, quantity } = item;

      // Ensure valid category and quantity
      if (category && quantity > 0) {
        totalProducts += 1;
        categoryDistribution[category] = (categoryDistribution[category] || 0) + quantity;
      }
    });

    // Respond with the stats
    res.status(200).json({
      totalUsers,
      newUsersThisMonth,
      totalOrders,
      ordersThisMonth,
      totalProducts,
      categoryDistribution,
    });
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
};




module.exports = { handleGetMonthlyStats };


/// example data o/p
// {
//   "totalUsers": 1234,
//   "newUsersThisMonth": 120,
//   "totalOrders": 456,
//   "ordersThisMonth": 34,
//   "totalProducts": 302,
//   "categoryDistribution": {
//     "Plastic Box12": 211,
//     "Shrink": 91
//   }
// }
