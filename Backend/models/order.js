const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["Approved", "Shipped", "Delivered", "Cancelled", "Pending"],
    default: "Pending",
  },
  isDeleted: {
    type: Boolean,
    default: false, // Default value set to false
  },
  notes: {
    type: String,
    default: "", // Default to empty string
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;