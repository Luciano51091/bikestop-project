import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner, Image, Modal, Form } from "react-bootstrap";
import { User, MapPin, CheckCircle, MessageSquare, Edit3, LogOut, Award, Calendar, Camera, Heart } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [myStops, setMyStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const resUser = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { "x-auth-token": token },
      });

      setUser(resUser.data);
      setNewUsername(resUser.data.username);

      const resStops = await axios.get("http://localhost:5000/api/bikestops/user/mystops", {
        headers: { "x-auth-token": token },
      });
      setMyStops(resStops.data);
    } catch (err) {
      console.error("Errore caricamento profilo", err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "bikestop_preset");

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/dbql5hkcb/image/upload", formData);
      const imageUrl = res.data.secure_url;
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/auth/update", { profileImage: imageUrl }, { headers: { "x-auth-token": token } });
      fetchProfileData();
      alert("Foto profilo aggiornata!");
    } catch (err) {
      alert("Errore caricamento immagine");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/auth/update", { username: newUsername }, { headers: { "x-auth-token": token } });
      setShowEditModal(false);
      fetchProfileData();
      alert("Username aggiornato!");
    } catch (err) {
      alert("Errore durante l'aggiornamento");
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  // Calcolo Badge basato sulle stats che arrivano dal backend
  const stats = user?.stats || { stopsCreated: 0, totalComments: 0, totalVerifications: 0 };

  return (
    <Container className="py-5">
      <Row>
        {/* INFO */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div style={{ height: "100px", background: "linear-gradient(135deg, #007bff 0%, #6610f2 100%)" }}></div>
            <Card.Body className="text-center" style={{ marginTop: "-50px" }}>
              <div className="mb-3 position-relative d-inline-block">
                <div className="bg-white p-1 rounded-circle shadow">
                  {user?.profileImage ? (
                    <Image src={user.profileImage} roundedCircle style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                  ) : (
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "100px", height: "100px" }}>
                      <User size={50} className="text-secondary" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profile-upload"
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "32px", height: "32px", cursor: "pointer", border: "2px solid white" }}
                >
                  {uploading ? <Spinner animation="border" size="sm" /> : <Camera size={16} />}
                </label>
                <input id="profile-upload" type="file" hidden onChange={handleImageUpload} />
              </div>

              <h4 className="fw-bold mb-1">{user?.username}</h4>
              <p className="text-muted small mb-3">{user?.email}</p>

              {/* BADGE */}
              <div className="d-flex justify-content-center gap-2 mb-4">
                {stats.stopsCreated >= 5 && (
                  <Badge bg="primary" className="rounded-pill px-3 py-2">
                    🚴 Ciclista Esperto
                  </Badge>
                )}
                {stats.totalVerifications > 0 && (
                  <Badge bg="success" className="rounded-pill px-3 py-2">
                    ✅ Verificatore
                  </Badge>
                )}
              </div>

              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => setShowEditModal(true)}>
                  <Edit3 size={16} className="me-2" /> Modifica
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* OBIETTIVI RIPRISTINATI */}
          <Card className="border-0 shadow-sm rounded-4 p-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <Award className="me-2 text-warning" /> Obiettivi
            </h6>
            <div className="d-flex flex-wrap gap-2">
              <div className={`p-2 rounded-circle ${stats.stopsCreated > 0 ? "bg-warning-subtle shadow-sm" : "bg-light opacity-50"}`} title="Pioniere">
                📍
              </div>
              <div
                className={`p-2 rounded-circle ${stats.totalVerifications >= 5 ? "bg-success-subtle shadow-sm" : "bg-light opacity-50"}`}
                title="Verificatore"
              >
                ✅
              </div>
              <div className={`p-2 rounded-circle ${stats.totalComments >= 5 ? "bg-info-subtle shadow-sm" : "bg-light opacity-50"}`} title="Social">
                💬
              </div>
            </div>
          </Card>
        </Col>

        {/* LATO DESTRO: CONTATORI  */}
        <Col lg={8}>
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="border-0 shadow-sm rounded-4 text-center p-3">
                <MapPin className="mx-auto mb-2 text-primary" size={28} />
                <h3 className="fw-bold mb-0">{stats.stopsCreated}</h3>
                <small className="text-muted fw-bold">Punti Creati</small>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="border-0 shadow-sm rounded-4 text-center p-3">
                <CheckCircle className="mx-auto mb-2 text-success" size={28} />
                <h3 className="fw-bold mb-0">{stats.totalVerifications}</h3>
                <small className="text-muted fw-bold">Verifiche</small>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="border-0 shadow-sm rounded-4 text-center p-3">
                <MessageSquare className="mx-auto mb-2 text-info" size={28} />
                <h3 className="fw-bold mb-0">{stats.totalComments}</h3>
                <small className="text-muted fw-bold">Commenti</small>
              </Card>
            </Col>
          </Row>

          {/* ---  I PUNTI CREATI  --- */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 py-3 d-flex align-items-center">
              <MapPin size={20} className="text-primary me-2" />
              <h5 className="fw-bold mb-0">I tuoi contributi (Punti creati)</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {myStops.length > 0 ? (
                myStops.map((stop) => (
                  <ListGroup.Item key={stop._id} className="py-3 px-4 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{stop.name}</div>
                      <small className="text-muted text-capitalize">
                        {stop.category} • {new Date(stop.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <Badge bg={stop.status === "active" ? "success" : "danger"} className="rounded-pill">
                      {stop.status === "active" ? "Attivo" : "Guasto"}
                    </Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <small>Non hai ancora creato nessun punto sulla mappa.</small>
                </div>
              )}
            </ListGroup>
          </Card>

          {/* SEZIONE PREFERITI  */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 py-3 d-flex align-items-center">
              <Heart size={20} className="text-danger me-2" fill="red" />
              <h5 className="fw-bold mb-0">I tuoi luoghi salvati</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {user?.favorites?.length > 0 ? (
                user.favorites.map((fav) => (
                  <ListGroup.Item key={fav._id} className="py-3 px-4 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{fav.name || "Punto senza nome"}</div>
                      <small className="text-muted text-capitalize">{fav.category}</small>
                    </div>
                    <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => navigate("/mappa")}>
                      Vai alla mappa
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <small>Nessun preferito salvato.</small>
                </div>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Profilo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateUsername}>
            <Form.Group className="mb-3">
              <Form.Label>Nuovo Username</Form.Label>
              <Form.Control type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 rounded-pill">
              Salva
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
