import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Map, Share2, ShieldCheck, ChevronRight } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <div className="hero-section text-white d-flex align-items-center mb-5 mt-5">
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <span className="badge rounded-pill bg-success mb-3 px-3 py-2 text-uppercase fw-bold" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>
                🚴 Community Edition 2026
              </span>
              <h1 className="display-2 fw-bold mb-3 tracking-tight">
                Pedala. Trova. <span className="text-primary-gradient">Condividi.</span>
              </h1>
              <p className="lead mb-5 opacity-75 fs-4">
                La mappa collaborativa definitiva per ciclisti. <br className="d-none d-md-block" />
                Trova fontanelle, officine e punti di ricarica in un click.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-column flex-sm-row">
                <Button variant="primary" size="lg" className="btn-modern px-5 py-3 shadow-lg" onClick={() => navigate("/mappa")}>
                  Esplora la Mappa <ChevronRight className="ms-2" size={20} />
                </Button>
                <Button variant="outline-light" size="lg" className="btn-modern-outline px-5 py-3" onClick={() => navigate("/register")}>
                  Unisciti a noi
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
        {/* Elemento decorativo di sfondo opzionale */}
        <div className="hero-overlay"></div>
      </div>

      {/* FEATURES SECTION */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold h1">Perché scegliere BikeStop?</h2>
          <p className="text-muted">Progettato da ciclisti, per ciclisti.</p>
        </div>
        <Row className="g-4">
          {[
            {
              icon: <Map size={40} />,
              title: "Mappa Interattiva",
              text: "Dati in tempo reale con filtri intelligenti per ogni tua esigenza.",
              color: "text-primary",
              bg: "bg-primary-light",
            },
            {
              icon: <Share2 size={40} />,
              title: "Community Driven",
              text: "Ogni segnalazione conta. Aggiungi nuovi punti e scatta foto ai BikeStop.",
              color: "text-success",
              bg: "bg-success-light",
            },
            {
              icon: <ShieldCheck size={40} />,
              title: "Affidabilità",
              text: "Sistema di verifica incrociata: se la community dice che funziona, funziona.",
              color: "text-warning",
              bg: "bg-warning-light",
            },
          ].map((feature, idx) => (
            <Col md={4} key={idx}>
              <Card className="feature-card h-100 border-0 shadow-sm p-4">
                <Card.Body>
                  <div className={`icon-box ${feature.bg} ${feature.color} mb-4`}>{feature.icon}</div>
                  <Card.Title className="fw-bold h4 mb-3">{feature.title}</Card.Title>
                  <Card.Text className="text-muted fs-6 lh-lg">{feature.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* COMMUNITY STATS SECTION */}
      <div className="bg-light py-5 border-top border-bottom">
        <Container>
          <Row className="text-center g-4">
            <Col xs={6} md={3}>
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-dark mb-0">1.2k+</h2>
                <p className="text-muted small text-uppercase fw-semibold">Punti mappati</p>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-primary-gradient mb-0">450</h2>
                <p className="text-muted small text-uppercase fw-semibold">Fontanelle Attive</p>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-dark mb-0">8.5k</h2>
                <p className="text-muted small text-uppercase fw-semibold">Verifiche effettuate</p>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-dark mb-0">320</h2>
                <p className="text-muted small text-uppercase fw-semibold">Utenti attivi</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* FINAL CALL TO ACTION */}
      <Container className="py-5 my-5">
        <div className="bg-dark text-white p-5 rounded-5 shadow-lg text-center position-relative overflow-hidden">
          {/* Un tocco di design: un cerchio sfumato sullo sfondo */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: "radial-gradient(circle at top right, rgba(46, 204, 113, 0.15), transparent)",
              pointerEvents: "none",
            }}
          ></div>

          <div className="position-relative" style={{ zIndex: 1 }}>
            <h2 className="display-5 fw-bold mb-3">Pronto a metterti in sella?</h2>
            <p className="lead mb-4 opacity-75">Unisciti a migliaia di ciclisti e rendi le tue uscite più sicure e piacevoli.</p>
            <Button variant="primary" size="lg" className="btn-modern px-5 py-3 fw-bold" onClick={() => navigate("/mappa")}>
              Inizia ora, è gratis!
            </Button>
          </div>
        </div>
      </Container>

      {/* FOOTER MINIMALE */}
      <footer className="bg-white border-top py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <p className="text-muted mb-0 small">
                © 2026 <strong>BikeStop</strong>. Mappa collaborativa per ciclisti.
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
              <small className="text-muted">Made with ❤️ for the cycling community</small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
