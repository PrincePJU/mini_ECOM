import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Nav, Navbar, Container, Button } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";
import Logo from "../Admin/images/Logo.png"
import Image from '../Admin/images/admin.png';
import axios from "axios";
import toast from "react-hot-toast";

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


const UserNavbar = ({ darkMode, toggleTheme,apiBaseUrl }) => {
  const handleLogout = async () => {
    try {
      // Send a GET request to the logout endpoint with `withCredentials: true`
      const response = await axios.get(`${apiBaseUrl}/user/logout`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },);
      if (response.status === 200) {
        // If the logout is successful, show a toast notification and redirect to the login page
        toast.success("Logout successful!");
        localStorage.removeItem("Users"); // Remove user info from localStorage
        localStorage.removeItem("authToken"); // Remove
        localStorage.removeItem("role"); // Remove
        localStorage.removeItem("Email"); // Remove
        setTimeout(() => {
          window.location.href = "/";  // Redirect to login page
        }, 2000);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An error occurred during logout.");
    }
  };
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  return (
    <Navbar expand="lg" style={{ position: "sticky", top: 0, zIndex: 3, backgroundColor: currentColors.background, borderBottom: "px solid", borderBottomColor: currentColors.text, color: currentColors.text }} className="shadow-sm px-3">
      <Container fluid style={{ color: currentColors.text }}>
        {/* Navbar Brand */}
        <Navbar.Brand as={Link} style={{ color: currentColors.text }} to="/customer">
          <img
            src={Logo}
            style={{
              height: "70px",
              width: "120px"
            }}
          />
        </Navbar.Brand>

        {/* Toggle for responsiveness */}
        <Navbar.Toggle aria-controls="user-navbar" />
        <Navbar.Collapse id="user-navbar">
          <Nav className="mx-auto"> {/* Center the links */}
            <Nav.Link as={Link} style={{ color: currentColors.text,fontSize:"18px" }} to="/customer">
              Home
            </Nav.Link>
            <Nav.Link as={Link} style={{ color: currentColors.text,fontSize:"18px" }} to="/customer/orders">
              Orders
            </Nav.Link>
          </Nav>
          <Nav className="">
            <Button
              onClick={toggleTheme}
              className="me-3"
              style={{
                backgroundColor: "transparent",
                // border: `1px solid ${currentColors.border}`,
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              {darkMode ? (
                <FaSun style={{ color: currentColors.icon }} />
              ) : (
                <FaMoon style={{ color: currentColors.icon }} />
              )}
            </Button>
            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="user-dropdown"
                className="border-0 shadow-none"
                style={{ backgroundColor: currentColors.background, color: currentColors.text }}
              >
                <img
                  src={Image}
                  alt="User Avatar"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/customer/settings">
                  Settings
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={handleLogout}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
