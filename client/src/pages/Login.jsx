import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router";

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
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      navigate("/mappa");
    } catch (err) {
      setError(err.response?.data?.msg || "Errore durante il login");
      console.error("Errore Login:", err);
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <Card style={{ width: "400px" }} className="p-4 shadow border-0">
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold">Bentornato</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" placeholder="Inserisci la tua email" value={email} onChange={onChange} required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="********" value={password} onChange={onChange} required />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
              Accedi
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
