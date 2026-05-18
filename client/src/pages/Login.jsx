import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link, useSearchParams } from "react-router"; // Aggiunto useSearchParams
import API from "../api/api.js";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 👈 Serve per catturare il token al ritorno dal backend

  // EFFETTO 1: Se c'è già il token nel localStorage, vai alla mappa
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/mappa");
    }
  }, [navigate]);

  // EFFETTO 2: Intercetta il ritorno da Google quando il backend ti rispedisce qui con il token nell'URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);

      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate("/mappa"); // Ti manda alla mappa di BikeStop
    }
  }, [searchParams, navigate, onLoginSuccess]);

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      navigate("/mappa");
    } catch (err) {
      setError(err.response?.data?.msg || "Credenziali non valide");
      console.error("Errore Login:", err);
    }
  };

  // IL VECCHIO METODO FUNZIONANTE: Punta direttamente al tuo backend su Render!
  const handleGoogleLogin = () => {
    // Usa la variabile d'ambiente del tuo frontend che punta a Render (es: https://bikestop-backend.onrender.com/api/v1)
    // Se non usi le variabili d'ambiente per axios, puoi usare direttamente l'URL di Render fisso per testare
    window.location.href = `${import.meta.env.VITE_API_URL || "https://bikestop-backend.onrender.com/api"}/auth/google`;
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "85vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-lg" style={{ borderRadius: "15px", overflow: "hidden" }}>
            <div style={{ backgroundColor: "#0d6efd", height: "10px", width: "100%" }} />
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark">Bentornato</h2>
                <p className="text-muted small">Accedi per gestire i tuoi percorsi</p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 text-center small">
                  {error}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaEnvelope className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      className="bg-light border-start-0"
                      type="email"
                      name="email"
                      placeholder="la tua email"
                      value={email}
                      onChange={onChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      className="bg-light border-start-0"
                      type="password"
                      name="password"
                      placeholder="********"
                      value={password}
                      onChange={onChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                  style={{ borderRadius: "8px", gap: "10px" }}
                >
                  ACCEDI <FaArrowRight size={14} />
                </Button>

                {/* IL TUO NUOVO BOTTONE BOOTSTRAP REALE: Niente iframe, niente bug, largo uguale, adatta il raggio a 8px */}
                <Button
                  variant="light"
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-100 mt-3 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center border"
                  style={{ borderRadius: "8px", gap: "10px", backgroundColor: "#fff", color: "#757575" }}
                >
                  <FcGoogle size={20} /> Continua con Google
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="small text-muted">
                  Non hai ancora un account?{" "}
                  <Link to="/register" className="text-primary fw-bold text-decoration-none">
                    Registrati
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
