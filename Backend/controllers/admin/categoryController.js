const Category = require("../../models/category");
const mongoose = require('mongoose');

const handleAddNewProduct = async (req, res) => {
  const { name, attributes, categoryType } = req.body;

  if (!name || !attributes || !categoryType) {
    return res
      .status(400)
      .json({
        error: "Product name, attributes, and category type are required",
      });
  }

  try {
    // Add an _id to each attribute if not provided
    const updatedAttributes = attributes.map(attr => ({
      ...attr,
      _id: new mongoose.Types.ObjectId(),
    }));

    // Create a new product
    const newCategory = new Category({
      name,
      attributes: updatedAttributes,
      categoryType,
    });

    // Save the product to the database
    await newCategory.save();

    res
      .status(200)
      .json({ message: "Product added successfully", product: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to add product" });

  }
};

const handleDeleteNewProduct = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const deletedCategory = await Category.findOneAndDelete({ name });
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    res
      .status(200)
      .json({ message: "Category deleted successfully", deletedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

const handleDeleteAttribute = async (req, res) => {
  const { categoryId, attributeId } = req.body;

  // Validate inputs
  if (!categoryId || !attributeId) {
    return res.status(400).json({ error: "categoryId and attributeId are required" });
  }

  try {
    // Ensure the IDs are treated as ObjectIds
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
    const attributeObjectId = new mongoose.Types.ObjectId(attributeId);

    // Update the category by pulling the matching attribute
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryObjectId }, // Match the category by ID
      {
        $pull: { attributes: { _id: attributeObjectId } }, // Remove the matching attribute
      },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found or attribute not removed" });
    }

    res.status(200).json({
      message: "Attribute deleted successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    res.status(500).json({ error: "Failed to delete attribute" });
  }
};


const handleUpdateNewProduct = async (req, res) => {
  const { oldName, newName, attributes, categoryType } = req.body;
  if (!oldName || !newName) {
    return res
      .status(400)
      .json({ error: "Both oldName and newName are required" });
  }

  try {
    // Add an _id to each attribute if not provided
    const updatedAttributes = attributes.map(attr => ({
      ...attr,
      _id: attr._id || new mongoose.Types.ObjectId(), // Generate _id if not already present
    }));

    const updatedCategory = await Category.findOneAndUpdate(
      { name: oldName }, // Search by the old name
      {
        name: newName,
        attributes: updatedAttributes, // Updated attributes with _id ensured
        categoryType: categoryType,
      },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
};


const handleGetNewProduct = async (req, res) => {
  const { name } = req.query;

  try {
    if (name) {
      const category = await Category.findOne({ name });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      return res.status(200).json({ category });
    }

    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
};

module.exports = {
  handleAddNewProduct,
  handleDeleteNewProduct,
  handleGetNewProduct,
  handleUpdateNewProduct,
  handleDeleteAttribute
};
