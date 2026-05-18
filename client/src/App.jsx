import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Container } from "react-bootstrap";
import MyNavbar from "./components/MyNavbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MapPage from "./pages/MapPage";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
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
      <MyNavbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={checkUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mappa" element={<MapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
