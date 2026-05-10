import L from "leaflet";
import "leaflet-routing-machine";
import { createControlComponent } from "@react-leaflet/core";

const createRoutingMachineLayer = (props) => {
  const { userLocation, destination } = props;

  if (!userLocation || !destination) return L.layerGroup();

  const instance = L.Routing.control({
    waypoints: [L.latLng(userLocation.lat, userLocation.lng), L.latLng(destination[0], destination[1])],
    lineOptions: {
      styles: [{ color: "#007bff", weight: 6, opacity: 0.8 }],
      extendToWaypoints: true,
      missingRouteTolerance: 10,
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    fitSelectedRoutes: true,
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
      profile: "bicycle",
    }),
  });

  return instance;
};

const RoutingControl = createControlComponent(createRoutingMachineLayer);

export default RoutingControl;
