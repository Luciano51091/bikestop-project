import React from "react";
// Importiamo i componenti di layout da React-Bootstrap per la Navbar responsive
import { Container, Navbar, Nav, Button } from "react-bootstrap";
// Importiamo Link e NavLink da React Router per la navigazione senza ricaricare la pagina
import { Link, NavLink } from "react-router";
// Importiamo le icone grafiche da Lucide React
import { User, Map, LogOut, UserPlus, LogIn } from "lucide-react";

// COMPONENTE LOCALE: BikeStopLogo
// È un piccolissimo componente funzionale che disegna l'icona del logo usando un codice vettoriale SVG.
const BikeStopLogo = () => (
  <div className="d-flex align-items-center justify-content-center bg-success shadow-sm me-2" style={{ width: "38px", height: "36px", borderRadius: "10px" }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
        fill="white"
      />
      <path d="M11 8H13V10H11V8Z" fill="white" />
    </svg>
  </div>
);

// COMPONENTE PRINCIPALE: MyNavbar
// Riceve due PROPS destrutturate da App.jsx:
const MyNavbar = ({ isLoggedIn, handleLogout }) => {
  return (
    // <Navbar> è il contenitore principale.
    // expand="lg" menu hamburger su schermi piccoli
    <Navbar
      expand="lg"
      className="py-3 sticky-top shadow-sm"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #eee",
      }}
    >
      <Container>
        {/* BRAND: Cliccando sul logo si torna alla Home ('/') */}
        {/* as={Link} dice a React-Bootstrap di comportarsi come un Link di React Router */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold text-dark fs-4">
          <BikeStopLogo />
          <span style={{ letterSpacing: "-1px", color: "#1a1a1a" }}>
            Bike<span className="text-success">Stop</span>
          </span>
        </Navbar.Brand>

        {/* Pulsante Hamburger per dispositivi mobili */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

        {/* Menu comprimibile */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {/* LINK MAPPA: Sempre visibile sia per utenti ospiti che autenticati */}
            {/* NavLink permette di rilevare se la rotta è attiva tramite la funzione ({ isActive }) */}
            <Nav.Link
              as={NavLink}
              to="/mappa"
              className={({ isActive }) => `px-3 fw-medium d-flex align-items-center ${isActive ? "text-success" : "text-secondary"}`}
            >
              <Map size={18} className="me-2" /> Mappa
            </Nav.Link>

            {/* OPERATORE TERNARIO: RENDERING CONDIZIONALE */}
            {/* !isLoggedIn ? (Mostra pulsanti per ospiti) : (Mostra pulsanti per utenti loggati) */}
            {!isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/login" className="text-secondary fw-medium px-3">
                  <LogIn size={18} className="me-2" /> Accedi
                </Nav.Link>
                <Button as={Link} to="/register" variant="success" className="rounded-pill px-4 fw-bold shadow-sm ms-2" style={{ fontSize: "0.9rem" }}>
                  <UserPlus size={18} className="me-2 mb-1" /> Registrati
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/profile"
                  className={({ isActive }) => `px-3 fw-medium d-flex align-items-center ${isActive ? "text-success" : "text-secondary"}`}
                >
                  <User size={18} className="me-1" /> Profilo
                </Nav.Link>

                <div className="vr mx-2 d-none d-lg-block" style={{ height: "20px" }}></div>

                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-2 rounded-pill px-3 border-0 d-flex align-items-center"
                  onClick={handleLogout}
                  style={{ transition: "0.3s" }}
                >
                  <LogOut size={16} className="me-1" /> Esci
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
