import React, { useEffect, useState, useMemo } from "react";
import { Spinner, Modal, Button, Form, Image, Offcanvas, Badge } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import axios from "axios";
import { MapPin, Droplets, Wrench, Zap, AlertTriangle, Camera, MessageSquare, Navigation, X, Heart, Coffee, Bed } from "lucide-react";
import { useNavigate } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingControl from "../components/RoutingControl";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbql5hkcb/image/upload";
const UPLOAD_PRESET = "bikestop_preset";

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
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", category: "fontanella", hazardType: "" });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [destination, setDestination] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const fetchStops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bikestops");
      setStops(res.data);
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
    { id: "bar", label: "Bar", icon: <Coffee size={16} />, color: "warning" },
    { id: "alloggio", label: "Alloggi", icon: <Bed size={16} />, color: "secondary" },
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
    const iconColors = {
      fontanella: "#0dcaf0",
      officina: "#ffc107",
      "ricarica-ebike": "#198754",
      pericolo: "#dc3545",
      bar: "#fd7e14",
      alloggio: "#6f42c1",
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
      bar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>',
      alloggio:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>',
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
      await refreshUser();
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
      await refreshUser();
      fetchStops();
    } catch (err) {
      alert("Errore");
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { "x-auth-token": token },
        });
        setCurrentUser(res.data);
      }
    } catch (err) {
      console.error("Errore refresh utente", err);
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

  const handleOpenDetails = (stop) => {
    setDestination(null);
    setSelectedStop(stop);
    setWeather(null);
    setShowDetails(true);

    const [lng, lat] = stop.location.coordinates;
    fetchWeather(lat, lng);
  };

  const handleShowDetails = (stop) => {
    handleOpenDetails(stop);
  };

  const handleReportIssue = async (id) => {
    if (!window.confirm("Vuoi segnalare un problema con questa sosta?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.patch(`http://localhost:5000/api/bikestops/${id}/status`, { status: "guasto" }, { headers: { "x-auth-token": token } });
      alert("Segnalazione inviata. Grazie per il contributo!");
      fetchStops();
    } catch (err) {
      console.error(err);
      alert("Errore durante la segnalazione");
    }
  };

  const handleCalculateRoute = (coords) => {
    const startRouting = (lat, lng) => {
      setDestination(null);
      setTimeout(() => {
        setDestination([coords[1], coords[0]]);
      }, 100);
      setShowDetails(false);
    };

    if (userLocation) {
      startRouting(userLocation.lat, userLocation.lng);
    } else {
      if (!navigator.geolocation) return alert("GPS non supportato dal tuo browser");

      console.log("Acquisizione posizione in corso per calcolo percorso...");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;

          setUserLocation({ lat: newLat, lng: newLng });
          startRouting(newLat, newLng);
        },
        (err) => {
          alert("Per calcolare il percorso è necessario autorizzare l'accesso al GPS.");
          console.error(err);
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    }
  };

  const handleOpenGoogleMaps = (coords) => {
    const [lng, lat] = coords;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=bicycling`;
    window.open(url, "_blank");
  };

  const handleVerify = async (id, isWorking) => {
    try {
      const token = localStorage.getItem("token");

      const statusValue = isWorking ? "works" : "broken";

      const res = await axios.patch(`http://localhost:5000/api/bikestops/${id}/verify`, { status: statusValue }, { headers: { "x-auth-token": token } });

      setSelectedStop(res.data);

      fetchStops();

      alert("Grazie per la tua segnalazione!");
    } catch (err) {
      console.error("Errore verifica:", err.response?.data?.msg || err.message);
      alert(err.response?.data?.msg || "Errore durante la verifica");
    }
  };

  const fetchWeather = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const API_KEY = "b79ca9a0eecfc64bd15a15f4c5946618";
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=it&appid=${API_KEY}`);
      setWeather(res.data);
    } catch (err) {
      console.error("Errore meteo:", err);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { "x-auth-token": token },
          });
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error("Errore recupero utente", err);
        if (err.response?.status === 500 || err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchUser();
  }, []);

  const handleToggleFavorite = async (stopId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Devi essere loggato!");

      const res = await axios.post(
        `http://localhost:5000/api/auth/favorite/${stopId}`,
        {},
        {
          headers: { "x-auth-token": token },
        },
      );

      setCurrentUser({ ...currentUser, favorites: res.data });
    } catch (err) {
      console.error(err);
      alert("Errore nell'aggiornamento dei preferiti");
    }
  };

  const isFavorite = currentUser?.favorites?.some((fav) => (typeof fav === "string" ? fav : fav._id) === selectedStop?._id);

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div style={{ position: "relative", height: "calc(100vh - 70px)", width: "100%", overflow: "hidden" }}>
      {/* TASTO CANCELLA PERCORSO */}
      {destination && (
        <Button
          variant="danger"
          size="sm"
          className="position-absolute shadow-lg d-flex align-items-center gap-1"
          style={{ top: "20px", left: "20px", zIndex: 1000, borderRadius: "20px", padding: "8px 15px" }}
          onClick={() => setDestination(null)}
        >
          <X size={16} /> Cancella Percorso
        </Button>
      )}

      <MapContainer center={[41.9028, 12.4964]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        <MapEvents />
        <MapController stops={filteredStops} userLocation={userLocation} />

        {userLocation && destination && (
          <RoutingControl key={`route-${destination[0]}-${destination[1]}`} userLocation={userLocation} destination={destination} />
        )}

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
              <div className="p-2" style={{ minWidth: "180px" }}>
                <h6 className="fw-bold mb-1">{stop.name}</h6>
                <p className="text-muted small mb-2 text-capitalize">{stop.category}</p>

                <hr className="my-2" />

                <div className="mb-3">
                  {stop.category === "pericolo" ? (
                    // --- LOGICA PER I PERICOLI ---
                    <>
                      <Button variant="outline-danger" size="sm" className="w-100 mb-1" onClick={() => handleVerify(stop._id, false)}>
                        🚫 Conferma Pericolo
                      </Button>
                      <Button variant="outline-dark" size="sm" className="w-100" onClick={() => updateStatus(stop._id, "active", "risolto")}>
                        ✅ Risolto/Rimosso
                      </Button>
                    </>
                  ) : (
                    // --- LOGICA PER FONTANELLE, RICARICA E OFFICINE ---
                    <>
                      <span className="d-block small fw-bold mb-1">Questa sosta è affidabile?</span>

                      {stop.category === "fontanella" || stop.category === "ricarica-ebike" ? (
                        <Button variant="outline-success" size="sm" className="w-100 mb-1" onClick={() => handleVerify(stop._id, true)}>
                          {stop.category === "fontanella" ? "💧 Funziona!" : "⚡ Funziona!"}
                        </Button>
                      ) : (
                        <Button variant="outline-success" size="sm" className="w-100 mb-1" onClick={() => handleVerify(stop._id, true)}>
                          🔧 Attiva/Aperta
                        </Button>
                      )}

                      <Button variant="outline-danger" size="sm" className="w-100" onClick={() => handleVerify(stop._id, false)}>
                        🚫 Segnala problema
                      </Button>
                    </>
                  )}
                </div>

                <Button variant="link" className="p-0 w-100 text-decoration-none small text-center" onClick={() => handleShowDetails(stop)}>
                  Vedi dettagli...
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <Button
        className="position-absolute shadow-lg rounded-circle border-0 p-3"
        style={{ bottom: "100px", right: "20px", zIndex: 1000, backgroundColor: "white" }}
        onClick={getMyLocation}
      >
        <MapPin className="text-primary" />
      </Button>

      <Offcanvas show={showDetails} onHide={() => setShowDetails(false)} placement="end" style={{ width: "380px" }}>
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold fs-4">{selectedStop?.name}</Offcanvas.Title>
          <Button variant="link" onClick={() => handleToggleFavorite(selectedStop._id)} className="p-0 text-danger">
            <Heart size={24} color={isFavorite ? "#ff4d4d" : "#6c757d"} fill={isFavorite ? "#ff4d4d" : "none"} style={{ transition: "all 0.3s ease" }} />
          </Button>
        </Offcanvas.Header>

        <Offcanvas.Body className="px-4 py-3">
          {/* --- 1. SEZIONE METEO --- */}
          <div className="weather-container">
            {weatherLoading ? (
              <div className="text-center py-4 mb-3 bg-light rounded-4 border border-dashed">
                <Spinner animation="border" size="sm" variant="info" />
              </div>
            ) : (
              weather && (
                <div
                  className="weather-widget d-flex align-items-center justify-content-between p-3 mb-4 rounded-4 shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)",
                    color: "white",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                      alt="meteo"
                      style={{ width: "50px", filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.5))" }}
                    />
                    <div className="ms-3">
                      <div className="fw-bold h3 mb-0">{Math.round(weather.main.temp)}°C</div>
                      <div className="small text-capitalize" style={{ opacity: 0.9 }}>
                        {weather.weather[0].description}
                      </div>
                    </div>
                  </div>
                  <div className="text-end border-start border-white border-opacity-25 ps-3">
                    <div className="small fw-bold text-uppercase" style={{ fontSize: "0.65rem", opacity: 0.8 }}>
                      Vento
                    </div>
                    <div className="h6 mb-0">{Math.round(weather.wind.speed * 3.6)} km/h</div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* --- 2. IMMAGINE --- */}
          {selectedStop?.imageUrl && (
            <div className="mb-4 text-center">
              <Image
                src={selectedStop.imageUrl}
                fluid
                rounded
                className="shadow-sm w-100"
                style={{ height: "220px", objectFit: "cover", borderRadius: "15px" }}
              />
            </div>
          )}

          {/* --- 3. WIDGET VERIFICA --- */}
          <div className="mb-4 p-3 bg-white rounded-4 border shadow-sm text-center">
            <small className="text-muted d-block mb-1">
              Ultima verifica: {selectedStop?.lastVerified ? new Date(selectedStop.lastVerified).toLocaleDateString() : "Mai verificato"}
            </small>
            <div className="fw-bold text-success mb-2">
              <span className="me-1">👍</span> {selectedStop?.verifications || 0} ciclisti confermano
            </div>
            <Button variant="success" size="sm" className="rounded-pill w-100 py-2" onClick={() => handleVerify(selectedStop?._id)}>
              Confermo, funziona!
            </Button>
          </div>

          {/* --- SEZIONE STATO (Funzionante / Guasto) --- */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3" style={{ letterSpacing: "1px" }}>
              Stato attuale
            </h6>
            <div className="d-flex gap-2">
              <Button
                variant={selectedStop?.status === "active" ? "success" : "outline-success"}
                className="flex-fill rounded-pill py-2 fw-bold"
                style={{ fontSize: "0.85rem" }}
                onClick={() => updateStatus(selectedStop._id, "active")}
              >
                ✅ Funzionante
              </Button>
              <Button
                variant={selectedStop?.status === "broken" ? "danger" : "outline-danger"}
                className="flex-fill rounded-pill py-2 fw-bold"
                style={{ fontSize: "0.85rem" }}
                onClick={() => updateStatus(selectedStop._id, "broken")}
              >
                ❌ Guasto
              </Button>
            </div>

            {selectedStop?.category === "pericolo" && (
              <Button
                variant="outline-dark"
                className="w-100 mt-2 rounded-pill border-dashed"
                size="sm"
                onClick={() => updateStatus(selectedStop._id, "active", "risolto")}
              >
                🎉 Segnala come risolto / rimosso
              </Button>
            )}
          </div>

          {/* --- 4. DESCRIZIONE --- */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-2" style={{ letterSpacing: "1px" }}>
              Descrizione
            </h6>
            <p className="text-dark" style={{ lineHeight: "1.6" }}>
              {selectedStop?.description || "Nessuna descrizione aggiuntiva."}
            </p>
            <div
              className="d-inline-block px-3 py-2 rounded-pill shadow-sm fw-bold text-white mb-3"
              style={{
                fontSize: "0.75rem",
                backgroundColor:
                  selectedStop?.category === "fontanella"
                    ? "#0dcaf0"
                    : selectedStop?.category === "officina"
                      ? "#ffc107"
                      : selectedStop?.category === "ricarica-ebike"
                        ? "#198754"
                        : selectedStop?.category === "pericolo"
                          ? "#dc3545"
                          : selectedStop?.category === "bar"
                            ? "#fd7e14"
                            : selectedStop?.category === "alloggio"
                              ? "#6f42c1"
                              : "#6c757d",
              }}
            >
              {selectedStop?.category ? selectedStop.category.charAt(0).toUpperCase() + selectedStop.category.slice(1).replace("-", " ").toLowerCase() : ""}
            </div>
          </div>

          {/* --- 5. AZIONI / NAVIGAZIONE --- */}
          <div className="d-grid gap-3 mb-5">
            <Button
              variant="primary"
              className="rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              onClick={() => handleCalculateRoute(selectedStop.location.coordinates)}
            >
              <Navigation size={18} /> Anteprima Percorso
            </Button>

            <Button
              variant="outline-dark"
              className="rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={() => handleOpenGoogleMaps(selectedStop.location.coordinates)}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" alt="GMaps" style={{ width: "18px" }} />
              Google Maps
            </Button>
          </div>

          <hr className="my-4 opacity-25" />

          {/* --- 6. COMMENTI --- */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <MessageSquare size={20} className="text-primary" />
            <h6 className="mb-0 fw-bold">Commenti ({selectedStop?.comments?.length || 0})</h6>
          </div>

          <div className="comment-section mb-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {selectedStop?.comments?.length > 0 ? (
              selectedStop.comments.map((c) => (
                <div key={c._id || c.date} className="mb-3 p-3 bg-light rounded-4 shadow-sm border-start border-primary border-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-bold">{c.userName}</span>
                    <span className="text-muted">{new Date(c.date).toLocaleDateString()}</span>
                  </div>
                  <div className="small text-dark">{c.text}</div>
                </div>
              ))
            ) : (
              <p className="text-muted small text-center py-3">Ancora nessun commento. Sii il primo!</p>
            )}
          </div>

          {/* --- 7. INPUT COMMENTO --- */}
          <Form.Group className="mt-3">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Scrivi un commento..."
              className="mb-2 rounded-3"
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
                <option value="bar">Bar Bike-Friendly</option>
                <option value="alloggio">B&B / Ostello</option>
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
