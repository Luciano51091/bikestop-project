import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert, Modal, Button, Form, ButtonGroup } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import axios from "axios";
import { MapPin, Droplets, Wrench, Zap, Coffee, Filter } from "lucide-react";
import { useNavigate } from "react-router";
const RecenterMap = ({ stops }) => {
  const map = useMapEvents({});
  useEffect(() => {
    map.invalidateSize();
  }, [stops, map]);
  return null;
};

// Componente per centrare la mappa sulla posizione dell'utente
const LocateUser = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 15);
  }, [coords, map]);
  return null;
};

const MapPage = () => {
  const [stops, setStops] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoords, setNewCoords] = useState({ lat: null, lng: null });
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", category: "fontanella" });
  const [activeCategory, setActiveCategory] = useState("all");

  const navigate = useNavigate();

  const fetchStops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bikestops");
      setStops(res.data);
      setFilteredStops(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // 1. FILTRI
  const filterCategory = (cat) => {
    if (cat === "all") setFilteredStops(stops);
    else setFilteredStops(stops.filter((s) => s.category === cat));
  };

  // 2. GEOLOCALIZZAZIONE
  const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
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
    if (!token) return alert("Devi essere loggato per aggiungere un punto!");

    try {
      await axios.post(
        "http://localhost:5000/api/bikestops",
        {
          ...formData,
          latitude: newCoords.lat,
          longitude: newCoords.lng,
        },
        {
          headers: { "x-auth-token": token },
        },
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
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Mappa BikeStop</h2>
        <Button variant="outline-primary" onClick={getMyLocation}>
          📍 Trovami
        </Button>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3 overflow-auto pb-2" style={{ whiteSpace: "nowrap" }}>
        <span className="text-muted me-2">
          <Filter size={18} />
        </span>

        {[
          { id: "all", label: "Tutti", icon: <MapPin size={16} />, color: "secondary" },
          { id: "fontanella", label: "Fontanelle", icon: <Droplets size={16} />, color: "info" },
          { id: "officina", label: "Officine", icon: <Wrench size={16} />, color: "warning" },
          { id: "ricarica-ebike", label: "E-Bike", icon: <Zap size={16} />, color: "success" },
          { id: "bar", label: "Ristoro", icon: <Coffee size={16} />, color: "danger" },
        ].map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? cat.color : `outline-${cat.color}`}
            onClick={() => {
              setActiveCategory(cat.id);
              filterCategory(cat.id);
            }}
            className="rounded-pill d-flex align-items-center gap-2 px-3 shadow-sm border-0"
            style={{ fontSize: "0.9rem", transition: "all 0.3s" }}
          >
            {cat.icon} {cat.label}
          </Button>
        ))}
      </div>

      <div className="shadow rounded" style={{ height: "70vh" }}>
        <MapContainer center={[41.9028, 12.4964]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
          <LocateUser coords={userLocation} />

          {filteredStops.map((stop) => (
            <Marker key={stop._id} position={[stop.location.coordinates[1], stop.location.coordinates[0]]}>
              <Popup>
                <div className="text-center">
                  <strong>{stop.name}</strong>
                  <br />
                  <small>{stop.category}</small>
                  <br />
                  {/* 3. PORTAMI QUI (Google Maps) */}
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="mt-2"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${stop.location.coordinates[1]},${stop.location.coordinates[0]}`}
                    target="_blank"
                  >
                    Portami qui
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi nuovo BikeStop</Modal.Title>
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
                <option value="fontanella">Fontanella</option>
                <option value="officina">Officina</option>
                <option value="ricarica-ebike">Ricarica E-Bike</option>
                <option value="bar">Bar / Ristoro</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrizione</Form.Label>
              <Form.Control as="textarea" rows={2} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Salva Punto
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MapPage;
