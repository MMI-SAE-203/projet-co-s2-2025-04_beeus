import { useState, useRef, useCallback, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locationVioletSvg from "../icons/location-violet.svg?url";
import locationYelowSvg from "../icons/location-yellow.svg?url";

export const placeIcon = L.icon({
  iconUrl: locationVioletSvg,
  iconSize: [20, 25],
  iconAnchor: [10, 25],
  popupAnchor: [0, -25],
});

export const eventIcon = L.icon({
  iconUrl: locationYelowSvg,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const defaultIcon = new L.Icon.Default();

const ICONS = {
  default: defaultIcon,
  place: placeIcon,
  event: eventIcon,
};

export function useMapLogic() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCenter, setCurrentCenter] = useState(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const mapContainerIdRef = useRef(null);

  const initializeMap = useCallback(
    (containerId, initialCoords, initialZoom) => {
      if (
        mapInstanceRef.current &&
        mapInstanceRef.current.getContainer().id === containerId
      ) {
        mapInstanceRef.current.setView(
          [initialCoords.lat, initialCoords.lon],
          initialZoom
        );
        return;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      mapContainerIdRef.current = containerId;

      try {
        const mapElement = document.getElementById(containerId);
        if (!mapElement || mapElement._leaflet_id) {
          console.warn(
            `Le conteneur de carte #${containerId} est introuvable ou déjà initialisé.`
          );
          return;
        }

        const map = L.map(containerId).setView(
          [initialCoords.lat, initialCoords.lon],
          initialZoom
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OSM contributors",
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        map.on("moveend zoomend", () => {
          if (!mapInstanceRef.current) return;
          const center = mapInstanceRef.current.getCenter();
          setCurrentCenter({ lat: center.lat, lon: center.lng });
        });
        setCurrentCenter(initialCoords);
      } catch (error) {
        console.error(
          `Échec de l'initialisation de la carte sur #${containerId} :`,
          error
        );
        const mapElement = document.getElementById(containerId);
        if (mapElement)
          mapElement.innerHTML = "Erreur d'initialisation de la carte.";
      }
    },
    []
  );

  const displayMarkers = useCallback((markersData = []) => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return [];
    markersLayerRef.current.clearLayers();
    const leafletMarkers = [];
    const validCoords = [];

    markersData.forEach((data) => {
      try {
        if (typeof data.lat !== "number" || typeof data.lon !== "number") {
          console.warn(
            "Marqueur ignoré à cause de coordonnées invalides :",
            data
          );
          return;
        }

        let chosenIcon = ICONS[data.iconType] || ICONS.default;

        const marker = L.marker([data.lat, data.lon], {
          icon: chosenIcon,
        }).bindPopup(data.popupContent || "", { maxWidth: 250 });

        leafletMarkers.push(marker);
        validCoords.push([data.lat, data.lon]);
      } catch (e) {
        console.error("Échec de création du marqueur pour :", data, e);
      }
    });

    leafletMarkers.forEach((m) => m.addTo(markersLayerRef.current));
    return validCoords;
  }, []);

  const setView = useCallback((coords, zoom) => {
    mapInstanceRef.current?.setView([coords.lat, coords.lon], zoom);
  }, []);

  const fitBounds = useCallback((coordsArray) => {
    if (
      !mapInstanceRef.current ||
      !Array.isArray(coordsArray) ||
      coordsArray.length === 0
    )
      return;
    try {
      const bounds = L.latLngBounds(coordsArray);
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 17,
        });
      } else {
        console.warn(
          "fitBounds ignoré : limites invalides générées à partir des coordonnées :",
          coordsArray
        );
      }
    } catch (e) {
      console.error("Impossible d'ajuster la vue sur les limites :", e);
    }
  }, []);

  const cleanupMap = useCallback(() => {
    mapInstanceRef.current?.remove();
    mapInstanceRef.current = null;
    markersLayerRef.current = null;
    mapContainerIdRef.current = null;
    console.log("Carte nettoyée.");
  }, []);

  // Ajout d'une fonction pour recentrer la carte sur une ville.
  // L'objet cityResult doit contenir les propriétés lat, lon et, par exemple, class ou type.
  const centerOnCity = useCallback(
    (cityResult) => {
      if (cityResult && cityResult.lat && cityResult.lon) {
        const lat = parseFloat(cityResult.lat);
        const lon = parseFloat(cityResult.lon);
        // On vérifie si le résultat indique un niveau administratif (ex: "city", "town", "administrative")
        const lowerType = cityResult.class
          ? cityResult.class.toLowerCase()
          : cityResult.type
          ? cityResult.type.toLowerCase()
          : "";
        const isCity =
          lowerType === "city" ||
          lowerType === "town" ||
          lowerType === "administrative";
        const zoom = isCity ? 13 : 16;
        setView({ lat, lon }, zoom);
        setCurrentCenter({ lat, lon });
      }
    },
    [setView]
  );

  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  return {
    isLoading,
    setIsLoading,
    currentCenter,
    initializeMap,
    displayMarkers,
    setView,
    fitBounds,
    centerOnCity, // Cette fonction est exposée pour recentrer la carte sur une ville.
  };
}
