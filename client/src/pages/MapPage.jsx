import React, { useEffect, useState, useMemo } from "react";
import { Spinner, Modal, Button, Form } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import axios from "axios";
import { MapPin, Droplets, Wrench, Zap, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingControl from "../components/RoutingControl";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix Icone Leaflet standard
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapController = ({ stops, userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
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
  const [formData, setFormData] = useState({ name: "", description: "", category: "fontanella", hazardType: "" });
  const [destination, setDestination] = useState(null);
  const [commentText, setCommentText] = useState("");

  const navigate = useNavigate();

  const fetchStops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bikestops");
      setStops(res.data);
    } catch (err) {
      console.error("Errore caricamento punti:", err);
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
    if (!navigator.geolocation) return alert("Geolocalizzazione non supportata");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => alert("Attiva il GPS per calcolare il percorso"),
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

  // --- FUNZIONE PER LE ICONE PERSONALIZZATE ---
  const getCategoryIcon = (category) => {
    const iconColors = {
      fontanella: "#0dcaf0",
      officina: "#ffc107",
      "ricarica-ebike": "#198754",
      pericolo: "#dc3545",
      bar: "#6f42c1",
    };
    const color = iconColors[category] || "#6c757d";

    const icons = {
      fontanella:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>',
      officina:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
      "ricarica-ebike":
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>',
      pericolo:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
    };

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
          <div style="transform: rotate(45deg); color: white; display: flex;">
            ${icons[category] || "📍"}
          </div>
        </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const finalName = formData.category === "pericolo" ? `Pericolo: ${formData.hazardType}` : formData.name;
    try {
      await axios.post(
        "http://localhost:5000/api/bikestops",
        { ...formData, name: finalName, latitude: newCoords.lat, longitude: newCoords.lng },
        { headers: { "x-auth-token": token } },
      );
      setShowModal(false);
      setFormData({ name: "", description: "", category: "fontanella", hazardType: "" });
      fetchStops();
    } catch (err) {
      alert("Errore nel salvataggio");
    }
  };

  const handleAddComment = async (stopId) => {
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/bikestops/${stopId}/comment`, { text: commentText }, { headers: { "x-auth-token": token } });
      setCommentText("");
      fetchStops();
    } catch (err) {
      alert("Errore nell'invio del commento");
    }
  };

  const updateStatus = async (id, newStatus, newHazardType = null) => {
    if (newHazardType === "risolto") {
      await deleteStop(id);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {};
      if (newStatus) payload.status = newStatus;
      if (newHazardType) payload.hazardType = newHazardType;
      await axios.patch(`http://localhost:5000/api/bikestops/${id}/status`, payload, { headers: { "x-auth-token": token } });
      fetchStops();
    } catch (err) {
      alert("Errore aggiornamento");
    }
  };

  const deleteStop = async (id) => {
    if (!window.confirm("Rimuovere definitivamente questo punto?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/bikestops/${id}`, { headers: { "x-auth-token": token } });
      fetchStops();
    } catch (err) {
      alert("Errore rimozione");
    }
  };

  const handleCalculateRoute = (coords) => {
    if (userLocation) {
      setDestination([coords[1], coords[0]]);
    } else {
      alert("Devi prima attivare la tua posizione!");
    }
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
          <Marker
            key={stop._id}
            position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
            icon={getCategoryIcon(stop.category)} // <--- USA LA FUNZIONE QUI
          >
            <Popup>
              <div style={{ minWidth: "180px" }} className="text-center">
                <strong>{stop.name}</strong>
                <br />
                <small>{stop.description}</small>
                <hr className="my-2" />
                <div style={{ maxHeight: "100px", overflowY: "auto", textAlign: "left" }} className="mb-2">
                  <h6 style={{ fontSize: "11px" }}>Commenti:</h6>
                  {stop.comments?.map((c, i) => (
                    <div key={i} className="small border-bottom mb-1">
                      <strong>{c.userName}:</strong> {c.text}
                    </div>
                  ))}
                </div>
                <Form.Control size="sm" placeholder="Commenta..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                <Button size="sm" variant="link" onClick={() => handleAddComment(stop._id)}>
                  Invia
                </Button>

                {(stop.category === "fontanella" || stop.category === "ricarica-ebike") && (
                  <div className="mt-2 border-top pt-2">
                    <div className={stop.status === "broken" ? "text-danger" : "text-success"}>{stop.status === "broken" ? "⚠️ Guasto" : "✅ Attivo"}</div>
                    <Button size="sm" variant="outline-success" className="me-1" onClick={() => updateStatus(stop._id, "active")}>
                      OK
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => updateStatus(stop._id, "broken")}>
                      Off
                    </Button>
                  </div>
                )}

                {stop.category === "pericolo" && (
                  <div className="mt-2 border-top pt-2">
                    <Form.Select size="sm" value={stop.hazardType} onChange={(e) => updateStatus(stop._id, null, e.target.value)}>
                      <option value="buca">Buca</option>
                      <option value="vetri">Vetri</option>
                      <option value="lavori">Lavori</option>
                      <option value="risolto">Risolto (Rimuovi)</option>
                    </Form.Select>
                  </div>
                )}

                {stop.category !== "pericolo" && (
                  <Button
                    size="sm"
                    variant="dark"
                    className="w-100 mt-2 rounded-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCalculateRoute(stop.location.coordinates);
                    }}
                  >
                    Calcola Percorso
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* UI CONTROLS */}
      <Button
        className="position-absolute shadow-lg rounded-circle border-0 p-3"
        style={{ bottom: "100px", right: "20px", zIndex: 1000, backgroundColor: "white" }}
        onClick={getMyLocation}
      >
        <MapPin className="text-primary" />
      </Button>

      <div className="position-absolute w-100 d-flex justify-content-center" style={{ bottom: "30px", zIndex: 1000 }}>
        <div className="bg-white p-2 rounded-pill shadow d-flex gap-2 border px-3">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? cat.color : "light"}
              onClick={() => {
                setActiveCategory(cat.id);
                setDestination(null);
              }}
              className="rounded-pill px-3"
              style={{ fontSize: "0.8rem" }}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* MODALE AGGIUNGI PUNTO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi Punto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Categoria</Form.Label>
              <Form.Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="fontanella">Fontanella</option>
                <option value="officina">Officina</option>
                <option value="ricarica-ebike">Ricarica</option>
                <option value="pericolo">⚠️ Pericolo</option>
              </Form.Select>
            </Form.Group>
            {formData.category !== "pericolo" && (
              <Form.Group className="mb-2">
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </Form.Group>
            )}
            {formData.category === "pericolo" && (
              <Form.Group className="mb-2">
                <Form.Label>Tipo</Form.Label>
                <Form.Select required value={formData.hazardType} onChange={(e) => setFormData({ ...formData, hazardType: e.target.value })}>
                  <option value="">Seleziona...</option>
                  <option value="buca">Buca</option>
                  <option value="vetri">Vetri</option>
                  <option value="lavori">Lavori</option>
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control as="textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Salva
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MapPage;
