import React, { useEffect, useState, useMemo } from "react";
// Aggiunto Offcanvas e Badge alle importazioni
import { Spinner, Modal, Button, Form, Image, Offcanvas, Badge } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import axios from "axios";
import { MapPin, Droplets, Wrench, Zap, AlertTriangle, Camera, MessageSquare, Navigation } from "lucide-react";
import { useNavigate } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingControl from "../components/RoutingControl";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbql5hkcb/image/upload";
const UPLOAD_PRESET = "bikestop_preset";

// --- CONTROLLER MAPPA ---
const MapController = ({ stops, userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) map.flyTo([userLocation.lat, userLocation.lng], 15, { animate: true });
  }, [userLocation, map]);

  useEffect(() => {
    if (stops && stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((s) => [s.location.coordinates[1], s.location.coordinates[0]]));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true });
    }
  }, [stops, map]);
  return null;
};

const MapPage = () => {
  const [stops, setStops] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoords, setNewCoords] = useState({ lat: null, lng: null });
  const [userLocation, setUserLocation] = useState(null);

  // --- NUOVI STATI PER DETTAGLI ---
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);

  const [formData, setFormData] = useState({ name: "", description: "", category: "fontanella", hazardType: "" });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [destination, setDestination] = useState(null);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();

  const fetchStops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bikestops");
      setStops(res.data);
      // Se l'offcanvas è aperto, aggiorna i dati del punto selezionato (per vedere i nuovi commenti)
      if (selectedStop) {
        const updated = res.data.find((s) => s._id === selectedStop._id);
        setSelectedStop(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchStops();
  }, [navigate]);

  const filteredStops = useMemo(() => {
    if (activeCategory === "all") return stops;
    return stops.filter((s) => s.category === activeCategory);
  }, [activeCategory, stops]);

  const categories = [
    { id: "all", label: "Tutti", icon: <MapPin size={16} />, color: "secondary" },
    { id: "fontanella", label: "Fontanelle", icon: <Droplets size={16} />, color: "info" },
    { id: "officina", label: "Officine", icon: <Wrench size={16} />, color: "warning" },
    { id: "ricarica-ebike", label: "E-Bike", icon: <Zap size={16} />, color: "success" },
    { id: "pericolo", label: "Pericolo", icon: <AlertTriangle size={16} />, color: "danger" },
  ];

  const getMyLocation = () => {
    if (!navigator.geolocation) return alert("GPS non supportato");
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => alert("Attiva il GPS"),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setNewCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowModal(true);
      },
    });
    return null;
  };

  const getCategoryIcon = (category) => {
    const iconColors = { fontanella: "#0dcaf0", officina: "#ffc107", "ricarica-ebike": "#198754", pericolo: "#dc3545" };
    const color = iconColors[category] || "#6c757d";
    const icons = {
      fontanella:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>',
      officina:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
      "ricarica-ebike":
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>',
      pericolo:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
    };
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); color: white; display: flex;">${icons[category] || "📍"}</div></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const token = localStorage.getItem("token");
    let imageUrl = "";
    try {
      if (imageFile) {
        const data = new FormData();
        data.append("file", imageFile);
        data.append("upload_preset", UPLOAD_PRESET);
        const uploadRes = await axios.post(CLOUDINARY_URL, data);
        imageUrl = uploadRes.data.secure_url;
      }
      const finalName = formData.category === "pericolo" ? `Pericolo: ${formData.hazardType}` : formData.name;
      await axios.post(
        "http://localhost:5000/api/bikestops",
        { ...formData, name: finalName, latitude: newCoords.lat, longitude: newCoords.lng, imageUrl: imageUrl },
        { headers: { "x-auth-token": token } },
      );
      setShowModal(false);
      setFormData({ name: "", description: "", category: "fontanella", hazardType: "" });
      setImageFile(null);
      fetchStops();
    } catch (err) {
      alert("Errore nel salvataggio");
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (stopId) => {
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/bikestops/${stopId}/comment`, { text: commentText }, { headers: { "x-auth-token": token } });
      setCommentText("");
      fetchStops(); // Aggiorna la lista (e quindi lo selectedStop)
    } catch (err) {
      alert("Errore");
    }
  };

  const updateStatus = async (id, newStatus, newHazardType = null) => {
    if (newHazardType === "risolto") {
      await deleteStop(id);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/bikestops/${id}/status`,
        { status: newStatus, hazardType: newHazardType },
        { headers: { "x-auth-token": token } },
      );
      fetchStops();
    } catch (err) {
      alert("Errore");
    }
  };

  const deleteStop = async (id) => {
    if (!window.confirm("Rimuovere?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/bikestops/${id}`, { headers: { "x-auth-token": token } });
      setShowDetails(false);
      fetchStops();
    } catch (err) {
      alert("Errore");
    }
  };

  const handleCalculateRoute = (coords) => {
    if (userLocation) {
      setDestination([coords[1], coords[0]]);
      setShowDetails(false);
    } else alert("Attiva GPS!");
  };

  const handleOpenGoogleMaps = (coords) => {
    const [lng, lat] = coords;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=bicycling`;
    window.open(url, "_blank");
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div style={{ position: "relative", height: "calc(100vh - 70px)", width: "100%", overflow: "hidden" }}>
      <MapContainer center={[41.9028, 12.4964]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        <MapEvents />
        <MapController stops={filteredStops} userLocation={userLocation} />

        {userLocation && destination && <RoutingControl key={`${userLocation.lat}-${destination[0]}`} userLocation={userLocation} destination={destination} />}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: "custom-pos",
              html: `<div style="background-color:#007bff; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          />
        )}

        {filteredStops.map((stop) => (
          <Marker key={stop._id} position={[stop.location.coordinates[1], stop.location.coordinates[0]]} icon={getCategoryIcon(stop.category)}>
            <Popup>
              <div className="text-center">
                <h6>{stop.name}</h6>
                {stop.imageUrl && <Image src={stop.imageUrl} fluid rounded className="mb-2" style={{ maxHeight: "50px" }} />}
                <Button
                  size="sm"
                  variant="primary"
                  className="w-100 rounded-pill"
                  onClick={() => {
                    setSelectedStop(stop);
                    setShowDetails(true);
                  }}
                >
                  Vedi Dettagli
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* PULSANTE MIA POSIZIONE */}
      <Button
        className="position-absolute shadow-lg rounded-circle border-0 p-3"
        style={{ bottom: "100px", right: "20px", zIndex: 1000, backgroundColor: "white" }}
        onClick={getMyLocation}
      >
        <MapPin className="text-primary" />
      </Button>

      {/* BARRA LATERALE DETTAGLI (OFFCANVAS) */}
      <Offcanvas show={showDetails} onHide={() => setShowDetails(false)} placement="end" style={{ width: "380px" }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">{selectedStop?.name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedStop?.imageUrl && (
            <Image src={selectedStop.imageUrl} fluid rounded className="mb-3 shadow-sm w-100" style={{ height: "200px", objectFit: "cover" }} />
          )}

          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold">Descrizione</h6>
            <p>{selectedStop?.description || "Nessuna descrizione aggiuntiva."}</p>
            <Badge bg="light" text="dark" className="border">
              {selectedStop?.category}
            </Badge>
          </div>

          <div className="d-grid gap-2 mb-4">
            <Button
              variant="primary"
              className="rounded-pill d-flex align-items-center justify-content-center gap-2"
              onClick={() => handleCalculateRoute(selectedStop.location.coordinates)}
            >
              <Navigation size={18} /> Portami Qui
            </Button>

            {/* navigazione esterna con Google Maps */}
            <Button
              variant="outline-dark"
              className="rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm"
              onClick={() => handleOpenGoogleMaps(selectedStop.location.coordinates)}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" alt="GMaps" style={{ width: "18px" }} /> Naviga con
              Google Maps
            </Button>

            {/* Gestione Stato nel Pannello */}
            {(selectedStop?.category === "fontanella" || selectedStop?.category === "ricarica-ebike") && (
              <div className="p-3 bg-light rounded border mt-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Stato: {selectedStop.status === "broken" ? "⚠️ Guasto" : "✅ Funzionante"}</span>
                </div>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-success" className="flex-grow-1" onClick={() => updateStatus(selectedStop._id, "active")}>
                    Attivo
                  </Button>
                  <Button size="sm" variant="outline-danger" className="flex-grow-1" onClick={() => updateStatus(selectedStop._id, "broken")}>
                    Guasto
                  </Button>
                </div>
              </div>
            )}
          </div>

          <hr />

          {/* SEZIONE COMMENTI MIGLIORATA */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <MessageSquare size={20} className="text-primary" />
            <h6 className="mb-0">Commenti ({selectedStop?.comments?.length || 0})</h6>
          </div>

          <div className="comment-section mb-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {selectedStop?.comments?.length > 0 ? (
              selectedStop.comments.map((c, i) => (
                <div key={i} className="mb-3 p-2 bg-light rounded shadow-sm border-start border-primary border-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-bold">{c.userName}</span>
                    <span className="text-muted">{new Date(c.date).toLocaleDateString()}</span>
                  </div>
                  <div className="small text-dark">{c.text}</div>
                </div>
              ))
            ) : (
              <p className="text-muted small text-center">Ancora nessun commento. Sii il primo!</p>
            )}
          </div>

          <Form.Group className="mt-auto">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Scrivi un commento..."
              className="mb-2"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button variant="outline-primary" className="w-100 rounded-pill" onClick={() => handleAddComment(selectedStop._id)}>
              Invia Commento
            </Button>
          </Form.Group>
        </Offcanvas.Body>
      </Offcanvas>

      {/* MODALE AGGIUNGI PUNTO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi Punto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 text-center">
              <label htmlFor="file-upload" className="btn btn-outline-primary rounded-pill w-100 p-3 border-dashed shadow-sm" style={{ borderStyle: "dashed" }}>
                <Camera className="me-2" /> {imageFile ? "Foto pronta!" : "Carica Foto"}
              </label>
              <input id="file-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setImageFile(e.target.files[0])} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Categoria</Form.Label>
              <Form.Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="fontanella">Fontanella</option>
                <option value="officina">Officina</option>
                <option value="ricarica-ebike">Ricarica E-Bike</option>
                <option value="pericolo">⚠️ Segnala Pericolo</option>
              </Form.Select>
            </Form.Group>

            {formData.category !== "pericolo" && (
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Nome</Form.Label>
                <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Note / Descrizione</Form.Label>
              <Form.Control as="textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 rounded-pill py-2 shadow" disabled={uploading}>
              {uploading ? <Spinner size="sm" animation="border" /> : "Salva sulla Mappa"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* FILTRI CATEGORIE */}
      <div className="position-absolute w-100 d-flex justify-content-center" style={{ bottom: "30px", zIndex: 1000 }}>
        <div className="bg-white p-2 rounded-pill shadow d-flex gap-2 border px-3">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? cat.color : "light"}
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-pill px-3 shadow-sm border-0"
              style={{ fontSize: "0.8rem" }}
            >
              {cat.icon} <span className="ms-1 d-none d-md-inline">{cat.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
