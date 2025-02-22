import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Button, Table, Alert, Spinner, Form } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";

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


const Location = ({ darkMode, apiBaseUrl }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;


  const [customers, setCustomers] = useState([]); // To store fetched customers
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Selected customer ID
  const [locations, setLocations] = useState([]); // Locations state
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customers on component load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/admin/customer`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setCustomers(response.data.customers); // Store customers
      } catch (err) {
        setError("Failed to load users.");
        console.error(err);
      }
    };

    fetchUsers();
  }, [apiBaseUrl]);

  // Handle dropdown selection
  const handleCustomerSelect = (e) => {
    const selectedId = e.target.value; // Customer ID from dropdown
    const customer = customers.find((cust) => cust._id === selectedId);

    if (customer) {
        const { name, email, latitude, longitude ,delivery_address} = customer;

        // Update locations array with selected user's data
        setLocations((prevLocations) => [
            ...prevLocations,
            {
                name: name || email,
                latitude,
                longitude,
                delivery_address,
            },
        ]);
        toast.success(`${name} location added successfully!`);
    }
};


  // Handle route calculation
  const handleCalculateRoute = async () => {
    setLoading(true);
    setError(null);
    setRouteResult(null);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/add-geo/geoData`,
        { locations },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setRouteResult(response.data);
      toast.success("Optimal route calculated successfully!");
    } catch (err) {
      setError("Failed to calculate the optimal route. Please try again.");
      toast.error("Failed to calculate the optimal route. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid
      style={{ backgroundColor: currentColors.background, color: currentColors.text, minHeight: "100%" }}
    >
      <h2 className="py-4 text-center">Optimal Route Calculator</h2>

      {/* Dropdown to Select Customer */}
      <Form.Group>
        <Form.Label>Select Customer</Form.Label>
        <Form.Control as="select" onChange={handleCustomerSelect} defaultValue="">
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Display Selected Locations */}
      <h5 className="mt-4">Selected Locations</h5>
      <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Delivery Address</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{loc.name}</td>
              <td>{loc.delivery_address || "Address not available"}</td>
            </tr>
          ))}
        </tbody>
      </Table>


      {/* Button to Calculate Route */}
      <div className="text-center mb-4">
        <Button variant="primary" onClick={handleCalculateRoute} disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
              Calculating...
            </>
          ) : (
            "Calculate Optimal Route"
          )}
        </Button>
      </div>

      {/* Error Alert */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Display Route Result */}
      {routeResult && (
        <>
          <h5>Optimal Route</h5>
          <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              {routeResult.optimalRoute.map((loc, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{loc.name}</td>
                  <td>{loc.delivery_address || "Address not available"}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Alert variant="success" className="text-center m-0">
            Total Distance: <strong>{routeResult.totalDistance.toFixed(2)} km</strong>
          </Alert>
        </>
      )}
    </Container>
  );
};

export default Location;
