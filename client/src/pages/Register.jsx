import React, { useState } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaUser, FaEnvelope, FaLock, FaStore } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router";
import API from "../api/api.js";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { username, email, password, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Errore durante la registrazione");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "90vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={5}>
          <Card className="border-0 shadow-lg" style={{ borderRadius: "15px", overflow: "hidden" }}>
            <div
              style={{
                backgroundColor: "#198754",
                height: "10px",
                width: "100%",
              }}
            />
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark">Crea un account</h2>
                <p className="text-muted">Unisciti alla community di ciclisti</p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 text-center" style={{ fontSize: "0.9rem" }}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Nome Utente</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaUser className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      className="bg-light border-start-0"
                      type="text"
                      name="username"
                      placeholder="es. MarcoBike92"
                      value={username}
                      onChange={onChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

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
                      placeholder="nome@esempio.it"
                      value={email}
                      onChange={onChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      className="bg-light border-start-0"
                      type="password"
                      name="password"
                      placeholder="Minimo 6 caratteri"
                      value={password}
                      onChange={onChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted">Tipo di account</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaStore className="text-muted" />
                    </InputGroup.Text>
                    <Form.Select className="bg-light border-start-0" name="role" value={role} onChange={onChange}>
                      <option value="user">Ciclista (Privato)</option>
                      <option value="business">Attività (Officina/Noleggio)</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2 fw-bold shadow-sm" style={{ borderRadius: "8px", letterSpacing: "0.5px" }}>
                  REGISTRATI ORA
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="small text-muted">
                  Hai già un account?{" "}
                  <Link to="/login" className="text-success fw-bold text-decoration-none">
                    Accedi
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

export default Register;
