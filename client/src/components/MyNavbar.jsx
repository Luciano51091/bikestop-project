import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { User } from "lucide-react";

const MyNavbar = ({ isLoggedIn, handleLogout }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🚲 BikeStop
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/mappa">
              Mappa
            </Nav.Link>

            {!isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Registrati
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
                  <User size={18} className="me-1" /> Profilo
                </Nav.Link>

                <Button variant="outline-danger" size="sm" className="ms-3 rounded-pill" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
