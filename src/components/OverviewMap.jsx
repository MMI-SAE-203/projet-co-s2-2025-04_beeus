import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchAllActivitiesFromPB } from "../lib/pocketbase.mjs";
import { eventIcon, placeIcon } from "../lib/useMapLogic";

export default function EventMap() {
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [status, setStatus] = useState("Chargement de la carte...");

  useEffect(() => {
    async function initMapAndActivities() {
      const defaultCenter = [46.2276, 2.2137];
      const defaultZoom = 6;

      const map = L.map("event-map").setView(defaultCenter, defaultZoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapRef.current = map;

      markerLayerRef.current = L.layerGroup().addTo(map);

      const allData = await fetchAllActivitiesFromPB();
      const items = allData.filter((item) => item.adresse);

      const markers = [];

      for (const item of items) {
        const coord = await geocodeAddress(item.adresse);
        if (!coord) continue;

        const marker = L.marker([coord.lat, coord.lon], {
          icon: item.type === "event" ? eventIcon : placeIcon,
        });

        const label = item.nom || item.name || "Activité";
        const typePath = item.type === "event" ? "events" : "places";
        const popupHtml = `
          <div class="popup-content">
            <h3>${label}</h3>
            <p class="text-black">${item.adresse}</p>
            <a href="/${typePath}/${item.id}" class="text-blue-500 hover:underline">Voir plus</a>
          </div>`;

        marker.bindPopup(popupHtml);
        markers.push(marker);
      }

      if (markers.length > 0) {
        markers.forEach((m) => m.addTo(markerLayerRef.current));
        const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
        map.fitBounds(bounds, { padding: [50, 50] });
        setStatus(`${markers.length} éléments affichés.`);
      } else {
        setStatus("Aucun élément géolocalisé trouvé.");
      }
    }

    initMapAndActivities();
  }, []);

  async function geocodeAddress(adresse) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        adresse
      )}&limit=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  }

  return (
    <div className="w-full h-full">
      <h2 className="text-lg font-semibold mb-2 text-white">{status}</h2>
      <div
        id="event-map"
        className="w-full h-[70vh] rounded-lg border border-gray-700"
      />
    </div>
  );
}
