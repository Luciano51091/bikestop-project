import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router";
import API from "../api/api.js";

// COMPONENTE LOGIN: Riceve la prop 'onLoginSuccess' per aggiornare lo stato di autenticazione globale dell'app
const Login = ({ onLoginSuccess }) => {
  // STATO PER I DATI DEL FORM: Oggetto contenente email e password digitati dall'utente
  const [formData, setFormData] = useState({ email: "", password: "" });
  // STATO PER GLI ERRORI: Memorizza i messaggi di errore restituiti dal backend (es. "Credenziali non valide")
  const [error, setError] = useState("");
  // HOOK PER IL REINDIRIZZAMENTO: Permette di cambiare rotta via codice
  const navigate = useNavigate();

  // CONTROLLO SESSIONE ESISTENTE: Eseguito al primo rendering del componente
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/mappa");
    }
  }, [navigate]);

  // DESTRUCTURING: Estrae email e password dallo stato per usarle nei campi del form
  const { email, password } = formData;
  // GESTORE CAMBIAMENTO INPUT: Aggiorna lo stato in modo dinamico usando il "name" dell'input
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // INVIO FORM CLASSICO (Email + Password)
  const onSubmit = async (e) => {
    e.preventDefault(); // Previene il ricaricamento automatico della pagina
    setError("");

    try {
      const res = await API.post("/auth/login", formData); // Invia la richiesta HTTP POST al backend con i dati inseriti
      localStorage.setItem("token", res.data.token); // Salvataggio del Token JWT nel LocalStorage del browser

      // Notifica il componente padre (App.jsx) dell'avvenuto login per aggiornare la Navbar
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      navigate("/mappa");
    } catch (err) {
      // Gestione errore: mostra il messaggio inviato dal backend o un testo di fallback
      setError(err.response?.data?.msg || "Credenziali non valide");
      console.error("Errore Login:", err);
    }
  };

  // GESTORE LOGIN GOOGLE (Successo)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential; // Token restituito dal popup/widget di Google
      console.log("Token di Google ricevuto:", googleToken);

      // Invia il token di Google al nostro backend per la verifica ed eventuale registrazione/login
      const res = await API.post("/auth/google", {
        token: googleToken,
      });

      // Salva il token restituito dal nostro server e ricarica la pagina principale
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (error) {
      console.error("Errore durante il login con Google sul backend:", error);
      alert("Accesso con Google fallito. Riprova.");
    }
  };

  // GESTORE LOGIN GOOGLE (Errore)
  const handleGoogleError = () => {
    console.log("Login Fallito con Google");
  };

  return (
    // CONTAINER CENTRATO: Centra la scheda di login sia verticalmente (minHeight: 85vh) che orizzontalmente
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "85vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-lg" style={{ borderRadius: "15px", overflow: "hidden" }}>
            {/* Striscia blu decorativa superiore */}
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

              {/* FEEDBACK ERRORE: Mostra il box Alert di Bootstrap solo se lo stato 'error' contiene del testo */}
              {error && (
                <Alert variant="danger" className="py-2 text-center small">
                  {error}
                </Alert>
              )}

              {/* FORM DI AUTENTICAZIONE */}
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

                {/* CAMPO PASSWORD */}
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

                {/* PULSANTE SUBMIT CLASSICO */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                  style={{ borderRadius: "8px", gap: "10px" }}
                >
                  ACCEDI <FaArrowRight size={14} />
                </Button>

                {/* PULSANTE GOOGLE OAUTH */}
                {/* Contenitore ottimizzato per la larghezza al 100% */}
                <div
                  className="google-btn-wrapper mt-3 shadow-sm"
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" shape="square" width="100%" useOneTap={false} />
                </div>
              </Form>

              {/* LINK ALLA REGISTRAZIONE */}
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
