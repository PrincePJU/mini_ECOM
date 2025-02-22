import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Card, Container, Row, Col, Spinner, Alert, Modal, Form } from "react-bootstrap";
import { toast } from "react-hot-toast";

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

const DisplayOrder = ({ apiBaseUrl, darkMode }) => {
    const currentColors = darkMode ? darkModeColors : lightModeColors;
    const currentCardColors = darkMode ? cardDarkModeColors : cardLightModeColors;

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [fetchingData, setFetchingData] = useState(false);
    const [users, setUsers] = useState([]);

    const [selectedOrderStatus, setSelectedOrderStatus] = useState("");  // For orderStatus filter

    // Modal-related state
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newQuantity, setNewQuantity] = useState("");
    const [newOrderStatus, setNewOrderStatus] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");

    // Modal states for adding a new order
    const [showAddOrderModal, setShowAddOrderModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [orderQuantity, setOrderQuantity] = useState("");
    const [orderNotes, setOrderNotes] = useState("");

    const [products, setProducts] = useState([]); // State to store fetched products
    // const [selectedProduct, setSelectedProduct] = useState("");


    // Fetch users for dropdown
    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/customer`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
          
            setUsers(data.customers || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error fetching users.");
        }
    }, [apiBaseUrl]);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setFetchingData(true);
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Error fetching products.");
        } finally {
            setIsLoading(false);
            setFetchingData(false);
        }
    }, [apiBaseUrl]);

    const fetchProducts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/inventory`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            
            setProducts(data.products || []); // Assuming the API returns a "products" array
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
        fetchUsers();
    }, [fetchOrders, fetchProducts, fetchUsers]); // Initial fetch when the component mounts

    const filteredOrders = selectedOrderStatus
        ? orders.filter((order) => order.orderStatus === selectedOrderStatus)
        : orders;  // If no status is selected, show all orders

    // Handle delete order
    const handleDeleteOrder = async (orderId) => {
        try {
            await axios.delete(`${apiBaseUrl}/admin/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                    data: { orderId }
                },
            );
            toast.success("Order deleted successfully!");
            fetchOrders();
        } catch (error) {
            console.error("Error deleting order:", error);
            toast.error("Error deleting order.");
        }
    };

    // Handle update order
    const handleUpdateOrder = async () => {
        const updateData = {};
        if (newQuantity) updateData.quantity = newQuantity;
        if (newOrderStatus) updateData.orderStatus = newOrderStatus;

        if (Object.keys(updateData).length === 0) {
            setUpdateMessage("Please provide the updated details.");
            return;
        }

        try {
            const { data } = await axios.patch(
                `${apiBaseUrl}/admin/orders`,
                {
                    orderId: selectedOrder._id,
                    ...updateData
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            toast.success(data.message);
            fetchOrders();  // Refresh the order list
            setShowModal(false);  // Close modal after update
            setSelectedOrder(null);  // Clear the selected order after update
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error("Failed to update the order.");
        }
    };

    const handleAddOrder = async () => {
        if (!selectedUserId || !selectedProduct || !orderQuantity) {
            toast.error("All fields are required.");
            return;
        }

        try {
            const { data } = await axios.post(
                `${apiBaseUrl}/admin/orders`,
                {
                    product: selectedProduct,
                    quantity: orderQuantity,
                    notes: orderNotes,
                    customer: selectedUserId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            toast.success("Order added successfully!");
            fetchOrders(); // Refresh the order list
            setShowAddOrderModal(false); // Close modal
        } catch (error) {
            console.error("Error adding order:", error);
            toast.error("Failed to add order.");
        }
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
            <div className="d-flex justify-content-between">
                <h2 className="text mb-4">Orders</h2>
                <Button className="mb-4" onClick={() => setShowAddOrderModal(true)}>Add New Order</Button>
            </div>

            {message && (
                <Alert variant={message.includes("Error") ? "danger" : "success"}>
                    {message}
                </Alert>
            )}

            {updateMessage && (
                <Alert variant={updateMessage.includes("Error") ? "danger" : "success"}>
                    {updateMessage}
                </Alert>
            )}

            {/* Filter Dropdown for Order Status */}
            <Form.Group controlId="orderStatusFilter" className="mb-4">
                <Form.Control
                    as="select"
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Pending">Pending</option>
                </Form.Control>
            </Form.Group>

            {fetchingData || isLoading ? (
                <Spinner animation="border" className="d-block mx-auto" />
            ) : (
                <>
                    {/* Order List */}
                    <Row>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <Col key={order._id} md={4} className="mb-3">
                                    <Card
                                        style={{
                                            backgroundColor: currentCardColors.background,
                                            color: currentCardColors.text,
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title>
                                                <strong>{order.customerDetails.name}</strong>
                                            </Card.Title>
                                            <Card.Text>
                                                <strong>{order.customerDetails.email}</strong>
                                            </Card.Text>
                                            <hr style={{ marginBottom: "10px" }} />
                                            <Card.Text>
                                                <strong>{order.product.category}</strong>
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Quantity:</strong> {order.quantity}
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Order Status:</strong> {order.orderStatus}
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Notes:</strong> {order.notes}
                                            </Card.Text>
                                            <div>
                                                <strong>Attributes:</strong>
                                                <ul>
                                                    {order.product.attributes &&
                                                        Object.entries(order.product.attributes)
                                                            .filter(([key, value]) => key !== "_id")
                                                            .map(([key, value]) => (
                                                                <li key={key}>
                                                                    {key}: {value}
                                                                </li>
                                                            ))}
                                                </ul>
                                            </div>
                                            <Card.Text>
                                                <strong>Created At:</strong>{" "}
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </Card.Text>

                                            {/* Update Order Button */}
                                            <div className="d-flex justify-content-between">

                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setNewQuantity(order.quantity);  // Pre-fill current quantity
                                                        setNewOrderStatus(order.orderStatus);  // Pre-fill current status
                                                        setShowModal(true);  // Show modal
                                                    }}
                                                >
                                                    Update Order
                                                </Button>
                                                {/* Delete Order Button */}
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                >
                                                    Delete Order
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col md={12}>
                                <em>No orders available</em>
                            </Col>
                        )}
                    </Row>

                    {/* Modal for Updating Order */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Order</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={(e) => { e.preventDefault(); handleUpdateOrder(); }}>
                                <Form.Group controlId="formQuantity">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newQuantity}
                                        onChange={(e) => setNewQuantity(e.target.value)}
                                        min="1"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="formOrderStatus">
                                    <Form.Label>Order Status</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={newOrderStatus}
                                        onChange={(e) => setNewOrderStatus(e.target.value)}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Pending">Pending</option>
                                    </Form.Control>
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Save Changes
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Modal for Adding New Order */}
                    <Modal show={showAddOrderModal} onHide={() => setShowAddOrderModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Order</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group controlId="formUser">
                                    <Form.Label>Select User</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                    >
                                        <option value="">Choose User</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="formProduct">
                                    <Form.Label>Product</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                    >
                                        <option value="">Select a product</option>
                                        {products.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.category}
                                                {item.attributes &&
                                                    " (" +
                                                    Object.entries(item.attributes)
                                                        .filter(([key]) => key !== "_id")
                                                        .map(([key, value]) => `${key}: ${value}`)
                                                        .join(", ") +
                                                    ")"}
                                            </option>
                                        ))}

                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="formQuantity">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter quantity"
                                        value={orderQuantity}
                                        onChange={(e) => setOrderQuantity(e.target.value)}
                                        min="1"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formNotes">
                                    <Form.Label>Notes (optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                    />
                                </Form.Group>

                                <Button variant="primary" onClick={handleAddOrder}>
                                    Add Order
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </>
            )}
        </Container>
    );
};

export default DisplayOrder;
