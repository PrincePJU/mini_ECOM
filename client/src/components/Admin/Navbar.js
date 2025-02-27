import React from "react";
import { Button, Dropdown, Image } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";
import axios from "axios"; // Import axios
import toast from "react-hot-toast"; // Import react-hot-toast
import image from "../Admin/images/admin.png";

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

function NavbarComponent({ darkMode, toggleTheme, title,apiBaseUrl }) {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  // Function to handle logout
  const handleLogout = async () => {
    try {
      console.log(apiBaseUrl)
      // Send a GET request to the logout endpoint with `withCredentials: true`
      const response = await axios.get(`${apiBaseUrl}/user/logout`, {
        withCredentials: true, // Ensures cookies are sent with the request
      });

      if (response.status === 200) {
        // If the logout is successful, show a toast notification and redirect to the login page
        toast.success("Logout successful!");
        setTimeout(() => {
          localStorage.removeItem("Users"); // Remove user info from localStorage
          localStorage.removeItem("authToken"); // Remove
          localStorage.removeItem("role"); // Remove
          localStorage.removeItem("Email"); // Remove
          window.location.href = "/";  // Redirect to login page
        }, 1000);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <>
      <div
        style={{
          padding: "10px 20px",
          backgroundColor: currentColors.background,
          color: currentColors.text,
          position: "sticky", // Keeps navbar fixed at the top
          top: 0, // Positions the navbar at the top of the viewport
          zIndex: 1000, // Ensures it stays above other content
          width: "100%", // Ensures full-width of the navbar
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Optional, for a shadow effect
        }}
        className="d-flex justify-content-between align-items-center"
      >
        <h1 className="m-0" style={{ color: currentColors.text }}>
          {title}
        </h1>
        <div className="d-flex align-items-center">
          <Button
            onClick={toggleTheme}
            className="me-3"
            style={{
              backgroundColor: "transparent",
              fontSize: "20px",
              cursor: "pointer",
              border: "none"
            }}
          >
            {darkMode ? (
              <FaSun style={{ color: currentColors.icon }} />
            ) : (
              <FaMoon style={{ color: currentColors.icon }} />
            )}
          </Button>
          <Dropdown align="end">
            <Dropdown.Toggle
              as={Image}
              src={image}
              roundedCircle
              style={{ cursor: "pointer", width: "40px", height: "40px" }}
            />
            <Dropdown.Menu>
              <Dropdown.Item href="#">Settings</Dropdown.Item>
              {/* Logout button triggers handleLogout */}
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </>
  );
}

export default NavbarComponent;
