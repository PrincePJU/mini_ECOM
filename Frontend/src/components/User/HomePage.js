import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import { Button, Container, Card, Row, Col } from "react-bootstrap";

// Define color themes
const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  button: "#4caf50",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#333",
  border: "#ddd",
  button: "#28a745",
};

const HomePage = ({ darkMode,apiBaseUrl }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  // Ref for the Typed.js effect
  const typedRef = useRef(null);

  useEffect(() => {
    const options = {
      strings: ["Om Traders", "Your Trusted Plastic Partner"],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    };

    const typed = new Typed(typedRef.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Container fluid className="py-5 text-center">
        <h1 className="display-4 font-weight-bold mb-3">
          Welcome to{" "}
          <span style={{ color: "purple" }}>
            <span ref={typedRef}></span>
          </span>
        </h1>
        <p className="lead mb-4">
          Your one-stop solution for buying, selling, and recycling plastics.
          Empowering businesses with sustainable trade solutions.
        </p>
        <Button
          variant="success"
          style={{ backgroundColor: currentColors.button, border: "none" }}
        >
          Explore Our Products
        </Button>
      </Container>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-4">Why Choose Us?</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
              className="shadow-sm"
            >
              <Card.Body>
                <Card.Title className="fw-bold"><h5>Wide Range of Products</h5></Card.Title>
                <Card.Text>
                  Explore a variety of high-quality plastic materials for all
                  your needs, from industrial plastics to recyclables.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
              className="shadow-sm"
            >
              <Card.Body>
                <Card.Title className="fw-bold"><h5>Eco-Friendly Solutions</h5></Card.Title>
                <Card.Text>
                  Promote sustainability with our plastic recycling services,
                  reducing waste and saving the environment.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
              className="shadow-sm"
            >
              <Card.Body>
                <Card.Title className="fw-bold"><h5>Trusted by Businesses</h5></Card.Title>
                <Card.Text>
                  Join hundreds of businesses who trust us for their plastic
                  sourcing and trading needs.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* About Us Section */}
      <Container fluid className="py-5" style={{ backgroundColor: "#2c3e50" }}>
        <Row className="align-items-center text-light">
          <Col md={6} className="px-5">
            <h2>About Plastic Trade Hub</h2>
            <p>
              We are a leading platform for trading plastics. Whether you are
              looking to buy, sell, or recycle plastics, we provide a secure and
              reliable platform to connect you with trusted partners.
            </p>
            <Button
              variant="light"
              style={{ color: "#333" }}
              href="https://www.omtraders.org/"
              target="_blank"
            >
              Learn More
            </Button>
          </Col>
          <Col md={6} className="px-5">
            <img
              src="https://via.placeholder.com/400x300"
              alt="About Us"
              className="img-fluid rounded"
            />
          </Col>
        </Row>
      </Container>

      {/* Call-to-Action Section */}
      <Container className="py-5 text-center">
        <h3>Start Trading Today</h3>
        <p>Sign up now and explore our platform for sustainable plastic trading.</p>
        <Button
          variant="success"
          style={{ backgroundColor: currentColors.button, border: "none" }}
          href="/customer/orders"
        >
          Get Started
        </Button>
      </Container>
      {/* Footer Section */}
      <footer
        style={{
          backgroundColor: currentColors.footer,
          color: currentColors.text,
          padding: "20px 0",
          textAlign: "center",
          borderTop: `1px solid ${currentColors.border}`,
        }}
      >
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Om Traders. All Rights Reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
