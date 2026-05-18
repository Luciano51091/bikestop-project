import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
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

  const loginConGoogleCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Token Google ottenuto:", tokenResponse);

        const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const datiUtenteGoogle = userInfoRes.data;
        console.log("Dati utente prelevati da Google:", datiUtenteGoogle);

        const res = await API.post("/auth/google", {
          email: datiUtenteGoogle.email,
          name: datiUtenteGoogle.name,
          googleId: datiUtenteGoogle.sub,
          avatar: datiUtenteGoogle.picture,

          token: tokenResponse.access_token,
        });

        localStorage.setItem("token", res.data.token);
        window.location.href = "/";
      } catch (error) {
        console.error("Errore durante il login con Google:", error);
        alert("Accesso con Google fallito. Riprova.");
      }
    },
    onError: () => console.log("Login Fallito con Google"),
  });

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
