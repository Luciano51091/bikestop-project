// Importiamo React e gli Hook fondamentali:
// - useEffect: per eseguire codice all'avvio del componente
// - useState: per creare uno stato (variabile reattiva) in React

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
  // 1. STATO DELL'AUTENTICAZIONE
  // useState(false) crea una variabile 'isLoggedIn' che parte da 'false' (utente non loggato)
  // setIsLoggedIn è la funzione che usiamo per aggiornare questo stato
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. FUNZIONE DI CONTROLLO DEL TOKEN
  // Legge il localStorage per verificare se esiste già un token di autenticazione salvato
  const checkUser = () => {
    const token = localStorage.getItem("token");

    // !!token converte il valore in un booleano:
    setIsLoggedIn(!!token);
  };

  // 3. EFFETTO ALL'AVVIO (Lifecycle)
  // useEffect viene eseguito una sola volta quando il componente viene montato sullo schermo.
  // L'array delle dipendenze vuoto [] alla fine indica di eseguirlo SOLO al primo avvio.
  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    // <Router> avvolge tutta l'app abilitando la navigazione SPA (Single Page Application)
    <Router>
      {/* Passiamo lo stato e la funzione di logout alla Navbar tramite le Props */}
      <MyNavbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

      {/* Contenitore di layout per dare i giusti margini a tutte le pagine */}
      <Container>
        {/* <Routes> contiene la lista di tutte le pagine disponibili nell'app */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Passiamo 'checkUser' a Login così, quando il login ha successo, l'app sa che deve aggiornare lo stato */}
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
