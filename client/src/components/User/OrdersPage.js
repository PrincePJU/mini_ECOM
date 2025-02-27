import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-hot-toast";

const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#000",
  icon: "#000",
};

const Order = ({ apiBaseUrl, darkMode }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newOrder, setNewOrder] = useState({ product: "", quantity: "", notes: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [filteredInventory, setFilteredInventory] = useState([]); // Filtered inventory list
  const [showSuggestions, setShowSuggestions] = useState(false); // To control suggestion visibility

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/customer/order`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Fetch inventory to perform the match
      const inventoryResponse = await axios.get(`${apiBaseUrl}/admin/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const inventoryData = inventoryResponse.data.products;

      // Update orders with matched inventory details
      const updatedOrders = response.data.orders.map((order) => {
        const matchedInventory = inventoryData.find(
          (item) => item._id === order.product.attributeId
        );

        return {
          ...order,
          product: {
            ...order.product,
            ...matchedInventory, // Merge matched inventory details
          },
        };
      });

      setOrders(updatedOrders);
      toast.success("Orders fetched successfully!");
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to fetch orders";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setInventory(response.data.products);
    } catch (err) {
      setError("Failed to fetch inventory.");
    }
  };

  const addOrder = async () => {
    if (!newOrder.product || !newOrder.quantity) {
      const errorMessage = "Product and quantity are required";
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiBaseUrl}/customer/order`,
        { ...newOrder },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setOrders([response.data.order, ...orders]);
      setNewOrder({ product: "", quantity: "", notes: "" });
      toast.success("Order added successfully!");
      setError("");
      setShowAddModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to add order";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async () => {
    if (!selectedOrder || !selectedOrder._id || !selectedOrder.quantity) {
      const errorMessage = "Order ID and a valid quantity are required.";
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.patch(
        `${apiBaseUrl}/customer/order`,
        {
          orderId: selectedOrder._id,
          quantity: selectedOrder.quantity,
          notes: selectedOrder.notes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id ? response.data.order : order
        )
      );
      toast.success("Order updated successfully!");
      setSelectedOrder(null);
      setShowEditModal(false);
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to update order";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchInventory();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setShowSuggestions(false); // Hide suggestions when input is empty
    } else {
      const filtered = inventory.filter((item) =>
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
      setShowSuggestions(true); // Show suggestions when input has text
    }
  }, [searchTerm, inventory]);

  const handleProductChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProductSelect = (product) => {
    // Exclude _id from the display attributes but include it in the data
    const attributesString = product.attributes
      ? Object.entries(product.attributes)
        .filter(([key]) => key !== "_id") // Exclude _id from display
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
      : ""; // Convert attributes to string format

    // Set the product data, including _id for submission
    setNewOrder({
      ...newOrder,
      product: product, // Keep full product data including _id
    });

    // Display the category and attributes in the input box
    setSearchTerm(`${product.category} (${attributesString})`); // Set input field with category and attributes
    setShowSuggestions(false); // Hide the suggestions list once a product is selected
  };

  const filteredOrders = filterStatus
    ? orders.filter((order) => order.orderStatus === filterStatus)
    : orders;

  return (
    <>
      <div
        className="container-fluid p-5"
        style={{ backgroundColor: currentColors.background, color: currentColors.text }}
      >
        <div className="d-flex justify-content-between">
          <h2>Orders:</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-4">
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Order
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control"
          >
            <option value="">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
        </div>

        <h4>Order List</h4>
        <div className="row">
          {loading && (
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          )}
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="col-12 col-sm-6 col-lg-4 mb-3" // Adjust grid sizes for responsiveness
            >
              <div className="card h-100">
                <div className="card-body">
                  {/* Conditionally render the product category */}
                  <h5 className="card-title">
                    {order.product ? order.product.category : "No Category"}
                  </h5>
                  <div className="card-text">
                    <strong>Status:</strong> {order.orderStatus} <br />
                    <strong>Notes:</strong> {order.notes || "N/A"} <br />
                    <strong>Quantity:</strong> {order.quantity}<br />

                    {/* Render attributes */}
                    {order.product && order.product.attributes && Object.keys(order.product.attributes).length > 0 ? (
                      <p className="card-text">
                        <strong>Details:</strong>{" "}
                        {Object.entries(order.product.attributes)
                          .filter(([key]) => key !== "_id")
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    ) : (
                      <p className="card-text">
                        <strong>Attributes:</strong> None
                      </p>
                    )}
                  </div>
                  <Button
                    variant="warning"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Add Order Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Search input for product */}
            <Form.Control
              type="text"
              placeholder="Search product"
              value={searchTerm}
              onChange={handleProductChange}
              className="mb-3"
            />

            {/* Suggestions list */}
            {showSuggestions && filteredInventory.length > 0 && (
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "5px" }}>
                {filteredInventory.map((item) => (
                  <div
                    key={item._id}
                    className="dropdown-item"
                    onClick={() => handleProductSelect(item)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.category}
                    {item.attributes &&
                      " (" +
                      Object.entries(item.attributes)
                        .filter(([key]) => key !== "_id") // Exclude _id from attributes
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ") +
                      ")"}
                  </div>
                ))}
              </div>
            )}

            <Form.Control
              type="number"
              placeholder="Quantity"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              className="mb-3"
            />
            <Form.Control
              as="textarea"
              placeholder="Notes (optional)"
              value={newOrder.notes}
              onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
              className="mb-3"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={addOrder} disabled={loading}>
              Add Order
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Order Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <Form.Control
                  type="text"
                  placeholder="Category"
                  value={selectedOrder.product.category} // Display category name
                  readOnly // Prevent user modification
                  className="mb-3"
                />
                <Form.Control
                  type="number"
                  placeholder="Quantity"
                  value={selectedOrder.quantity}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, quantity: e.target.value })
                  }
                  className="mb-3"
                />
                <Form.Control
                  as="textarea"
                  placeholder="Notes"
                  value={selectedOrder.notes || ""}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, notes: e.target.value })
                  }
                  className="mb-3"
                />
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="warning" onClick={updateOrder} disabled={loading}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Order;
