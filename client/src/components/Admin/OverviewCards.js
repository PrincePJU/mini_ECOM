import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";

const darkModeColors = {
  text: "#e0e0e0",
  border: "#444",
  cardBackground: "#18283e",
};

const lightModeColors = {
  text: "#000",
  border: "#ddd",
  cardBackground: "#ffffff",
};

function OverviewCards({ darkMode,apiBaseUrl }) {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  // State to hold stats data
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    totalProducts: 0,
    categoryDistribution: {},
  });

  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch stats from the API
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/stats/monthly`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          },
        ); // Update this URL based on your API endpoint
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Row className="mt-4">
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>Total Users</h5>
          <h3>{stats.totalUsers}</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>New Users</h5>
          <h3>{stats.newUsersThisMonth}</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>Total Orders</h5>
          <h3>{stats.totalOrders}</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>Total Products</h5>
          <h3>{stats.totalProducts}</h3>
        </Card>
      </Col>
    </Row>
  );
}

export default OverviewCards;
