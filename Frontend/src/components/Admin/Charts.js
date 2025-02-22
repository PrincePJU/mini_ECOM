import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Line, Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Charts({ darkMode, apiBaseUrl }) {
  const darkModeColors = {
    text: "#e0e0e0",
    chartBackground: "#18283e",
    borderColor: "blueviolet",
    axisColor: "#e0e0e0",
  };

  const lightModeColors = {
    text: "#000",
    chartBackground: "#ddd",
    borderColor: "rgba(75, 75, 192, 1)",
    axisColor: "#000",
  };

  const currentColors = darkMode ? darkModeColors : lightModeColors;

  const [yearlyOrdersChart, setYearlyOrdersChart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/stats/monthly`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        
  
        const { yearlyOrdersChart, categoryDistribution } = response.data;
  
        setYearlyOrdersChart(yearlyOrdersChart || []);
        setCategories(Object.keys(categoryDistribution || {}));
        setCategoryDistribution(Object.values(categoryDistribution || {}));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };
  
    fetchData();
  }, [apiBaseUrl]);

  const lineData = {
    labels: yearlyOrdersChart.length > 0 ? yearlyOrdersChart.map((monthData) => monthData.month || "Unknown") : ["No Data"],
    datasets: [
      {
        label: "Orders",
        data: yearlyOrdersChart.length > 0 ? yearlyOrdersChart.map((monthData) => monthData.orders || 0) : [0],
        fill: false,
        borderColor: currentColors.borderColor,
        tension: 0.1,
        pointBackgroundColor: currentColors.borderColor,
        pointBorderColor: currentColors.text,
      },
    ],
  };

  const pieData = {
    labels: categories,
    datasets: [
      {
        label: "Categories",
        data: categoryDistribution,
        backgroundColor: ["#6f42c1", "#20c997", "#ffc107", "#007bff", "#ff5733", "#28a745"],
        borderColor: [currentColors.axisColor],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Row className="mt-4">
      <Col md={6}>
        <Card
          className={`p-3`}
          style={{ backgroundColor: currentColors.chartBackground, color: currentColors.text }}
        >
          <h5>Orders Overview</h5>
          <Line
            style={{ color: currentColors.text }}
            data={lineData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: currentColors.text,
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: currentColors.axisColor,
                    borderDash: [5, 5],
                  },
                  ticks: {
                    color: currentColors.axisColor,
                  },
                },
                y: {
                  grid: {
                    color: currentColors.axisColor,
                    borderDash: [5, 5],
                  },
                  ticks: {
                    color: currentColors.axisColor,
                  },
                },
              },
            }}
          />
        </Card>
      </Col>
      <Col md={6}>
        <Card
          className={`p-3`}
          style={{
            height: "300px",
            backgroundColor: currentColors.chartBackground,
            color: currentColors.text,
          }}
          >
          <h5>Category Distribution</h5>
          <Pie
            data={pieData}
            style={{ height: "auto", width: "100%" }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: currentColors.text,
                  },
                },
              },
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default Charts;
