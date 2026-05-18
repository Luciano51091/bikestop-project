import React, { useEffect, useState, useRef } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router";
import API from "../api/api.js";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Riferimento per fare clic programmaticamente sul pulsante invisibile di Google
  const googleAuthRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/mappa");
    }
  }, [navigate]);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      console.log("Token di Google ricevuto (quello originario funzionante):", googleToken);

      const res = await API.post("/auth/google", {
        token: googleToken,
      });

      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (error) {
      console.error("Errore durante il login con Google sul backend:", error);
      alert("Accesso con Google fallito. Riprova.");
    }
  };

  const handleGoogleError = () => {
    console.log("Login Fallito con Google");
  };

  // Funzione che simula il clic sul vero pulsante di Google quando clicchi sul tuo custom
  const attivaLoginGoogleLocale = () => {
    if (googleAuthRef.current) {
      // Cerca l'iframe o il bottone nativo di Google dentro il nostro div contenitore e lo clicca
      const divPulsanteNativo = googleAuthRef.current.querySelector('[role="button"]');
      if (divPulsanteNativo) {
        divPulsanteNativo.click();
      } else {
        // Fallback se la struttura interna è protetta
        const qualsiasiElementoCliccabile = googleAuthRef.current.querySelector("div");
        if (qualsiasiElementoCliccabile) qualsiasiElementoCliccabile.click();
      }
    }
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

                {/* 1. IL TUO PULSANTE PERSONALE: Graficamente perfetto e con border-radius a 8px */}
                <Button
                  variant="light"
                  type="button"
                  onClick={attivaLoginGoogleLocale}
                  className="w-100 mt-3 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center border"
                  style={{ borderRadius: "8px", gap: "10px", backgroundColor: "#fff", color: "#757575" }}
                >
                  <FcGoogle size={20} /> Accedi con Google
                </Button>

                {/* 2. IL PULSANTE DI GOOGLE ORIGINALE: Completamente nascosto alla vista (display: none) */}
                <div ref={googleAuthRef} style={{ display: "none" }}>
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} />
                </div>
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
