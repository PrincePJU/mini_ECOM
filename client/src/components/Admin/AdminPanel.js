import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavbarComponent from "./Navbar";
import Category from "./Category";
import Inventory from "./Inventory";
import Dashboard from "./Dashboard";
import DisplayUser from "./DisplayUser";
import DisplayOrder from "./DisplayOrder";
import Location from "./Location";

const AdminPanel = ({ apiBaseUrl }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: sidebarOpen ? "250px" : "60px",
          transition: "margin-left 0.3s",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {console.log(apiBaseUrl)}
        {/* Navbar with Dynamic Title */}
        <NavbarWithDynamicTitle darkMode={darkMode} apiBaseUrl={apiBaseUrl} toggleTheme={toggleTheme} />

        {/* Define Routes for Sub-pages */}
        <Routes>
          {/* Default Route: Dashboard */}
          <Route path="/" element={<Dashboard darkMode={darkMode} apiBaseUrl={apiBaseUrl} />} />

          {/* Nested Routes */}
          <Route path="/category" element={<Category apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
          <Route path="/orders" element={<DisplayOrder apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
          <Route path="/inventory" element={<Inventory apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
          <Route path="/users" element={<DisplayUser apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
          <Route path="/routes" element={<Location apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
        </Routes>
      </div>
    </div>
  );
}

// Navbar Component with Dynamic Title
const NavbarWithDynamicTitle = ({ darkMode, toggleTheme,apiBaseUrl }) => {
  const location = useLocation();

  // Dynamically Map Routes to Titles
  const getTitle = () => {
    switch (location.pathname) {
      case "/admin":
        return "Dashboard";
      case "/admin/category":
        return "Category Management";
      case "/admin/users":
        return "User Management";
        case "/admin/orders":
          return "Order Management";
        case "/admin/inventory":
            return "Inventory Management";
        case "/admin/routes":
            return "Routes Management"
      default:
        return "Admin Panel";
    }
  };

  return (
    <NavbarComponent
      darkMode={darkMode}
      toggleTheme={toggleTheme}
      title={getTitle()}
      apiBaseUrl={apiBaseUrl}
    />
  );
};

export default AdminPanel;
