import React, { useState } from "react";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router";

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
      await axios.post("http://localhost:5000/api/auth/register", formData);

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Errore durante la registrazione");
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <Card style={{ width: "500px" }} className="p-4 shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Crea un account</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome Utente</Form.Label>
              <Form.Control type="text" name="username" placeholder="es. MarcoBike92" value={username} onChange={onChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" placeholder="nome@esempio.it" value={email} onChange={onChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="Minimo 6 caratteri" value={password} onChange={onChange} required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Tipo di account</Form.Label>
              <Form.Select name="role" value={role} onChange={onChange}>
                <option value="user">Ciclista (Privato)</option>
                <option value="business">Attività (Officina/Noleggio)</option>
              </Form.Select>
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              Registrati ora
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
