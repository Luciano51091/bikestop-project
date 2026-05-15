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

      const resUser = await axios.get(`http://localhost:5000/api/auth/me?t=${Date.now()}`, {
        headers: { "x-auth-token": token },
      });

      console.log("DATI RICEVUTI DALLA PROFILE PAGE:", resUser.data.stats);

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
    setLoading(true);
    fetchProfileData();

    window.addEventListener("focus", fetchProfileData);
    return () => {
      window.removeEventListener("focus", fetchProfileData);
    };
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  const stats = user?.stats || { stopsCreated: 0, totalComments: 0, totalVerifications: 0 };

  return (
    <Container className="py-5" style={{ maxWidth: "1000px" }}>
      <Row className="g-4">
        {/* COLONNA SINISTRA: CARD PROFILO */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            {/* Banner con gradiente moderno */}
            <div
              style={{
                height: "120px",
                background: "linear-gradient(45deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
              }}
            ></div>

            <Card.Body className="text-center pt-0">
              <div className="position-relative d-inline-block" style={{ marginTop: "-60px" }}>
                <div className="p-1 bg-white rounded-circle shadow-sm">
                  {user?.profileImage ? (
                    <Image src={user.profileImage} roundedCircle style={{ width: "110px", height: "110px", objectFit: "cover", border: "4px solid white" }} />
                  ) : (
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 shadow-sm"
                      style={{ width: "110px", height: "110px", border: "4px solid white" }}
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profile-upload"
                  className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle p-2 shadow border-white border-2"
                >
                  {uploading ? <Spinner animation="border" size="sm" /> : <Camera size={14} />}
                </label>
                <input id="profile-upload" type="file" hidden onChange={handleImageUpload} />
              </div>

              <div className="mt-3 px-2">
                <h4 className="fw-bold m-0">{user?.username}</h4>
                <p className="text-muted small mb-3">{user?.email}</p>

                {/* Status Badges */}
                <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                  {stats.stopsCreated >= 5 && (
                    <Badge bg="primary-subtle" className="text-primary rounded-pill border border-primary-subtle px-3 py-2">
                      🚴 Ciclista Pro
                    </Badge>
                  )}
                  {stats.totalVerifications > 0 && (
                    <Badge bg="success-subtle" className="text-success rounded-pill border border-success-subtle px-3 py-2">
                      🛡️ Verificatore
                    </Badge>
                  )}
                </div>
              </div>

              <div className="d-grid gap-2 mb-2">
                <Button variant="light" className="rounded-pill fw-bold border" onClick={() => setShowEditModal(true)}>
                  <Edit3 size={16} className="me-2" /> Modifica Profilo
                </Button>
                <Button variant="link" className="text-danger text-decoration-none small fw-bold" onClick={handleLogout}>
                  <LogOut size={16} className="me-2" /> Esci dal profilo
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Obiettivi (Versione minimal) */}
          <Card className="border-0 shadow-sm rounded-4 p-3 mt-4">
            <h6 className="fw-bold text-uppercase small text-muted mb-3"> Obiettivi</h6>
            <div className="d-flex justify-content-between text-center px-2">
              <div className={`p-3 rounded-4 ${stats.stopsCreated > 0 ? "bg-warning-subtle" : "bg-light"}`} style={{ width: "32%" }}>
                <span className="fs-3">📍</span>
                <div className="small fw-bold mt-1">Creator</div>
              </div>
              <div className={`p-3 rounded-4 ${stats.totalVerifications >= 5 ? "bg-success-subtle" : "bg-light"}`} style={{ width: "32%" }}>
                <span className="fs-3">🏅</span>
                <div className="small fw-bold mt-1">Elite</div>
              </div>
              <div className={`p-3 rounded-4 ${stats.totalComments >= 5 ? "bg-info-subtle" : "bg-light"}`} style={{ width: "32%" }}>
                <span className="fs-3">💬</span>
                <div className="small fw-bold mt-1">Social</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* COLONNA DESTRA */}
        <Col lg={8}>
          {/* Dashboard Stats */}
          <Row className="g-3 mb-4 text-center">
            {[
              { icon: <MapPin className="text-primary" />, label: "Contributi", val: stats.stopsCreated },
              { icon: <CheckCircle className="text-success" />, label: "Verifiche", val: stats.totalVerifications },
              { icon: <Heart className="text-danger" />, label: "Preferiti", val: user?.favorites?.length || 0 },
            ].map((item, idx) => (
              <Col key={idx} xs={4}>
                <div className="bg-white p-3 rounded-4 shadow-sm border h-100">
                  <div className="mb-1">{item.icon}</div>
                  <div className="h3 fw-bold m-0">{item.val}</div>
                  <div className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>
                    {item.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Sezioni Liste */}
          <div className="d-flex flex-column gap-4">
            <ContributionSection title="I tuoi punti sulla mappa" icon={<MapPin size={20} className="text-primary" />} items={myStops} isFavorite={false} />
            <ContributionSection
              title="Luoghi Salvati"
              icon={<Heart size={20} className="text-danger" fill="currentColor" />}
              items={user?.favorites}
              isFavorite={true}
              onAction={(stopId) => navigate("/mappa", { state: { focusStopId: stopId } })}
            />
          </div>
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

const ContributionSection = ({ title, icon, items, isFavorite, onAction }) => (
  <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
    <Card.Header className="bg-white py-3 border-bottom d-flex align-items-center">
      {icon}
      <h6 className="fw-bold mb-0 ms-2">{title}</h6>
    </Card.Header>
    <ListGroup variant="flush">
      {items?.length > 0 ? (
        items.map((item) => (
          <ListGroup.Item key={item._id} className="py-3 px-4 d-flex justify-content-between align-items-center bg-transparent border-bottom">
            <div className="text-truncate">
              <div className="fw-bold small">{item.name || "Punto senza nome"}</div>
              <div className="text-muted small text-capitalize">{item.category}</div>
            </div>
            {isFavorite ? (
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill px-3 fw-bold"
                style={{ fontSize: "0.75rem" }}
                onClick={() => onAction(item._id)}
              >
                Vedi in Mappa
              </Button>
            ) : (
              <Badge
                bg={item.status === "active" ? "success-subtle" : "danger-subtle"}
                className={`text-${item.status === "active" ? "success" : "danger"} rounded-pill border`}
              >
                {item.status === "active" ? "Attivo" : "Guasto"}
              </Badge>
            )}
          </ListGroup.Item>
        ))
      ) : (
        <div className="text-center py-5">
          <p className="text-muted mb-0 small">Ancora nulla da mostrare qui.</p>
        </div>
      )}
    </ListGroup>
  </Card>
);

export default ProfilePage;
