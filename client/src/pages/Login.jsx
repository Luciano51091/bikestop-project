import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate, Link } from "react-router";
import API from "../api/api.js";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  // FUNZIONE DEFINITIVA: Genera il link di reindirizzamento OAuth ufficiale
  const handleGoogleRedirectLogin = () => {
    const clientId = "215645011601-eiqnstdc4enb9eeh2kql8ov0uku2sogl.apps.googleusercontent.com";

    // Rileva automaticamente se sei in locale o online su Vercel
    const redirectUri = window.location.hostname === "localhost" ? "http://localhost:5173/login" : "https://bikestop-project.vercel.app/login";

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` + // Ci restituisce direttamente l'access_token nell'URL al ritorno
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&prompt=select_account`; // Forza Google a chiedere QUALE account usare (niente box automatico!)

    // Reindirizza la pagina corrente a Google
    window.location.href = googleAuthUrl;
  };

  // Cattura l'access_token dall'URL quando Google ti rimanda sul tuo sito
  useEffect(() => {
    const catturaTokenDaUrl = async () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          try {
            // Mandiamo il token al tuo backend per fare il login
            const res = await API.post("/auth/google", { token: accessToken });
            localStorage.setItem("token", res.data.token);

            // Pulisce l'URL cancellando il token visibile per sicurezza
            window.history.replaceState({}, document.title, window.location.pathname);

            if (onLoginSuccess) onLoginSuccess();
            navigate("/mappa");
          } catch (err) {
            console.error("Errore durante il login sul backend:", err);
            setError("Autenticazione con Google fallita sul server.");
          }
        }
      }
    };

    catturaTokenDaUrl();
  }, [navigate, onLoginSuccess]);
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "85vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-lg" style={{ borderRadius: "15px", overflow: "hidden" }}>
            {/* Barra superiore decorativa blu/azzurra per differenziarlo dal Register verde */}
            <div
              style={{
                backgroundColor: "#0d6efd",
                height: "10px",
                width: "100%",
              }}
            />
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

                {/* 2. NUOVO PULSANTE REALE HTML: Identico, personalizzabile e stabile online */}
                <Button
                  variant="light"
                  type="button"
                  onClick={() => loginConGoogleCustom()}
                  className="w-100 mt-3 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center border"
                  style={{ borderRadius: "8px", gap: "10px", backgroundColor: "#fff", color: "#757575" }}
                >
                  <FcGoogle size={20} /> Accedi con Google
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
