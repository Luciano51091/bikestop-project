import L from "leaflet";
import "leaflet-routing-machine";
import { createControlComponent } from "@react-leaflet/core";

const createRoutingMachineLayer = (props) => {
  const { userLocation, destination } = props;

  // Verifichiamo che i dati siano validi
  if (!userLocation || !destination) return L.layerGroup();

  const instance = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.lat, userLocation.lng), // Partenza: Tua posizione
      L.latLng(destination[0], destination[1]), // Arrivo: Destinazione
    ],
    lineOptions: {
      styles: [{ color: "#007bff", weight: 6, opacity: 0.8 }],
      extendToWaypoints: true,
      missingRouteTolerance: 10,
    },
    show: false, // Nasconde il pannello testuale con le direzioni
    addWaypoints: false,
    routeWhileDragging: false,
    fitSelectedRoutes: true, // Zoom automatico sul percorso
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
      profile: "bicycle",
    }),
  });

  return instance;
};

// Il componente deve reagire al cambio delle props
const RoutingControl = createControlComponent(createRoutingMachineLayer);

export default RoutingControl;
