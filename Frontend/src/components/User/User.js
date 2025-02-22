import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import HomePage from "./HomePage"; // Home component
import OrdersPage from "./OrdersPage"; // Orders component
import SettingsPage from "./SettingsPage"; // Settings component
import '../../App.css';
import axios from "axios";

function User({ apiBaseUrl }) {
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState("");
  const [forceSettings, setForceSettings] = useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

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

        if (response.data && response.data.customers) {
          const customers = response.data.customers;
    
    
          // Retrieve the email from localStorage
          const storedEmail = localStorage.getItem("Email");
    
          // Find the specific user with the stored email
          const specificCustomer = customers.find(
            (customer) => customer.email === storedEmail
          );
    
          if (specificCustomer) {
            // Check if the specific customer has latitude and longitude equal to 0
            const hasZeroLocation =
              specificCustomer.latitude === 0 && specificCustomer.longitude === 0;
    
            if (hasZeroLocation) {
              setForceSettings(true); // Force the settings route
            } else {
              setForceSettings(false);
            }
          } else {
            console.warn("No customer found with the stored email.");
          }
        }
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
        alert("Failed to update customer");
      }
    };
    

    fetchUsers();
  }, [apiBaseUrl]);

  return (
    <>
      <UserNavbar darkMode={darkMode} apiBaseUrl={apiBaseUrl} toggleTheme={toggleTheme} />
      {forceSettings ? (
        // Force redirect to SettingsPage
        <Routes>
          <Route path="/settings" element={<SettingsPage apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
        </Routes>
      ) : (
        // Render regular routes
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} apiBaseUrl={apiBaseUrl} />} />
          <Route path="/orders" element={<OrdersPage darkMode={darkMode} apiBaseUrl={apiBaseUrl} />} />
          <Route path="/settings" element={<SettingsPage apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
        </Routes>
      )}
    </>
  );
}

export default User;
