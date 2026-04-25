import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Map, Share2, ShieldCheck } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <div
        className="bg-dark text-white py-5 mb-5 rounded-4 shadow-lg overflow-hidden position-relative"
        style={{ background: "linear-gradient(45deg, #1a1a1a 30%, #2c3e50 100%)" }}
      >
        <Container className="py-5 text-center">
          <h1 className="display-3 fw-bold mb-3">Pedala. Trova. Condividi.</h1>
          <p className="lead mb-4 text-secondary">La mappa collaborativa per i ciclisti urbani. Trova fontanelle, officine e punti di ricarica in un click.</p>
          <Button variant="primary" size="lg" className="px-5 py-3 fw-bold shadow" onClick={() => navigate("/mappa")}>
            Esplora la Mappa
          </Button>
        </Container>
      </div>

      {/* FEATURES SECTION */}
      <Container className="mb-5">
        <Row className="g-4 text-center">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-3">
              <Card.Body>
                <div className="text-primary mb-3">
                  <Map size={48} />
                </div>
                <Card.Title className="fw-bold">Mappa Interattiva</Card.Title>
                <Card.Text className="text-muted">Visualizza in tempo reale i punti di interesse intorno a te con dati sempre aggiornati.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-3">
              <Card.Body>
                <div className="text-success mb-3">
                  <Share2 size={48} />
                </div>
                <Card.Title className="fw-bold">Community Driven</Card.Title>
                <Card.Text className="text-muted">Contribuisci anche tu! Aggiungi nuovi BikeStop e aiuta altri ciclisti nella tua città.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-3">
              <Card.Body>
                <div className="text-warning mb-3">
                  <ShieldCheck size={48} />
                </div>
                <Card.Title className="fw-bold">Affidabilità</Card.Title>
                <Card.Text className="text-muted">Punti verificati dalla community per garantirti sempre il miglior supporto durante il viaggio.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
