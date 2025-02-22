const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  attributes: [
    {
      type: mongoose.Schema.Types.Mixed,
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(), // Automatically generate unique _id
      },
    },
  ],
  categoryType: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
