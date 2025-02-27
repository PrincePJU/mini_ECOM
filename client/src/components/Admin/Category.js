import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { MdDelete } from "react-icons/md";
import {toast } from "react-hot-toast";

const darkModeColors = {
  background: "#111d2e",
  text: "#e0e0e0",
  border: "#2c2c2c",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#ddd",
  icon: "#000",
};

const cardDarkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#2c2c2c",
  icon: "#fff",
};

const cardLightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#ddd",
  icon: "#000",
};

const innerCardDarkModeColors = {
  background: "#20416e",
  text: "#e0e0e0",
  border: "#2c2c2c",
  icon: "#fff",
};

const innerCardLightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#ddd",
  icon: "#000",
};

const Category = ({ apiBaseUrl,darkMode }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;
  const cardCurrentColors = darkMode ? cardDarkModeColors : cardLightModeColors;
  const innercardCurrentColors = darkMode ? innerCardDarkModeColors : innerCardLightModeColors;

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    attributes: [],
    categoryType: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/categories`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error.response?.data || error.message);
      toast.error("Failed to load categories.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePairChange = (groupIndex, pairIndex, field, value) => {
    setNewCategory(prevState => {
      const updatedAttributes = [...prevState.attributes];
      updatedAttributes[groupIndex].pairs[pairIndex][field] = value;
      return { ...prevState, attributes: updatedAttributes };
    });
  };

  // Add a new key-value pair to a specific attribute group
  const addNewPair = (groupIndex) => {
    setNewCategory(prevState => {
      const updatedAttributes = [...prevState.attributes];
      updatedAttributes[groupIndex].pairs.push({ key: "", value: "" });
      return { ...prevState, attributes: updatedAttributes };
    });
  };


  const addNewAttributeGroup = () => {
    setNewCategory(prevState => {
      const updatedAttributes = [...prevState.attributes, { pairs: [] }];
      return { ...prevState, attributes: updatedAttributes };
    });
  };


  // Remove a specific key-value pair from a group
  const removePair = (groupIndex, pairIndex) => {
    setNewCategory(prevState => {
      const updatedAttributes = [...prevState.attributes];
      updatedAttributes[groupIndex].pairs.splice(pairIndex, 1);
      return { ...prevState, attributes: updatedAttributes };
    });
  };


  const removeAttributeGroup = (groupIndex) => {
    setNewCategory(prevState => {
      const updatedAttributes = [...prevState.attributes];
      updatedAttributes.splice(groupIndex, 1);
      return { ...prevState, attributes: updatedAttributes };
    });
  };


  const handleSaveCategory = async () => {
    let categoryData = {};

    if (editIndex !== null) {
      // Editing a category
      categoryData = {
        id: categories[editIndex]._id, // Use the unique category ID if available
        oldName: categories[editIndex].name, // Existing name
        newName: newCategory.name,           // Updated name
        categoryType: newCategory.categoryType, // Updated category type
        attributes: newCategory.attributes.map(attributeGroup => {
          // Flatten each attribute group into key-value objects
          const attributeObject = {};
          attributeGroup.pairs.forEach(pair => {
            attributeObject[pair.key] = pair.value;
          });
          return attributeObject;
        }),
      };
    } else {
      // Adding a new category
      categoryData = {
        name: newCategory.name,              // New category name
        categoryType: newCategory.categoryType, // New category type
        attributes: newCategory.attributes.map(attributeGroup => {
          // Transform pairs into key-value objects
          const attributeObject = {};
          attributeGroup.pairs.forEach(pair => {
            attributeObject[pair.key] = pair.value;
          });
          return {
            ...attributeObject,
            _id: new Date().getTime() + Math.random().toString(36).substr(2, 9), // Unique ID for each attribute
          };
        }),
      };
    }

    // Determine HTTP method and URL
    const method = editIndex !== null ? "PATCH" : "POST";
    const url = `${apiBaseUrl}/admin/categories`;

    try {
      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: categoryData,
      });

      setShowModal(false); // Close modal on success
      fetchCategories();   // Refresh categories
      toast.success(editIndex !== null ? "Category updated successfully!" : "Category added successfully!");
    } catch (error) {
      console.error(
        editIndex !== null
          ? "Error updating category:"
          : "Error adding category:",
        error.response?.data || error.message
      );
      toast.error(editIndex !== null ? "Failed to update category." : "Failed to add category.");
    }
};



  const handleEditCategory = (index) => {
    const category = categories[index];

    // Safeguard for undefined or missing attributes
    const transformedAttributes = (category.attributes || []).map((attribute) => {
      const pairs = Object.entries(attribute)
        .filter(([key]) => key !== "_id") // Exclude _id from pairs
        .map(([key, value]) => ({ key, value }));

      return { ...attribute, pairs }; // Add the pairs for the frontend
    });

    setNewCategory({
      name: category.name,
      attributes: transformedAttributes,
      categoryType: category.categoryType || "",
    });

    setEditIndex(index);
    setShowModal(true);
  };


  const handleRemoveCategory = async (index) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/categories`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
          data: { name: categories[index].name },
        },
      );
      fetchCategories();
      toast.success("Category removed successfully!");
    } catch (error) {
      console.error("Failed to delete category:", error.response?.data || error.message);
      toast.error("Failed to remove category.");
    }
  };

  const handleRemoveSpecificAttribute = async (categoryId, attributeId) => {
    try {
      await axios.delete(`${apiBaseUrl}/admin/categories/attribute`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
          data: { categoryId, attributeId },
        },

      );
      fetchCategories();
      toast.success("Attribute removed successfully!");
    } catch (error) {
      console.error("Failed to delete specific attribute:", error.response?.data || error.message);
      toast.error("Failed to remove attribute.");
    }
  };

  const handleFormChange = (field, value) => {
    setNewCategory(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: currentColors.text }}>Categories: </h3>
        <Button
          variant="primary"
          onClick={() => {
            setNewCategory({ name: "", attributes: [], categoryType: "" });
            setEditIndex(null);
            setShowModal(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <Row>
        {categories.map((item, index) => (
          <Col key={index} md={4}>
            <Card
              className="mb-4 position-relative"
              style={{
                backgroundColor: cardCurrentColors.background,
                color: currentColors.text,
                // borderColor:cardCurrentColors.text,
                // border:"1px solid"
              }}
            >
              <Button
                variant="danger"
                className="position-absolute"
                style={{
                  top: "5px",
                  right: "5px",
                  borderRadius: "10px",
                  width: "35px",
                  height: "35px",
                  padding: "0",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
                onClick={() => handleRemoveCategory(index)}
              >
                <MdDelete size={15} color="white" />
              </Button>

              <Card.Body>
                <Card.Title><h5>{item.name}</h5></Card.Title>
                <p><strong>Type:</strong> {item.categoryType}</p>

                {item.attributes.map((attr, attrIndex) => (
                  <Card
                    key={attrIndex}
                    className="mb-3"
                    style={{ backgroundColor: innercardCurrentColors.background, color: innercardCurrentColors.text }}
                  >
                    <Card.Body>
                      <h5>Attributes:</h5>
                      {Object.entries(attr).map(([key, value], pairIndex) => {
                        // Skip rendering _id or any non-attribute fields
                        if (key === "_id") return null;

                        // Check if value is an object, and only render if it's a string or number
                        if (typeof value === "object") {
                          console.warn(`Skipping object value for ${key}`);
                          return null; // Skip object values
                        }

                        return (
                          <p key={pairIndex}>
                            <strong>{key}:</strong> {value}
                          </p>
                        );
                      })}
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveSpecificAttribute(item._id, attr._id)}
                      >
                        Delete Attribute
                      </Button>
                    </Card.Body>
                  </Card>
                ))}


                <Button variant="warning" onClick={() => handleEditCategory(index)}>
                  Edit
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Category Name Input */}
            <Form.Group className="mb-3">
              <Form.Label>Category Name:</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter category name"
              />
            </Form.Group>

            {/* Category Type Input */}
            <Form.Group className="mb-3">
              <Form.Label>Category Type:</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.categoryType}
                onChange={(e) => handleFormChange("categoryType", e.target.value)}
                placeholder="Enter category type"
              />
            </Form.Group>

            {/* Attributes Section */}
            <h5>Attributes:</h5>

            {newCategory.attributes.map((attributeGroup, groupIndex) => (
              <div key={groupIndex} className="mb-3">
                <h6>Attribute Group {groupIndex + 1}</h6>

                {/* Render Key-Value Pairs for the Group */}
                {attributeGroup.pairs.map((pair, pairIndex) => (
                  <div key={pairIndex} className="d-flex mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Enter key"
                      value={pair.key || ""}
                      onChange={(e) => handlePairChange(groupIndex, pairIndex, "key", e.target.value)}
                      className="me-2"
                    />
                    <Form.Control
                      type="text"
                      placeholder="Enter value"
                      value={pair.value || ""}
                      onChange={(e) => handlePairChange(groupIndex, pairIndex, "value", e.target.value)}
                    />
                    <Button variant="danger" onClick={() => removePair(groupIndex, pairIndex)} className="ms-2">
                      Remove
                    </Button>
                  </div>
                ))}

                {/* Add New Key-Value Pair Button */}
                <Button variant="success" onClick={() => addNewPair(groupIndex)}>
                  Add Key-Value Pair
                </Button>

                {/* Remove Entire Attribute Group */}
                <Button variant="danger" onClick={() => removeAttributeGroup(groupIndex)} className="ms-2">
                  Remove Group
                </Button>
              </div>
            ))}

            {/* Add New Attribute Group */}
            <Button variant="primary" onClick={addNewAttributeGroup}>
              Add Attribute Group
            </Button>
          </Form>
        </Modal.Body>

        {/* Modal Footer with Save/Close buttons */}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            {editIndex !== null ? "Update Category" : "Save Category"}
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
};

export default Category;