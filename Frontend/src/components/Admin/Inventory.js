import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Form, Container, Row, Col, Card, Spinner, Alert, Modal, } from "react-bootstrap";
import { toast } from 'react-hot-toast';
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

const Inventory = ({ apiBaseUrl, darkMode }) => {
    const currentColors = darkMode ? darkModeColors : lightModeColors;
    const currentCardColors = darkMode ? cardDarkModeColors : cardLightModeColors;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [attributes, setAttributes] = useState([{}]);
    const [quantity, setQuantity] = useState(0);
    const [productId, setProductId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [fetchingData, setFetchingData] = useState(false);
    const [showModal, setShowModal] = useState(false); // Modal visibility


    const [selectedAttributeId, setSelectedAttributeId] = useState("");


    // Fetch categories and attributes together
    const fetchCategoriesAndAttributes = useCallback(async () => {
        setFetchingData(true);
        try {
            // Fetch categories first
            const { data: categoriesData } = await axios.get(`${apiBaseUrl}/admin/categories`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            setCategories(categoriesData.categories || []);

            // If a category is already selected, fetch its attributes
            if (category) {
                const { data: attributesData } = await axios.get(`${apiBaseUrl}/admin/categories`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    },
                    {
                        params: { category },
                    });
                const selectedCategory = attributesData.categories.find(c => c.name === category);
                setCategoryAttributes(selectedCategory ? selectedCategory.attributes : []);
            }
        } catch (error) {
            console.error("Error fetching categories and attributes:", error);
            setMessage("Error fetching categories and attributes.");
            toast.error("Error fetching categories and attributes.");
        } finally {
            setFetchingData(false);
        }
    }, [apiBaseUrl, category]);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/inventory`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                },

            );
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setMessage("Error fetching products.");
            toast.error("Error fetching products.");
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        fetchCategoriesAndAttributes();
        fetchProducts();
    }, [fetchCategoriesAndAttributes, fetchProducts]);

    // Handle category change
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        if (selectedCategory) {
            fetchCategoriesAndAttributes(); // Fetch category-specific attributes
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                category,
                attributeId: selectedAttributeId, // Send only the selected attribute ID
                quantity,
            };

            if (productId) {
                // For updating an existing product
                await axios.post(
                    `${apiBaseUrl}/admin/inventory`,
                    { ...payload, productId }, // Send the payload and productId
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
                setMessage("Product updated successfully!");
                toast.success("Product updated successfully!");
            } else {
                // For adding a new product
                await axios.post(
                    `${apiBaseUrl}/admin/inventory`,
                    payload, // Send the payload
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
                setMessage("Product added successfully!");
                toast.success("Product added successfully!");
            }

            resetForm(); // Clear the form
            fetchProducts(); // Refresh the product list
            setShowModal(false); // Close the modal after saving
        } catch (error) {
            console.error("Error saving product:", error);
            setMessage("Error saving product.");
            toast.error("Error saving product.");
        }
    };






    // Handle delete product
    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`${apiBaseUrl}/admin/inventory`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                    data: { productId }
                }
            );
            setMessage("Product deleted successfully!");
            toast.success("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            setMessage("Error deleting product.");
            toast.error("Error deleting product.");
        }
    };

    // Reset form
    const resetForm = () => {
        setCategory("");
        setAttributes([{}]);
        setQuantity(0);
        setProductId("");
    };

    return (
        <Container
            fluid
            style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                padding: "20px",
            }}
        >

            {message && (
                <Alert variant={message.includes("Error") ? "danger" : "success"}>{message}</Alert>
            )}

            {fetchingData || isLoading ? (
                <Spinner animation="border" className="d-block mx-auto" />
            ) : (
                <>
                    {/* Add Product Button */}
                    <div style={{ marginBottom: "10px" }} className="d-flex justify-content-between align-items-center">
                        <h3>Products:</h3>
                        <Button variant="primary" style={{}} onClick={() => setShowModal(true)} className="mb-4">
                            Add Product
                        </Button>
                    </div>

                    {/* Modal for Adding/Editing Product */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{productId ? "Update Product" : "Add Product"}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formCategory">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={category}
                                        onChange={handleCategoryChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Attributes</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedAttributeId}
                                        onChange={(e) => setSelectedAttributeId(e.target.value)} // Save selected attribute ID
                                        required
                                    >
                                        <option value="">Select an Attribute</option>
                                        {categoryAttributes.map((attr) => (
                                            <option key={attr._id} value={attr._id}>
                                                {Object.entries(attr)
                                                    .filter(([key]) => key !== "_id")
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(" , ")} {/* Combine key-value pairs for display */}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="formQuantity">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="mt-3">
                                    {productId ? "Update Product" : "Add Product"}
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Product List */}
                    <Row>
                        {products.map((product) => {
                            const productAttributes = product.attributes || {};

                            return (
                                <Col key={product._id} md={4} className="mb-3">
                                    <Card
                                        style={{
                                            backgroundColor: currentCardColors.background,
                                            color: currentCardColors.text,
                                        }}
                                    >
                                        <Card.Body>
                                            <h4>{product.category}</h4>
                                            <h5>Quantity: {product.quantity}</h5>

                                            {/* Display Attributes */}
                                            <div style={{ fontSize: "18px" }}>
                                                <h5 style={{ marginBottom: "10px" }}>Attributes:{" "}</h5>
                                                {Object.keys(productAttributes).length > 0 ? (
                                                    <div style={{ fontSize: "16px", marginLeft: "10px", marginBottom: "20px" }}>
                                                        {Object.entries(productAttributes)
                                                            .filter(([key]) => key !== "_id") // Exclude _id
                                                            .map(([key, value]) => (
                                                                <p key={key}>
                                                                    {key}: {value}{" "}
                                                                </p>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <em>No attributes available 😒</em>
                                                )}
                                            </div>

                                            {/* Edit and Delete buttons */}
                                            <div className="d-flex justify-content-between">

                                                <Button
                                                    variant="warning"
                                                    onClick={() => {
                                                        setProductId(product._id);
                                                        setCategory(product.category);
                                                        setAttributes(product.attributes || [{}]);
                                                        setQuantity(product.quantity);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="ml-2"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Inventory;
