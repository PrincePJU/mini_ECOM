const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Category"
  },
  quantity: {
    type: Number,
    default: 0, // Default quantity
  }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
