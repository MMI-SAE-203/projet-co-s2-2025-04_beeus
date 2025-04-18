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
    // Force la réinitialisation du container
    const mapContainer = document.getElementById("event-map");
    if (mapContainer) {
      // Nettoyer le container avant l'initialisation
      mapContainer.innerHTML = "";

      // Ajout dynamique de style pour s'assurer que la carte est au premier plan
      // et peut recevoir les événements de souris
      mapContainer.style.position = "relative";
      mapContainer.style.zIndex = "999";
    }

    async function initMapAndActivities() {
      const defaultCenter = [46.2276, 2.2137];
      const defaultZoom = 6;

      // Utilisation de l'option zoomControl: true pour s'assurer que les contrôles sont bien activés
      const map = L.map("event-map", {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
      }).setView(defaultCenter, defaultZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Forcer l'activation de tous les contrôles
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.keyboard.enable();

      // Ajouter un évènement pour détecter si les clics fonctionnent
      map.on("click", function (e) {
        console.log("Carte cliquée à:", e.latlng);
      });

      mapRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);

      try {
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
          marker.bindPopup(`
            <div class="popup-content">
              <h3>${label}</h3>
              <p class="text-black">${item.adresse}</p>
              <a href="/activities/${item.id}" class="text-blue-500 hover:underline">Voir plus</a>
            </div>
          `);
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
      } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
        setStatus("Erreur lors du chargement des activités.");
      }
    }

    initMapAndActivities();

    return () => {
      if (mapRef.current) {
        // Nettoyage propre de la carte
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  async function geocodeAddress(adresse) {
    try {
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
    } catch (error) {
      console.error("Erreur de géocodage:", error);
      return null;
    }
  }

  return (
    <div className="w-full h-full">
      <h2 className="text-lg font-semibold mb-2 text-white">{status}</h2>
      <div
        id="event-map"
        className="w-full h-[70vh] rounded-lg border border-gray-700"
        style={{
          position: "relative",
          zIndex: 999,
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
