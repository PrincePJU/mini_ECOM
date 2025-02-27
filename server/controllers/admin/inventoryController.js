const Inventory = require("../../models/inventory");
const Category = require("../../models/category");
const mongoose = require("mongoose");

//Add new products or update quantity
const handleAddInventory = async (req, res) => {
  //attributeId is attribute of object
  const { category, attributeId, quantity } = req.body;
  (category, attributeId, quantity)
  try {
    // Fetch category data from the database
    const categoryData = await Category.findOne({ name: category });
    if (!categoryData) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Validate if the provided attributeId exists in the category's attributes
    const isValidAttribute = categoryData.attributes.some(
      (attr) => String(attr._id) === attributeId
    );

    if (!isValidAttribute) {
      return res.status(400).json({
        error: "Invalid attributeId for the given category",
      });
    }

    // Check if a product with the same category and attributeId exists
    const existingProduct = await Inventory.findOne({ category, attributeId });
    
    if (existingProduct) {
      // Update the quantity if the product already exists
      existingProduct.quantity =  Number(quantity);
      await existingProduct.save();
      return res.status(200).json({
        message: "Product quantity updated successfully",
        product: existingProduct,
      });
    } else {
      // Create a new product if no existing product is found
      const product = new Inventory({ category, attributeId, quantity });
      await product.save();
      return res.status(201).json({
        message: "Product added successfully",
        product,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add or update product" });
  }
};


const handleGetInventory = async (req, res) => {
  const { category, attributeId } = req.query;

  try {
    // If category is provided
    if (category) {
      // Find the category in the Category collection to get the valid attributeId(s)
      const categoryData = await Category.findOne({ name: category });

      if (!categoryData) {
        return res.status(404).json({ error: "Category not found" });
      }

      // If attributeId is provided, filter by it
      let query = { category };

      // If attributeId is provided, filter by attributeId
      if (attributeId) {
        query = { ...query, attributeId };
      }

    }

    const allProducts = await Inventory.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "categories",
          foreignField: "attributes._id",
          localField: "attributeId",
          as: "attributes",
        },
      },
      {
        $project: {
          category: 1,
          attributeId: 1,
          quantity: 1,
          attributes: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$attributes",
                  as: "attribute",
                  in: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$$attribute.attributes",
                          as: "final",
                          cond: {
                            $eq: [
                              { $toString: "$$final._id" },
                              { $toString: "$attributeId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);
    res.status(200).json({ products: allProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve inventory" });
  }
};

// const handleUpdateInventory = async (req, res) => {
//   const { name, attributeId, updatedAttribute } = req.body;

//   if (!name || !attributeId || !updatedAttribute) {
//     return res
//       .status(400)
//       .json({ error: "Missing required fields: name, attributeId, or updatedAttribute" });
//   }

//   try {
//     // Fetch the category by name
//     const categoryData = await Category.findOne({ name });

//     if (!categoryData) {
//       return res.status(404).json({ error: "Category not found" });
//     }

//     // Find the attribute by ObjectId
//     const attributeIndex = categoryData.attributes.findIndex(
//       (attr) => attr._id.toString() === attributeId
//     );

//     if (attributeIndex === -1) {
//       return res.status(404).json({ error: "Attribute not found in the category" });
//     }

//     // Update the specific attribute
//     categoryData.attributes[attributeIndex] = {
//       ...categoryData.attributes[attributeIndex],
//       ...updatedAttribute,
//     };

//     // Save the updated category
//     await categoryData.save();

//     res.status(200).json({
//       message: "Category attribute updated successfully",
//       updatedCategory: categoryData,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to update category attribute" });
//   }
// };
const handleDeleteInventory = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const deletedProduct = await Inventory.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product deleted successfully", deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};


module.exports = {
  handleAddInventory,
  handleDeleteInventory,
  handleGetInventory,
};
