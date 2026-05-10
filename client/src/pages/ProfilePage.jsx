import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner, Image } from "react-bootstrap";
import { User, MapPin, CheckCircle, MessageSquare, Edit3, LogOut, Award, Calendar, Camera, Heart } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userStops, setUserStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.put("http://localhost:5000/api/auth/update", { profileImage: imageUrl }, { headers: { "x-auth-token": token } });

      setUser(response.data);
      alert("Foto profilo aggiornata!");
    } catch (err) {
      console.error("Errore upload:", err);
      alert("Errore durante il caricamento");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { "x-auth-token": token },
        });
        setUser(userRes.data);

        const stopsRes = await axios.get("http://localhost:5000/api/bikestops", {
          headers: { "x-auth-token": token },
        });
        const myStops = stopsRes.data.filter((s) => s.userId === userRes.data._id);
        setUserStops(myStops);
      } catch (err) {
        console.error("Errore caricamento profilo", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

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

  return (
    <Container className="py-5">
      <Row>
        {/* --- COLONNA SINISTRA: CARD UTENTE --- */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
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
                <input id="profile-upload" type="file" hidden onChange={handleImageUpload} disabled={uploading} />
              </div>
              <h4 className="fw-bold mb-1">{user?.username}</h4>
              <p className="text-muted small mb-3">{user?.email}</p>

              <div className="d-flex justify-content-center gap-2 mb-4 badges">
                {user?.stats?.stopsCreated >= 5 && <span className="badge">🚴 Ciclista Esperto</span>}
                {user?.stats?.totalVerifications > 0 && <span className="badge">✅ Verificatore</span>}
              </div>

              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm" className="rounded-pill">
                  <Edit3 size={16} className="me-2" /> Modifica Profilo
                </Button>
                <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={handleLogout}>
                  <LogOut size={16} className="me-2" /> Logout
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* CARD PREMI/BADGE */}
          <Card className="border-0 shadow-sm rounded-4 mt-4 p-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <Award className="me-2 text-warning" /> Obiettivi Raggiunti
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {/* Badge Primo Punto */}
              <div
                className={`p-2 rounded-circle ${user?.stats?.stopsCreated > 0 ? "bg-warning-subtle" : "bg-light opacity-50"}`}
                title="Pioniere: Hai aggiunto il tuo primo punto"
              >
                📍
              </div>

              {/* Badge Verificatore */}
              <div
                className={`p-2 rounded-circle ${user?.stats?.totalVerifications >= 5 ? "bg-success-subtle" : "bg-light opacity-50"}`}
                title="Verificatore: 5 verifiche effettuate"
              >
                ✅
              </div>

              {/* Badge Chiacchierone */}
              <div
                className={`p-2 rounded-circle ${user?.stats?.totalComments >= 10 ? "bg-info-subtle" : "bg-light opacity-50"}`}
                title="Social: 10 commenti scritti"
              >
                💬
              </div>
            </div>
          </Card>
        </Col>

        {/* --- COLONNA DESTRA: STATISTICHE E ATTIVITÀ --- */}
        <Col lg={8}>
          {/* --- GRID STATISTICHE REAL-TIME --- */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="border-0 shadow-sm rounded-4 text-center p-3">
                <MapPin className="mx-auto mb-2 text-primary" size={28} />
                <h3 className="fw-bold mb-0">{user?.stats?.stopsCreated || 0}</h3>
                <small className="text-muted uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                  Punti Creati
                </small>
              </Card>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="border-0 shadow-sm rounded-4 text-center p-3">
                <CheckCircle className="mx-auto mb-2 text-success" size={28} />
                <h3 className="fw-bold mb-0">{user?.stats?.totalVerifications || 0}</h3>
                <small className="text-muted uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                  Verifiche
                </small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4 text-center p-3">
                <MessageSquare className="mx-auto mb-2 text-info" size={28} />
                <h3 className="fw-bold mb-0">{user?.stats?.totalComments || 0}</h3>
                <small className="text-muted uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                  Commenti
                </small>
              </Card>
            </Col>
          </Row>

          {/* LISTA PUNTI CREATI */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">I tuoi contributi alla mappa</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {userStops.length > 0 ? (
                  userStops.map((stop) => (
                    <ListGroup.Item key={stop._id} className="py-3 px-4 border-light d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div
                          className={`p-2 rounded-3 me-3 bg-opacity-10 ${stop.category === "pericolo" ? "bg-danger text-danger" : "bg-primary text-primary"}`}
                        >
                          <MapPin size={20} />
                        </div>
                        <div>
                          <div className="fw-bold">{stop.name}</div>
                          <div className="text-muted small d-flex align-items-center">
                            <Calendar size={12} className="me-1" />
                            {new Date(stop.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="light" size="sm" className="rounded-pill px-3" onClick={() => navigate("/")}>
                        Vedi
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>Non hai ancora aggiunto alcun punto sulla mappa.</p>
                    <Button variant="primary" size="sm" className="rounded-pill" onClick={() => navigate("/")}>
                      Inizia ora
                    </Button>
                  </div>
                )}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* --- SEZIONE PREFERITI --- */}
          <Card className="border-0 shadow-sm rounded-4 mt-4">
            <Card.Header className="bg-white border-0 py-3 d-flex align-items-center">
              <Heart size={20} className="text-danger me-2" fill="red" />
              <h5 className="fw-bold mb-0">I tuoi luoghi salvati</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {user?.favorites?.length > 0 ? (
                  user.favorites.map((fav) => (
                    <ListGroup.Item key={fav._id} className="py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{fav.name}</div>
                        <small className="text-muted text-capitalize">{fav.category}</small>
                      </div>
                      <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => navigate("/")}>
                        Vai alla mappa
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    <small>Non hai ancora salvato nessun preferito.</small>
                  </div>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
