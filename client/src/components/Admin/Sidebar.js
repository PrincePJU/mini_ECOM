import React from "react";
import { Nav } from "react-bootstrap";
import { FaHome, FaBox, FaUsers, FaChartBar, FaMapMarkedAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdOutlineInventory } from "react-icons/md";

const darkModeColors = {
  background: "#18283e",
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

function Sidebar({ toggleSidebar, sidebarOpen, darkMode }) {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  return (
    <div
      className={`p-3 ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      style={{
        width: sidebarOpen ? "250px" : "60px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: currentColors.background,
        color: currentColors.text,
        borderRight: `2px solid ${currentColors.border}`,
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="btn p-0 mt-2 mb-4"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "3px",
            backgroundColor: currentColors.icon,
            marginBottom: "5px",
            borderRadius: "2px",
            transition: "all 0.3s ease",
          }}
        />
        <div
          style={{
            width: "30px",
            height: "3px",
            backgroundColor: currentColors.icon,
            marginBottom: "5px",
            borderRadius: "2px",
            transition: "all 0.3s ease",
          }}
        />
        <div
          style={{
            width: "30px",
            height: "3px",
            backgroundColor: currentColors.icon,
            borderRadius: "2px",
            transition: "all 0.3s ease",
          }}
        />
      </button>

      {/* Navigation Links */}
      <Nav className="flex-column">
        <NavItem
          to="/admin"
          label="Dashboard"
          icon={<FaHome />}
          color="chocolate"
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
        <NavItem
          to="/admin/category"
          label="Category"
          icon={<FaBox />}
          color="purple"
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
        <NavItem
          to="/admin/users"
          label="Users"
          icon={<FaUsers />}
          color="orange"
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
        <NavItem
          to="/admin/orders"
          label="Order"
          icon={<FaChartBar />}
          color="blueviolet"
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
        <NavItem
          to="/admin/inventory"
          label="Inventory"
          icon={<MdOutlineInventory />}
          color="#007bff"
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
        <NavItem
          to="/admin/routes"
          label="Route"
          icon={<FaMapMarkedAlt />}
          color="green"
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
      </Nav>
    </div>
  );
}

// NavItem Component for Clean Reusability
const NavItem = ({ to, label, icon, color, sidebarOpen, darkMode }) => (
  <Nav.Link
    as={Link}
    to={to}
    className={`d-flex align-items-center ${
      darkMode ? "text-white" : "text-dark"
    }`}
    style={{
      padding: "15px 7px",
      fontSize: "16px",
      textDecoration: "none",
      color: darkMode ? "#e0e0e0" : "#000",
    }}
  >
    {React.cloneElement(icon, { style: { color, fontSize: "18px" } })}
    {sidebarOpen && <span className="ms-2">{label}</span>}
  </Nav.Link>
);

export default Sidebar;
