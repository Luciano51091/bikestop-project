import React, { useEffect, useState, useMemo } from "react";
import { Spinner, Modal, Button, Form, Card } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import axios from "axios";
import { MapPin, Droplets, Wrench, Zap, Coffee, AlertTriangle, Sun } from "lucide-react";
import { useNavigate } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Componente per centrare la mappa sulla posizione dell'utente
const LocateUser = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 15);
    }
  }, [coords, map]);
  return null;
};

const MapPage = () => {
  const [stops, setStops] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoords, setNewCoords] = useState({ lat: null, lng: null });
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", category: "fontanella" });

  const navigate = useNavigate();

  const filteredStops = useMemo(() => {
    if (activeCategory === "all") return stops;
    return stops.filter((s) => s.category === activeCategory);
  }, [activeCategory, stops]);

  // const filteredStops = useMemo(() => {
  //   console.log("Categoria Attiva:", activeCategory);
  //   console.log("Tutti gli Stop nel DB:", stops);

  //   if (activeCategory === "all") return stops;

  //   const filtrati = stops.filter((s) => {
  //     // Puliamo le stringhe per sicurezza: togliamo spazi e rendiamo minuscolo
  //     return s.category.trim().toLowerCase() === activeCategory.trim().toLowerCase();
  //   });

  //   console.log("Risultati dopo il filtro:", filtrati);
  //   return filtrati;
  // }, [activeCategory, stops]);

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
      (err) => {
        console.error(err);
        alert("Attiva il GPS o dai i permessi al browser");
      },
      { timeout: 10000 }, // Aspetta massimo 10 secondi
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/bikestops",
        { ...formData, latitude: newCoords.lat, longitude: newCoords.lng },
        { headers: { "x-auth-token": token } },
      );
      setShowModal(false);
      setFormData({ name: "", description: "", category: "fontanella" });
      fetchStops();
    } catch (err) {
      alert("Errore nel salvataggio");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div style={{ position: "relative", height: "calc(100vh - 70px)", width: "100%", overflow: "hidden" }}>
      <MapContainer center={[41.9028, 12.4964]} zoom={12} style={{ height: "100%", width: "100%", zIndex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        <MapEvents />
        <LocateUser coords={userLocation} />

        {/* 🔵 POSIZIONE UTENTE */}
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

        {/* 📍 MARKER DEI PUNTI */}
        {filteredStops.map(
          (stop) =>
            stop.location?.coordinates && (
              <Marker key={stop._id} position={[stop.location.coordinates[1], stop.location.coordinates[0]]}>
                <Popup>
                  <div className="text-center">
                    <strong>{stop.name}</strong>
                    <br />
                    <small>{stop.description}</small>
                    <br />

                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-2 rounded-pill"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stop.location.coordinates[1]},${stop.location.coordinates[0]}`}
                      target="_blank"
                    >
                      Portami qui
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>

      {/* ELEMENTI FLOATING UI */}
      <Card className="position-absolute shadow border-0 p-2" style={{ top: "20px", right: "20px", zIndex: 1000, background: "rgba(255,255,255,0.9)" }}>
        <div className="d-flex align-items-center gap-2">
          <Sun className="text-warning" size={20} />
          <span className="small fw-bold">Palermo 22°C</span>
        </div>
      </Card>

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
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-pill d-flex align-items-center gap-2 border-0 px-3"
              style={{ fontSize: "0.8rem" }}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* MODALE INSERIMENTO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nuovo BikeStop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" required onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoria</Form.Label>
              <Form.Select onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="fontanella">Fontanelle</option>
                <option value="officina">Officine</option>
                <option value="ricarica-ebike">Ricarica E-Bike</option>
                <option value="bar">Bar / Ristoro</option>
                <option value="pericolo">⚠️ Pericolo</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrizione</Form.Label>
              <Form.Control as="textarea" rows={2} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 rounded-pill">
              Salva
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MapPage;
