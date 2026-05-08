import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MapPage from "./pages/MapPage";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUser = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);

    window.location.href = "/";
  };

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="/">🚲 BikeStop</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link href="/mappa">Mappa</Nav.Link>

              {!isLoggedIn ? (
                <>
                  <Nav.Link href="/login">Login</Nav.Link>
                  <Nav.Link href="/register">Registrati</Nav.Link>
                </>
              ) : (
                <Button variant="outline-danger" size="sm" className="ms-2" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={checkUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mappa" element={<MapPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
