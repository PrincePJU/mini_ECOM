const Inventory = require("../models/inventory");
const Order = require("../models/order");
const mongoose = require("mongoose");

//admin
//pass quantity only if need to change
const handleUpdateOrder = async (req, res) => {
  try {
    const { orderId, orderStatus, quantity } = req.body;

    // Validate input parameters
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const validStatuses = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    // Find the existing order and populate product (which is actually the inventory)
    const order = await Order.findById(orderId).populate('product');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Prepare update operations
    let inventoryUpdate = {};
    let orderUpdate = {};

    // Inventory adjustment logic
    if (orderStatus === "Approved" && quantity) {
      if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be greater than zero" });
      }

      // Find inventory 
      const inventoryItem = await Inventory.findById(order.product);

      if (!inventoryItem) {
        return res.status(404).json({ error: "Inventory not found" });
      }

      // Check inventory sufficiency
      if (inventoryItem.quantity < quantity) {
        return res.status(400).json({
          error: "Insufficient inventory",
          availableStock: inventoryItem.quantity,
          requestedQuantity: quantity
        });
      }

      // Determine inventory adjustment
      if (order.orderStatus !== "Approved") {
        // First time approval - subtract full quantity
        inventoryUpdate = {
          $inc: { quantity: -quantity }
        };
      } else {
        // Already approved - adjust based on quantity difference
        const quantityDifference = quantity - order.quantity;
        inventoryUpdate = {
          $inc: { quantity: -quantityDifference }
        };
      }

      // Update order quantity
      orderUpdate.quantity = quantity;
    }
    // If changing from Approved to Pending, add quantity back to inventory
    else if (order.orderStatus === "Approved" && orderStatus === "Pending") {
      inventoryUpdate = {
        $inc: { quantity: order.quantity }
      };
    }

    // Update order status
    if (orderStatus) {
      orderUpdate.orderStatus = orderStatus;
    }

    // Update inventory if there's an update
    if (Object.keys(inventoryUpdate).length > 0) {
      await Inventory.findByIdAndUpdate(order.product, inventoryUpdate);
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      orderUpdate,
      { new: true }
    );

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
      inventoryUpdated: Object.keys(inventoryUpdate).length > 0
    });

  } catch (error) {
    console.error("Order update error:", error);
    res.status(500).json({
      error: "Failed to update order",
      details: error.message
    });
  }
};

const handleAdminAddOrder = async (req, res) => {
  const { product, quantity, notes, customer } = req.body;

  if (!product || !quantity) {
    return res.status(400).json({ error: "Product and quantity are required" });
  }

  try {
    // Find the product in inventory
    const productData = await Inventory.findById(product);
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create the order
    const newOrder = new Order({
      product,
      quantity,
      customer,
      notes,
      orderStatus: "Pending",
      isDeleted: false,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to place order" });
  }
};


//admin
const handleGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          isDeleted: false, // Only fetch non-deleted orders
        },
      },
      {
        $lookup: {
          from: "inventories", // Collection name for Inventory
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Unwind the productDetails array
      },
      {
        $lookup: {
          from: "categories", // Collection name for Category
          localField: "productDetails.attributeId",
          foreignField: "attributes._id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails", // Unwind categoryDetails array
      },
      {
        $addFields: {
          productAttributes: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$categoryDetails.attributes",
                  as: "attr",
                  cond: {
                    $eq: ["$$attr._id", "$productDetails.attributeId"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      // Lookup for customer details
      {
        $lookup: {
          from: "users", // Collection name for Users (customers)
          localField: "customer", // Join field from orders
          foreignField: "_id", // Join field from users
          as: "customerDetails", // The alias for customer data
        },
      },
      {
        $unwind: "$customerDetails", // Unwind the customerDetails array
      },
      {
        $project: {
          _id: 1,
          customer: 1,
          customerDetails: {
            _id: 1,
            name: 1,
            email: 1,
            delivery_address: 1,
            createdAt: 1,
          },
          quantity: 1,
          orderStatus: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          product: {
            _id: "$productDetails._id",
            category: "$productDetails.category",
            quantity: "$productDetails.quantity",
            attributes: "$productAttributes",
          },
        },
      },
    ]);

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

//admin
const handleDeleteOrder = async (req, res) => {
  const { orderId } = req.body;

  // Validate orderId
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Find the order by ID and populate the product reference
    const order = await Order.findById(orderId).populate('product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Restore the product's stock quantity if the order was not already canceled
    if (order.orderStatus !== 'Cancelled') {
      const product = await Inventory.findById(order.product._id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found in inventory' });
      }

      // Increment the inventory quantity
      product.quantity += order.quantity;
      await product.save();
    }

    // Soft delete the order by setting isDeleted to true
    order.isDeleted = true;
    await order.save();

    res.status(200).json({ message: 'Order marked as deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to mark order as deleted' });
  }
};

//customer
const handleAddOrder = async (req, res) => {
  const { product, quantity, notes } = req.body;

  const customer = req.user?._id; // Retrieve the authenticated user ID

  if (!product || !quantity) {
    return res.status(400).json({ error: "Product and quantity are required" });
  }

  try {
    // Find the product in inventory
    const productData = await Inventory.findById(product);
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create the order
    const newOrder = new Order({
      product,
      quantity,
      customer,
      notes,
      orderStatus: "Pending",
      isDeleted: false,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to place order" });
  }
};

const handleGetCustomerOrders = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {

      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    // const customerId=req.params.id

    const customerId = new mongoose.Types.ObjectId(req.user._id); // Use Types.ObjectId directly
    // Get the customer's ID from the authenticated user
    // Find all orders for the authenticated customer
    const orders = await Order.aggregate([
      {
        $match: {
          customer:customerId,
          isDeleted: false, // Only fetch non-deleted orders
        },
      },
      {
        $lookup: {
          from: "inventories", // Collection name for Inventory
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Unwind the productDetails array
      },
      {
        $lookup: {
          from: "categories", // Collection name for Category
          localField: "productDetails.attributeId",
          foreignField: "attributes._id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails", // Unwind categoryDetails array
      },
      {
        $addFields: {
          productAttributes: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$categoryDetails.attributes",
                  as: "attr",
                  cond: {
                    $eq: ["$$attr._id", "$productDetails.attributeId"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      // Lookup for customer details
      {
        $lookup: {
          from: "users", // Collection name for Users (customers)
          localField: "customer", // Join field from orders
          foreignField: "_id", // Join field from users
          as: "customerDetails", // The alias for customer data
        },
      },
      {
        $unwind: "$customerDetails", // Unwind the customerDetails array
      },
      {
        $project: {
          _id: 1,
          customer: 1,
          customerDetails: {
            _id: 1,
            name: 1,
            email: 1,
            delivery_address: 1,
            createdAt: 1,
          },
          quantity: 1,
          orderStatus: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          product: {
            _id: "$productDetails._id",
            category: "$productDetails.category",
            quantity: "$productDetails.quantity",
            attributes: "$productAttributes",
          },
        },
      },
    ]);
      

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this customer.' });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
};

const handleUpdateCustomerOrder = async (req, res) => {
  const { orderId, quantity, notes } = req.body;

  // Validate input
  if (!orderId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Order ID and a valid quantity are required.' });
  }

  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // Find the order by ID and ensure it belongs to the customer
    const order = await Order.findOne({ 
      _id: orderId, 
      customer: req.user._id, 
      isDeleted: false 
    }).populate('product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found or does not belong to the user.' });
    }

    // Ensure the order is still in Pending state
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({ error: 'Only orders in Pending state can be updated.' });
    }

    // Update the order
    order.quantity = quantity;
    if (notes) order.notes = notes; // Update notes if provided
    await order.save();

    res.status(200).json({ message: 'Order updated successfully.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update the order. Please try again later.' });
  }
};


module.exports = {
  handleAddOrder,
  handleGetAllOrders,
  handleGetCustomerOrders,
  handleUpdateOrder,
  handleDeleteOrder,
  handleUpdateCustomerOrder,
  handleAdminAddOrder
};