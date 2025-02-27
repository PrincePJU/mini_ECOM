const express = require('express');
const router = express.Router();

const { restrictTo } = require('../middlewares/auth');
const {
    handleGetAllOrders,
    handleUpdateOrder,
    handleDeleteOrder, handleAdminAddOrder
} = require('../controllers/order');

const {
    handleAddCustomer,
    handleDeleteCustomer,
    handleGetAllCustomers,
    handleUpdateCustomer
} = require('../controllers/admin/customerController');

const {
    handleAddNewProduct,
    handleDeleteNewProduct,
    handleUpdateNewProduct,
    handleGetNewProduct,
     handleDeleteAttribute
} = require('../controllers/admin/categoryController');

const {
    handleAddInventory,
    handleDeleteInventory,
    handleGetInventory,handleSearchInventory
} = require('../controllers/admin/inventoryController');

const {
    handleAssignDeliveryAgent
} = require('../controllers/admin/orderAssignmentController');

// Inventory routes
router.route('/inventory')
    .post(handleAddInventory)
    .get(handleGetInventory)
    .delete(handleDeleteInventory);



// Categories routes
router.route('/categories')
    .post(handleAddNewProduct)
    .delete(handleDeleteNewProduct)
    .patch(handleUpdateNewProduct)
    .get(handleGetNewProduct);

router.delete('/categories/attribute', handleDeleteAttribute)

// Customer routes
router.route('/customer')
    .post(handleAddCustomer)
    .patch(handleUpdateCustomer)
    .delete(handleDeleteCustomer)
    .get(handleGetAllCustomers);


// Orders routes
router.route('/orders')
    .post(handleAdminAddOrder)
    .get(handleGetAllOrders)
    .patch(handleUpdateOrder)
    .delete(handleDeleteOrder);

// Order assignment route
router.post('/orders/assign', handleAssignDeliveryAgent);

// Admin routes
router.get('/orders', restrictTo(["ADMIN"]), async (req, res) => {
    try {
        const allOrders = await Order.find({})
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        return res.status(200).json({ orders: allOrders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return res.status(500).json({
            message: "Failed to load orders. Please try again later."
        });
    }
});

router.get('/categories/new', restrictTo(["ADMIN"]), (req, res) => {
    return res.status(200).json({ message: "Add category page" });
});


module.exports = router;